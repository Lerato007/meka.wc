import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

import { prisma } from "@/lib/prisma"
import { hashPasswordResetToken } from "@/lib/auth/password-reset"

type ResetPasswordBody = {
  token?: unknown
  password?: unknown
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ResetPasswordBody

    if (
      typeof body.token !== "string" ||
      typeof body.password !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request.",
        },
        { status: 400 }
      )
    }

    const token = body.token.trim()
    const password = body.password

    if (token.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid reset token.",
        },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must be at least 8 characters long.",
        },
        { status: 400 }
      )
    }

    const tokenHash = hashPasswordResetToken(token)

    const resetToken =
      await prisma.passwordResetToken.findUnique({
        where: {
          tokenHash,
        },
        include: {
          user: true,
        },
      })

    if (!resetToken) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This password reset link is invalid.",
        },
        { status: 400 }
      )
    }

    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({
        where: {
          id: resetToken.id,
        },
      })

      return NextResponse.json(
        {
          success: false,
          message:
            "This password reset link has expired.",
        },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12
    )

    console.log("Resetting password for:", resetToken.user.email)
console.log("New password:", password)

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: resetToken.userId,
        },
        data: {
          password: hashedPassword,
        },
      }),

      prisma.passwordResetToken.delete({
        where: {
          id: resetToken.id,
        },
      }),
    ])
    console.log("Password updated successfully")

    return NextResponse.json({
      success: true,
      message:
        "Your password has been reset successfully.",
    })
  } catch (error) {
    console.error(
      "Password reset failed:",
      error
    )

    return NextResponse.json(
      {
        success: false,
        message:
          "We could not reset your password.",
      },
      {
        status: 500,
      }
    )
  }
}