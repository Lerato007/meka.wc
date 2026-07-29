"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

function getRequiredField(formData: FormData, field: string) {
  return String(formData.get(field) ?? "").trim()
}

export async function createAddress(formData: FormData) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/account/addresses/new")
  }

  const label = getRequiredField(formData, "label")
  const recipientName = getRequiredField(formData, "recipientName")
  const phone = getRequiredField(formData, "phone")
  const addressLine1 = getRequiredField(formData, "addressLine1")
  const addressLine2 = getRequiredField(formData, "addressLine2")
  const suburb = getRequiredField(formData, "suburb")
  const city = getRequiredField(formData, "city")
  const province = getRequiredField(formData, "province")
  const postalCode = getRequiredField(formData, "postalCode")

  if (
    !label ||
    !recipientName ||
    !phone ||
    !addressLine1 ||
    !suburb ||
    !city ||
    !province ||
    !postalCode
  ) {
    redirect(
      "/account/addresses/new?error=Please complete all required fields."
    )
  }

  const customer = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
      _count: {
        select: {
          addresses: true,
        },
      },
    },
  })

  if (!customer) {
    redirect("/login?callbackUrl=/account/addresses/new")
  }

  await prisma.address.create({
    data: {
      userId: customer.id,
      label,
      recipientName,
      phone,
      addressLine1,
      addressLine2: addressLine2 || null,
      suburb,
      city,
      province,
      postalCode,
      isDefault: customer._count.addresses === 0,
    },
  })

  revalidatePath("/account")
  revalidatePath("/account/addresses")

  redirect("/account/addresses")
}