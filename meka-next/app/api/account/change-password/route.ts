import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

type ChangePasswordBody = {
  currentPassword?: unknown
  newPassword?: unknown
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be signed in.",
        },
        {
          status: 401,
        }
      )
    }

    const body =
      (await request.json()) as ChangePasswordBody

    if (
      typeof body.currentPassword !== "string" ||
      typeof body.newPassword !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request.",
        },
        {
          status: 400,
        }
      )
    }

    const currentPassword = body.currentPassword
    const newPassword = body.newPassword

    if (!currentPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter your current password.",
        },
        {
          status: 400,
        }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your new password must be at least 8 characters long.",
        },
        {
          status: 400,
        }
      )
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your new password must be different from your current password.",
        },
        {
          status: 400,
        }
      )
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        password: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User account not found.",
        },
        {
          status: 404,
        }
      )
    }

    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This account does not currently have a password. Sign in with Google or use Forgot Password to create one.",
        },
        {
          status: 400,
        }
      )
    }

    const currentPasswordMatches =
      await bcrypt.compare(
        currentPassword,
        user.password
      )

    if (!currentPasswordMatches) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your current password is incorrect.",
        },
        {
          status: 400,
        }
      )
    }

    const newPasswordMatchesCurrent =
      await bcrypt.compare(
        newPassword,
        user.password
      )

    if (newPasswordMatchesCurrent) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your new password must be different from your current password.",
        },
        {
          status: 400,
        }
      )
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      12
    )

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    })

    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
      },
    })

    return NextResponse.json({
      success: true,
      message:
        "Your password has been updated successfully.",
    })
  } catch (error) {
    console.error(
      "Failed to change account password:",
      error
    )

    return NextResponse.json(
      {
        success: false,
        message:
          "We could not update your password. Please try again.",
      },
      {
        status: 500,
      }
    )
  }
}