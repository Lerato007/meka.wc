"use server"

import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { supabaseAdmin } from "@/lib/supabase-admin"

export type ProductImageFormState = {
  error?: string
  success?: string
}
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

async function uploadProductImages(
  productId: string,
  productName: string,
  images: File[],
  startingOrder = 0
) {
  const bucket =
    process.env.SUPABASE_STORAGE_BUCKET || "product-images"

  const uploadedPaths: string[] = []

  const uploadedImages: {
    url: string
    alt: string
    order: number
  }[] = []

  try {
    for (const [index, image] of images.entries()) {
      const safeName = sanitiseFileName(image.name)

      const uniqueFileName =
        `${crypto.randomUUID()}-${safeName}`

      const storagePath =
        `products/${productId}/${uniqueFileName}`

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
        alt: `${productName} image ${startingOrder + index + 1}`,
        order: startingOrder + index,
      })
    }

    if (uploadedImages.length > 0) {
      await prisma.productImage.createMany({
        data: uploadedImages.map((image) => ({
          productId,
          url: image.url,
          alt: image.alt,
          order: image.order,
        })),
      })
    }
  } catch (error) {
    if (uploadedPaths.length > 0) {
      await supabaseAdmin.storage
        .from(bucket)
        .remove(uploadedPaths)
    }

    throw error
  }
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

  let productId: string | null = null

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

  await uploadProductImages(
    product.id,
    name,
    images
  )
} catch (error) {
  console.error("Product creation failed:", error)

  if (productId) {
    await prisma.product
      .delete({
        where: {
          id: productId,
        },
      })
      .catch((deleteError) => {
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

export async function updateProduct(
  productId: string,
  previousState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    return {
      error: "You are not authorised to update products.",
    }
  }

  if (!productId) {
    return {
      error: "The product could not be identified.",
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

  if (
    !name ||
    !slug ||
    !description ||
    !categoryId ||
    !priceValue
  ) {
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

  const validSlug =
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)

  if (!validSlug) {
    return {
      error:
        "The slug may only contain lowercase letters, numbers and hyphens.",
    }
  }

  const existingProduct = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      slug: true,
    },
  })

  if (!existingProduct) {
    return {
      error: "The product no longer exists.",
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

  const productUsingSlug = await prisma.product.findFirst({
    where: {
      slug,
      id: {
        not: productId,
      },
    },
    select: {
      id: true,
    },
  })

  if (productUsingSlug) {
    return {
      error: "Another product already uses this slug.",
    }
  }

  try {
    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        name,
        slug,
        description,
        price: new Prisma.Decimal(priceValue),
        categoryId,
      },
    })
  } catch (error) {
    console.error("Product update failed:", error)

    return {
      error: "The product could not be updated. Please try again.",
    }
  }

  revalidatePath("/")
  revalidatePath("/admin/products")
  revalidatePath(`/admin/products/${productId}/edit`)

  revalidatePath(`/products/${existingProduct.slug}`)
  revalidatePath(`/products/${slug}`)

  redirect("/admin/products")
}

export async function addProductImages(
  productId: string,
  previousState: ProductImageFormState,
  formData: FormData
): Promise<ProductImageFormState> {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    return {
      error: "You are not authorised to upload product images.",
    }
  }

  if (!productId) {
    return {
      error: "The product could not be identified.",
    }
  }

  const images = formData
    .getAll("images")
    .filter(
      (entry): entry is File =>
        entry instanceof File && entry.size > 0
    )

  if (images.length === 0) {
    return {
      error: "Select at least one image.",
    }
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      images: {
        orderBy: {
          order: "desc",
        },
        take: 1,
        select: {
          order: true,
        },
      },
      _count: {
        select: {
          images: true,
        },
      },
    },
  })

  if (!product) {
    return {
      error: "The product no longer exists.",
    }
  }

  const remainingImageSlots =
    maximumImageCount - product._count.images

  if (remainingImageSlots <= 0) {
    return {
      error: `This product already has the maximum of ${maximumImageCount} images.`,
    }
  }

  if (images.length > remainingImageSlots) {
    return {
      error: `You can only upload ${remainingImageSlots} more ${
        remainingImageSlots === 1 ? "image" : "images"
      } for this product.`,
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

  const highestCurrentOrder =
    product.images[0]?.order ?? -1

  const startingOrder = highestCurrentOrder + 1

  try {
    await uploadProductImages(
      product.id,
      product.name,
      images,
      startingOrder
    )
  } catch (error) {
    console.error("Additional image upload failed:", error)

    return {
      error:
        error instanceof Error
          ? error.message
          : "The images could not be uploaded. Please try again.",
    }
  }

  revalidatePath("/admin/products")
  revalidatePath(`/admin/products/${product.id}/edit`)
  revalidatePath(`/products/${product.slug}`)
  revalidatePath("/")

  return {
    success: `${
      images.length === 1
        ? "1 image was"
        : `${images.length} images were`
    } uploaded successfully.`,
  }
}

export async function deleteProduct(productId: string) {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("You are not authorised to delete products.")
  }

  if (!productId) {
    throw new Error("The product could not be identified.")
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      slug: true,
      images: {
        select: {
          url: true,
        },
      },
    },
  })

  if (!product) {
    throw new Error("The product no longer exists.")
  }

  const bucket =
    process.env.SUPABASE_STORAGE_BUCKET || "product-images"

  const publicUrlPrefix =
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/`

  const storagePaths = product.images
    .map((image) => {
      if (!image.url.startsWith(publicUrlPrefix)) {
        return null
      }

      return image.url.replace(publicUrlPrefix, "")
    })
    .filter((path): path is string => Boolean(path))

  if (storagePaths.length > 0) {
    const { error: removalError } =
      await supabaseAdmin.storage
        .from(bucket)
        .remove(storagePaths)

    if (removalError) {
      console.error(
        "Failed to remove product images from storage:",
        removalError
      )

      throw new Error(
        "The product images could not be removed from storage."
      )
    }
  }

  try {
    await prisma.product.delete({
      where: {
        id: product.id,
      },
    })
  } catch (error) {
    console.error("Product deletion failed:", error)

    throw new Error(
      "The product could not be deleted. Please try again."
    )
  }

  revalidatePath("/admin/products")
  revalidatePath("/admin")
  revalidatePath("/")
  revalidatePath(`/products/${product.slug}`)
}

export async function deleteProductImage(imageId: string) {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("You are not authorised.")
  }

  const image = await prisma.productImage.findUnique({
    where: {
      id: imageId,
    },
    include: {
      product: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!image) {
    throw new Error("Image not found.")
  }

  const bucket =
    process.env.SUPABASE_STORAGE_BUCKET || "product-images"

  const publicUrlPrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/`

  let storagePath = ""

  if (image.url.startsWith(publicUrlPrefix)) {
    storagePath = image.url.replace(publicUrlPrefix, "")
  }

  if (storagePath) {
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([storagePath])

    if (error) {
      console.error(error)
    }
  }

  await prisma.productImage.delete({
    where: {
      id: image.id,
    },
  })

  revalidatePath(
    `/admin/products/${image.product.id}/edit`
  )
}