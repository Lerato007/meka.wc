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

  pages: {
    signIn: "/login",
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
          role: user.role,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      const email = user?.email ?? token.email

      if (email && (!token.id || user)) {
        const databaseUser = await prisma.user.findUnique({
          where: {
            email: email.toLowerCase(),
          },

          select: {
            id: true,
            role: true,
          },
        })

        if (databaseUser) {
          token.id = databaseUser.id
          token.role = databaseUser.role
        }
      }

      return token
    },

    async session({ session, token }) {
  if (session.user) {
    session.user.id =
      typeof token.id === "string" ? token.id : ""

    session.user.role =
      token.role === "ADMIN" || token.role === "CUSTOMER"
        ? token.role
        : "CUSTOMER"
  }

  return session
},
  },
})