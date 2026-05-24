import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const warehouse = await prisma.warehouse.create({
    data: {
      name: "Bangalore Fulfillment Center",
    },
  });

  const products = [
    {
      name: "Vitamin D3 Supplements",
      stock: 20,
    },
    {
      name: "Men's Wellness Kit",
      stock: 10,
    },
    {
      name: "Skin Care Essentials",
      stock: 15,
    },
    {
      name: "Hair Growth Serum",
      stock: 8,
    },
    {
      name: "Sexual Wellness Supplements",
      stock: 12,
    },
  ];

  for (const item of products) {
    await prisma.product.create({
      data: {
        name: item.name,
        inventory: {
          create: {
            warehouseId: warehouse.id,
            totalStock: item.stock,
          },
        },
      },
    });
  }

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });