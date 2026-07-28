"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import type { CartItem } from "@/types/cart"

type AddToCartItem = Omit<CartItem, "quantity">

type CartContextValue = {
  items: CartItem[]
  itemCount: number
  subtotal: number
  addItem: (item: AddToCartItem) => void
  increaseQuantity: (productId: string) => void
  decreaseQuantity: (productId: string) => void
  removeItem: (productId: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

const CART_STORAGE_KEY = "meka-cart"

export function CartProvider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY)

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart) as CartItem[]

        if (Array.isArray(parsedCart)) {
          setItems(parsedCart)
        }
      }
    } catch (error) {
      console.error("Failed to load cart:", error)
    } finally {
      setHasLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!hasLoaded) {
      return
    }

    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(items)
      )
    } catch (error) {
      console.error("Failed to save cart:", error)
    }
  }, [items, hasLoaded])

  function addItem(item: AddToCartItem) {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (currentItem) =>
          currentItem.productId === item.productId
      )

      if (existingItem) {
        if (existingItem.quantity >= existingItem.stock) {
          return currentItems
        }

        return currentItems.map((currentItem) =>
          currentItem.productId === item.productId
            ? {
                ...currentItem,
                quantity: currentItem.quantity + 1,
              }
            : currentItem
        )
      }

      return [
        ...currentItems,
        {
          ...item,
          quantity: 1,
        },
      ]
    })
  }

  function increaseQuantity(productId: string) {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.productId !== productId) {
          return item
        }

        if (item.quantity >= item.stock) {
          return item
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        }
      })
    )
  }

  function decreaseQuantity(productId: string) {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  function removeItem(productId: string) {
    setItems((currentItems) =>
      currentItems.filter(
        (item) => item.productId !== productId
      )
    )
  }

  function clearCart() {
    setItems([])
  }

  const itemCount = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.quantity,
        0
      ),
    [items]
  )

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + item.price * item.quantity,
        0
      ),
    [items]
  )

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      addItem,
      increaseQuantity,
      decreaseQuantity,
      removeItem,
      clearCart,
    }),
    [items, itemCount, subtotal]
  )

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    )
  }

  return context
}