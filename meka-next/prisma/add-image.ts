import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"


const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})


const prisma = new PrismaClient({
  adapter,
})


async function main(){

  const product =
    await prisma.product.findUnique({
      where:{
        slug:"premium-black-hoodie"
      }
    })


  if(!product){
    throw new Error("Product not found")
  }


  await prisma.productImage.create({
    data:{
      url:"https://auieyynwtskqhewkcutw.supabase.co/storage/v1/object/public/product-images/3%20meka.jpg",
      alt:"Premium Black Hoodie",
      productId:product.id
    }
  })


  console.log("Image added")
}


main()
.finally(async()=>{
  await prisma.$disconnect()
})