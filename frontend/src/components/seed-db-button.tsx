"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { seedDatabase } from "@/lib/actions/seed";

export function SeedButton() {
  const [loading, setLoading] = useState(false);

  async function handleSeed() {
    setLoading(true);

    try {
      const res = await seedDatabase();
      if (res.success) {
        toast.success("db seeded successfully!");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button
        onClick={handleSeed}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Seeding..." : "Seed Database"}
      </Button>
    </div>
  );
}
