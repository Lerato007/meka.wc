"use server"

import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { supabaseAdmin } from "@/lib/supabase-admin"

export type ProductFormState = {
  error?: string
}

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
]

const maximumImageSize = 5 * 1024 * 1024
const maximumImageCount = 5

function sanitiseFileName(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg"

  const baseName = fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return `${baseName || "image"}.${extension}`
}

export async function createProduct(
  previousState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    return {
      error: "You are not authorised to create products.",
    }
  }

  const name = String(formData.get("name") ?? "").trim()

  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase()

  const description = String(
    formData.get("description") ?? ""
  ).trim()

  const categoryId = String(
    formData.get("categoryId") ?? ""
  ).trim()

  const priceValue = String(
    formData.get("price") ?? ""
  ).trim()

  const images = formData
    .getAll("images")
    .filter(
      (entry): entry is File =>
        entry instanceof File && entry.size > 0
    )

  if (!name || !slug || !description || !categoryId || !priceValue) {
    return {
      error: "Complete all required fields.",
    }
  }

  const price = Number(priceValue)

  if (!Number.isFinite(price) || price <= 0) {
    return {
      error: "Enter a valid product price greater than zero.",
    }
  }

  const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)

  if (!validSlug) {
    return {
      error:
        "The slug may only contain lowercase letters, numbers and hyphens.",
    }
  }

  if (images.length > maximumImageCount) {
    return {
      error: `Upload no more than ${maximumImageCount} images.`,
    }
  }

  for (const image of images) {
    if (!allowedImageTypes.includes(image.type)) {
      return {
        error: `${image.name} is not a supported image format.`,
      }
    }

    if (image.size > maximumImageSize) {
      return {
        error: `${image.name} is larger than 5 MB.`,
      }
    }
  }

  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    select: {
      id: true,
    },
  })

  if (!category) {
    return {
      error: "The selected category does not exist.",
    }
  }

  const existingProduct = await prisma.product.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  })

  if (existingProduct) {
    return {
      error: "A product with this slug already exists.",
    }
  }

  const bucket =
    process.env.SUPABASE_STORAGE_BUCKET || "product-images"

  let productId: string | null = null
  const uploadedPaths: string[] = []

  try {
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: new Prisma.Decimal(priceValue),
        categoryId,
      },
      select: {
        id: true,
      },
    })

    productId = product.id

    const uploadedImages: {
      url: string
      alt: string
      order: number
    }[] = []

    for (const [index, image] of images.entries()) {
      const safeName = sanitiseFileName(image.name)

      const uniqueFileName = `${crypto.randomUUID()}-${safeName}`

      const storagePath =
        `products/${product.id}/${uniqueFileName}`

      const arrayBuffer = await image.arrayBuffer()

      const { error: uploadError } =
        await supabaseAdmin.storage
          .from(bucket)
          .upload(storagePath, arrayBuffer, {
            contentType: image.type,
            cacheControl: "3600",
            upsert: false,
          })

      if (uploadError) {
        throw new Error(
          `Failed to upload ${image.name}: ${uploadError.message}`
        )
      }

      uploadedPaths.push(storagePath)

      const { data: publicUrlData } =
        supabaseAdmin.storage
          .from(bucket)
          .getPublicUrl(storagePath)

      uploadedImages.push({
        url: publicUrlData.publicUrl,
        alt: `${name} image ${index + 1}`,
        order: index,
      })
    }

    if (uploadedImages.length > 0) {
      await prisma.productImage.createMany({
        data: uploadedImages.map((image) => ({
          productId: product.id,
          url: image.url,
          alt: image.alt,
          order: image.order,
        })),
      })
    }
  } catch (error) {
    console.error("Product creation failed:", error)

    if (uploadedPaths.length > 0) {
      const { error: removalError } =
        await supabaseAdmin.storage
          .from(bucket)
          .remove(uploadedPaths)

      if (removalError) {
        console.error(
          "Failed to remove uploaded files:",
          removalError
        )
      }
    }

    if (productId) {
      await prisma.product.delete({
        where: {
          id: productId,
        },
      }).catch((deleteError) => {
        console.error(
          "Failed to remove incomplete product:",
          deleteError
        )
      })
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : "The product could not be created. Please try again.",
    }
  }

  revalidatePath("/admin/products")
  revalidatePath("/")
  revalidatePath(`/products/${slug}`)

  redirect("/admin/products")
}