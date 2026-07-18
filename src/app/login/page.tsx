"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function GearWatermark({ className }: { className?: string }) {
  const teeth = Array.from({ length: 12 });
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor">
      <circle cx="50" cy="50" r="26" />
      {teeth.map((_, i) => (
        <rect
          key={i}
          x="46"
          y="2"
          width="8"
          height="16"
          transform={`rotate(${i * 30} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="10" fill="#0a0a0a" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="bg-carbon relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="bg-hazard-stripes absolute inset-x-0 top-0 h-2" />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 35%, rgba(220,38,38,0.28), transparent 60%)",
        }}
      />

      <GearWatermark className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 text-white/5" />
      <GearWatermark className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rotate-12 text-white/5" />

      <div className="relative w-full max-w-sm overflow-hidden rounded-lg border border-neutral-800 bg-white shadow-2xl">
        <div className="bg-hazard-stripes h-1.5 w-full" />
        <div className="p-8">
          <div className="mb-1 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
            <h1 className="font-display text-3xl text-black">OakGarage</h1>
          </div>
          <p className="mb-6 text-sm text-neutral-500">
            ระบบบริหารอู่ซ่อมรถ - เข้าสู่ระบบสำหรับพนักงาน
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                อีเมล
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                รหัสผ่าน
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
