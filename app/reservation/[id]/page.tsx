"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";

interface Reservation {
  id: string;
  status: string;
  quantity: number;
  expiresAt: string;
  product: {
    name: string;
  };
  warehouse: {
    name: string;
  };
}

export default function ReservationPage() {
  const params = useParams();
  const router = useRouter();

  const [reservation, setReservation] =
    useState<Reservation | null>(null);

  const [timeLeft, setTimeLeft] =
    useState("");

  async function fetchReservation() {
    try {
      const response = await axios.get(
        `/api/reservations/${params.id}`
      );

      setReservation(response.data);
    } catch {
      toast.error("Failed to load reservation");
    }
  }

  async function confirmReservation() {
    try {
      await axios.post(
        `/api/reservations/${params.id}/confirm`
      );

      toast.success("Reservation confirmed");

      await fetchReservation();
    } catch (error) {
      toast.error("Confirmation failed");
    }
  }

  async function cancelReservation() {
    try {
      await axios.post(
        `/api/reservations/${params.id}/release`
      );

      toast.success("Reservation cancelled");

      router.push("/");
    } catch {
      toast.error("Cancellation failed");
    }
  }

  useEffect(() => {
  async function loadReservation() {
    await fetchReservation();
  }

  loadReservation();
  }, []);

  useEffect(() => {
    if (!reservation) return;
    if (reservation.status !== "pending") {
        return;
    }

    const interval = setInterval(async () => {
  const expiryTime = new Date(
    reservation.expiresAt
  ).getTime();

  const now = Date.now();

  const difference = expiryTime - now;

  if (difference <= 0) {
    clearInterval(interval);

    await fetchReservation();

    return;
  }

  const minutes = Math.floor(
    difference / 1000 / 60
  );

  const seconds = Math.floor(
    (difference / 1000) % 60
  );

  setTimeLeft(
    `${minutes}m ${seconds}s`
  );
}, 1000);

    return () => clearInterval(interval);
  }, [reservation]);

  if (!reservation) {
    return (
      <div className="p-10">
        Loading reservation...
      </div>
    );
  }

  return (
    <main className="min-h-screen p-10 bg-gray-100 text-black">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold mb-6">
          Reservation Details
        </h1>

        <div className="space-y-4">
          <p>
            <span className="font-semibold">
              Product:
            </span>{" "}
            {reservation.product.name}
          </p>

          <p>
            <span className="font-semibold">
              Warehouse:
            </span>{" "}
            {reservation.warehouse.name}
          </p>

          <p>
  <span className="font-semibold">
    Status:
  </span>{" "}
  <span
    className={
      reservation.status === "confirmed"
        ? "text-green-600 font-semibold"
        : reservation.status === "released"
        ? "text-red-600 font-semibold"
        : "text-yellow-600 font-semibold"
    }
  >
    {reservation.status}
  </span>
</p>

          <p>
            <span className="font-semibold">
              Quantity:
            </span>{" "}
            {reservation.quantity}
          </p>

          <p>
            <span className="font-semibold">
              Expires In:
            </span>{" "}
            {reservation.status === "pending"
                ? timeLeft
                : reservation.status === "confirmed"
                ? "Confirmed"
                : "Timer Expired"}
          </p>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={confirmReservation}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Confirm Purchase
          </button>

          <button
            onClick={cancelReservation}
            className="bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </main>
  );
}