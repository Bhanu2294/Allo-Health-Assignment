import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { productId, warehouseName } = body;

    if (!productId || !warehouseName) {
      return NextResponse.json(
        {
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    const warehouse = await prisma.warehouse.findFirst({
      where: {
        name: warehouseName,
      },
    });

    if (!warehouse) {
      return NextResponse.json(
        {
          error: "Warehouse not found",
        },
        { status: 404 }
      );
    }

    const lockKey = `lock:${productId}:${warehouse.id}`;

    const existingLock = await redis.get(lockKey);

    if (existingLock) {
      return NextResponse.json(
        {
          error:
            "Another reservation is processing. Try again.",
        },
        { status: 429 }
      );
    }

    await redis.set(lockKey, "locked", {
      ex: 5,
    });

    try {
      const result = await prisma.$transaction(
        async (tx) => {
          const inventory =
            await tx.inventory.findFirst({
              where: {
                productId,
                warehouseId: warehouse.id,
              },
            });

          if (!inventory) {
            throw new Error(
              "Inventory not found"
            );
          }

          const availableStock =
            inventory.totalStock -
            inventory.reservedStock;

          if (availableStock < 1) {
            throw {
            status: 409,
            message: "Not enough stock available",
            };
          }

          await tx.inventory.update({
            where: {
              id: inventory.id,
            },
            data: {
              reservedStock: {
                increment: 1,
              },
            },
          });

          const reservation =
            await tx.reservation.create({
              data: {
                productId,
                warehouseId: warehouse.id,
                quantity: 1,
                status: "pending",
                expiresAt: new Date(
                  Date.now() + 10 * 60 * 1000
                ),
              },
            });

          return reservation;
        }
      );

      return NextResponse.json(result);
    } finally {
      await redis.del(lockKey);
    }
  } catch (error) {
  console.error(error);

  const message =
    typeof error === "object" &&
    error !== null &&
    "message" in error
      ? String(error.message)
      : "Reservation failed";

  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error
      ? Number(error.status)
      : 500;

  return NextResponse.json(
    {
      error: message,
    },
    { status }
  );
}
}