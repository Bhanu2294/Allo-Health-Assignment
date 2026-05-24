"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Inventory {
  warehouse: string;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
}

interface Product {
  id: string;
  name: string;
  inventory: Inventory[];
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  async function fetchProducts() {
    try {
      const response = await axios.get("/api/products");
      setProducts(response.data);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  async function handleReserve(
    productId: string,
    warehouseName: string
  ) {
    try {
      toast.loading("Creating reservation...", {
        id: "reserve",
      });

      const idempotencyKey = crypto.randomUUID();

      const response = await axios.post(
        "/api/reservations",
        {
          productId,
          warehouseName,
        },
        {
          headers: {
            "Idempotency-Key":
            idempotencyKey,
          },
        }
      );

      toast.success("Reservation created!", {
        id: "reserve",
      });

      router.push(`/reservation/${response.data.id}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.error ||
            "Reservation failed",
          {
            id: "reserve",
          }
        );
      } else {
        toast.error("Something went wrong", {
          id: "reserve",
        });
      }
    }
  }

  useEffect(() => {
  async function loadProducts() {
    await fetchProducts();
  }

  loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-xl">
        Loading products...
      </div>
    );
  }

  return (
    <main className="min-h-screen p-10 bg-gray-100 text-black">
      <h1 className="text-4xl font-bold mb-8 text-black">
        Allo Health Inventory Reservation System
      </h1>

      <div className="grid gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl p-6 shadow-md"
          >
            <h2 className="text-2xl font-semibold mb-4 text-black">
              {product.name}
            </h2>

            {product.inventory.map((item, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 mb-4 text-black"
              >
                <p>
                  <span className="font-semibold">
                    Warehouse:
                  </span>{" "}
                  {item.warehouse}
                </p>

                <p>
                  <span className="font-semibold">
                    Available Stock:
                  </span>{" "}
                  {item.availableStock}
                </p>

                <button
                  onClick={() =>
                    handleReserve(
                      product.id,
                      item.warehouse
                    )
                  }
                  disabled={item.availableStock <= 0}
                  className="mt-4 bg-black text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
                >
                  Reserve
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}