import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"


const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined")
}


const adapter = new PrismaPg({
  connectionString,
})


const prisma = new PrismaClient({
  adapter,
})


async function main() {

  const category = await prisma.category.upsert({
    where: {
      name: "Clothing",
    },
    update: {},
    create: {
      name: "Clothing",
    },
  })


await prisma.product.create({
  data:{
    name:"Premium Black Hoodie",
    slug:"premium-black-hoodie",
    description:"Heavy cotton hoodie designed for everyday wear",
    price:499.99,
    categoryId:category.id
  }
})


await prisma.product.create({
  data:{
    name:"Classic White T-Shirt",
    slug:"classic-white-t-shirt",
    description:"100% cotton everyday t-shirt",
    price:199.99,
    categoryId:category.id
  }
})

  console.log("Database seeded successfully")
}


main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })