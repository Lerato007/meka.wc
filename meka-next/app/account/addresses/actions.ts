"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

function getField(formData: FormData, field: string) {
  return String(formData.get(field) ?? "").trim()
}

function getAddressFields(formData: FormData) {
  return {
    label: getField(formData, "label"),
    recipientName: getField(formData, "recipientName"),
    phone: getField(formData, "phone"),
    addressLine1: getField(formData, "addressLine1"),
    addressLine2: getField(formData, "addressLine2"),
    suburb: getField(formData, "suburb"),
    city: getField(formData, "city"),
    province: getField(formData, "province"),
    postalCode: getField(formData, "postalCode"),
  }
}

function hasMissingRequiredFields(
  fields: ReturnType<typeof getAddressFields>
) {
  return (
    !fields.label ||
    !fields.recipientName ||
    !fields.phone ||
    !fields.addressLine1 ||
    !fields.suburb ||
    !fields.city ||
    !fields.province ||
    !fields.postalCode
  )
}

async function getAuthenticatedCustomer(callbackUrl: string) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
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
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  }

  return customer
}

function refreshAddressPages() {
  revalidatePath("/account")
  revalidatePath("/account/addresses")
}

export async function createAddress(formData: FormData) {
  const fields = getAddressFields(formData)

  if (hasMissingRequiredFields(fields)) {
    redirect(
      "/account/addresses/new?error=Please%20complete%20all%20required%20fields."
    )
  }

  if (!/^\d{4}$/.test(fields.postalCode)) {
    redirect(
      "/account/addresses/new?error=Please%20enter%20a%20valid%204-digit%20postal%20code."
    )
  }

  const customer = await getAuthenticatedCustomer("/account/addresses/new")

  await prisma.address.create({
    data: {
      userId: customer.id,
      label: fields.label,
      recipientName: fields.recipientName,
      phone: fields.phone,
      addressLine1: fields.addressLine1,
      addressLine2: fields.addressLine2 || null,
      suburb: fields.suburb,
      city: fields.city,
      province: fields.province,
      postalCode: fields.postalCode,
      isDefault: customer._count.addresses === 0,
    },
  })

  refreshAddressPages()

  redirect("/account/addresses")
}

export async function updateAddress(
  addressId: string,
  formData: FormData
) {
  const editUrl = `/account/addresses/${addressId}/edit`
  const fields = getAddressFields(formData)

  if (hasMissingRequiredFields(fields)) {
    redirect(
      `${editUrl}?error=Please%20complete%20all%20required%20fields.`
    )
  }

  if (!/^\d{4}$/.test(fields.postalCode)) {
    redirect(
      `${editUrl}?error=Please%20enter%20a%20valid%204-digit%20postal%20code.`
    )
  }

  const customer = await getAuthenticatedCustomer(editUrl)

  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId: customer.id,
    },
    select: {
      id: true,
    },
  })

  if (!address) {
    redirect("/account/addresses")
  }

  await prisma.address.update({
    where: {
      id: address.id,
    },
    data: {
      label: fields.label,
      recipientName: fields.recipientName,
      phone: fields.phone,
      addressLine1: fields.addressLine1,
      addressLine2: fields.addressLine2 || null,
      suburb: fields.suburb,
      city: fields.city,
      province: fields.province,
      postalCode: fields.postalCode,
    },
  })

  refreshAddressPages()
  revalidatePath(editUrl)

  redirect("/account/addresses")
}

export async function setDefaultAddress(
  addressId: string,
  _formData: FormData
) {
  const customer = await getAuthenticatedCustomer("/account/addresses")

  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId: customer.id,
    },
    select: {
      id: true,
      isDefault: true,
    },
  })

  if (!address || address.isDefault) {
    refreshAddressPages()
    return
  }

  await prisma.$transaction([
    prisma.address.updateMany({
      where: {
        userId: customer.id,
      },
      data: {
        isDefault: false,
      },
    }),
    prisma.address.update({
      where: {
        id: address.id,
      },
      data: {
        isDefault: true,
      },
    }),
  ])

  refreshAddressPages()
}

export async function deleteAddress(
  addressId: string,
  _formData: FormData
) {
  const customer = await getAuthenticatedCustomer("/account/addresses")

  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId: customer.id,
    },
    select: {
      id: true,
      isDefault: true,
    },
  })

  if (!address) {
    refreshAddressPages()
    return
  }

  const replacementAddress = address.isDefault
    ? await prisma.address.findFirst({
        where: {
          userId: customer.id,
          id: {
            not: address.id,
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
        },
      })
    : null

  await prisma.$transaction(async (transaction) => {
    await transaction.address.delete({
      where: {
        id: address.id,
      },
    })

    if (replacementAddress) {
      await transaction.address.update({
        where: {
          id: replacementAddress.id,
        },
        data: {
          isDefault: true,
        },
      })
    }
  })

  refreshAddressPages()
}