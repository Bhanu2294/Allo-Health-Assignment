import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    await redis.set("test-key", "Redis working");

    const value = await redis.get("test-key");

    return NextResponse.json({
      success: true,
      value,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Redis connection failed",
      },
      { status: 500 }
    );
  }
}