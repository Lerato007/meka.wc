"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export type CategoryFormState = {
  error?: string
}

export async function createCategory(
  previousState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    return {
      error: "You are not authorised to create categories.",
    }
  }

  const name = String(formData.get("name") ?? "").trim()

  if (!name) {
    return {
      error: "Enter a category name.",
    }
  }

  if (name.length < 2) {
    return {
      error: "The category name must contain at least 2 characters.",
    }
  }

  if (name.length > 50) {
    return {
      error: "The category name cannot exceed 50 characters.",
    }
  }

  const existingCategory = await prisma.category.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
    },
  })

  if (existingCategory) {
    return {
      error: "A category with this name already exists.",
    }
  }

  try {
    await prisma.category.create({
      data: {
        name,
      },
    })
  } catch (error) {
    console.error("Category creation failed:", error)

    return {
      error: "The category could not be created. Please try again.",
    }
  }

  revalidatePath("/admin")
  revalidatePath("/admin/categories")
  revalidatePath("/admin/products/new")

  redirect("/admin/categories")
}

export async function updateCategory(
  categoryId: string,
  previousState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    return {
      error: "You are not authorised to update categories.",
    }
  }

  const name = String(formData.get("name") ?? "").trim()

  if (!categoryId) {
    return {
      error: "The category could not be identified.",
    }
  }

  if (!name) {
    return {
      error: "Enter a category name.",
    }
  }

  if (name.length < 2) {
    return {
      error: "The category name must contain at least 2 characters.",
    }
  }

  if (name.length > 50) {
    return {
      error: "The category name cannot exceed 50 characters.",
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
      error: "The category no longer exists.",
    }
  }

  const duplicateCategory = await prisma.category.findFirst({
    where: {
      id: {
        not: categoryId,
      },
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
    },
  })

  if (duplicateCategory) {
    return {
      error: "A category with this name already exists.",
    }
  }

  try {
    await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        name,
      },
    })
  } catch (error) {
    console.error("Category update failed:", error)

    return {
      error: "The category could not be updated. Please try again.",
    }
  }

  revalidatePath("/admin")
  revalidatePath("/admin/categories")
  revalidatePath("/admin/products")
  revalidatePath("/admin/products/new")

  redirect("/admin/categories")
}