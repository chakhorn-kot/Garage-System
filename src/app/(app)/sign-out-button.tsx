"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="w-full rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white"
    >
      ออกจากระบบ
    </button>
  );
}
