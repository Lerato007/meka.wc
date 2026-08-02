import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import {
  generatePasswordResetToken,
} from "@/lib/auth/password-reset"
import { sendPasswordResetEmail } from "@/lib/email/send"

type ForgotPasswordBody = {
  email?: unknown
}

const SUCCESS_MESSAGE =
  "If an account exists for that email address, you will receive a password reset email shortly."

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as ForgotPasswordBody

    if (
      typeof body.email !== "string" ||
      body.email.trim() === ""
    ) {
      return NextResponse.json(
        {
          success: true,
          message: SUCCESS_MESSAGE,
        },
        {
          status: 200,
        }
      )
    }

    const email = body.email.trim().toLowerCase()

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    /*
     * Never reveal whether an account exists.
     */
    if (!user) {
      return NextResponse.json({
        success: true,
        message: SUCCESS_MESSAGE,
      })
    }

    /*
     * Remove any existing reset tokens.
     */
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
      },
    })

    const {
      token,
      tokenHash,
      expiresAt,
    } = generatePasswordResetToken()

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    })

    await sendPasswordResetEmail({
      email: user.email!,
      name: user.name,
      token,
    })

    return NextResponse.json({
      success: true,
      message: SUCCESS_MESSAGE,
    })
  } catch (error) {
    console.error(
      "Forgot password request failed:",
      error
    )

    /*
     * Never leak implementation details.
     */
    return NextResponse.json(
      {
        success: true,
        message: SUCCESS_MESSAGE,
      },
      {
        status: 200,
      }
    )
  }
}