import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./sign-out-button";

const NAV_ITEMS = [
  { href: "/", label: "แดชบอร์ด" },
  { href: "/job-orders", label: "ใบสั่งซ่อม" },
  { href: "/customers", label: "ลูกค้า & รถ" },
  { href: "/parts", label: "คลังอะไหล่" },
  { href: "/technicians", label: "ช่าง" },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="bg-carbon flex w-56 shrink-0 flex-col">
        <div className="bg-hazard-stripes h-1.5 w-full" />
        <div className="flex flex-1 flex-col p-4">
          <h1 className="font-display mb-6 flex items-center gap-2 text-2xl text-white">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
            OakGarage
          </h1>
          <nav className="flex flex-1 flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm text-neutral-300 transition-colors hover:bg-red-600 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto border-t border-neutral-800 pt-4">
            <p className="mb-2 truncate text-xs text-neutral-400">
              {user.email}
            </p>
            <SignOutButton />
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-white p-8">{children}</main>
    </div>
  );
}
