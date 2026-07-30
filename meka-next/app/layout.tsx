import type { Metadata } from "next"

import { CartProvider } from "@/components/cart/CartProvider"
import Header from "@/components/layout/Header"

import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Meka.WC",
    template: "%s | Meka.WC",
  },
  description: "Shop clothing and lifestyle products from Meka.WC.",
}

type RootLayoutProps = Readonly<{
  children: React.ReactNode
}>

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="bg-gray-50 antialiased">
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <Header />

            <main className="flex-1">{children}</main>
          </div>
        </CartProvider>
      </body>
    </html>
  )
}