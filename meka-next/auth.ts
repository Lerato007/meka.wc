import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"

import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
  },

  providers: [
    Google,

    Credentials({
      name: "Email and password",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : ""

        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : ""

        if (!email || !password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        })

        if (!user?.password) {
          return null
        }

        const passwordMatches = await bcrypt.compare(
          password,
          user.password
        )

        if (!passwordMatches) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        }
      },
    }),
  ],

//   pages: {
//     signIn: "/login",
//   },
})