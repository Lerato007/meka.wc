"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export type ProfileFormState = {
  error?: string
}

function cleanValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : ""
}

export async function updateProfile(
  _previousState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/account/profile")
  }

  const name = cleanValue(formData.get("name"))
  const phone = cleanValue(formData.get("phone"))

  if (name.length < 2) {
    return {
      error: "Please enter your full name.",
    }
  }

  if (name.length > 100) {
    return {
      error: "Your name cannot be longer than 100 characters.",
    }
  }

  if (phone) {
    const normalisedPhone = phone.replace(/[\s()-]/g, "")
    const validPhonePattern = /^\+?[0-9]{9,15}$/

    if (!validPhonePattern.test(normalisedPhone)) {
      return {
        error: "Please enter a valid phone number.",
      }
    }
  }

  const customer = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
    },
  })

  if (!customer) {
    return {
      error: "Your account could not be found.",
    }
  }

  await prisma.user.update({
    where: {
      id: customer.id,
    },
    data: {
      name,
      phone: phone || null,
    },
  })

  revalidatePath("/account")
  revalidatePath("/account/profile")

  redirect("/account/profile?updated=true")
}