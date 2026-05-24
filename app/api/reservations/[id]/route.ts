import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;

    const reservation =
      await prisma.reservation.findUnique({
        where: {
          id,
        },
        include: {
          product: true,
          warehouse: true,
        },
      });

    if (!reservation) {
      return NextResponse.json(
        {
          error: "Reservation not found",
        },
        { status: 404 }
      );
    }

    if (
      reservation.status === "pending" &&
      new Date() > reservation.expiresAt
    ) {
      await prisma.$transaction(async (tx) => {
        const inventory =
          await tx.inventory.findFirst({
            where: {
              productId:
                reservation.productId,
              warehouseId:
                reservation.warehouseId,
            },
          });

        if (inventory) {
          await tx.inventory.update({
            where: {
              id: inventory.id,
            },
            data: {
              reservedStock: {
                decrement:
                  reservation.quantity,
              },
            },
          });
        }

        await tx.reservation.update({
          where: {
            id: reservation.id,
          },
          data: {
            status: "released",
          },
        });
      });

      return NextResponse.json({
        ...reservation,
        status: "released",
      });
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to fetch reservation",
      },
      { status: 500 }
    );
  }
}