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
      <aside className="flex w-56 shrink-0 flex-col border-r border-neutral-200 bg-neutral-50 p-4">
        <h1 className="mb-6 text-lg font-semibold text-neutral-900">
          อู่ซ่อมรถ
        </h1>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-neutral-200 pt-4">
          <p className="mb-2 truncate text-xs text-neutral-500">
            {user.email}
          </p>
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
