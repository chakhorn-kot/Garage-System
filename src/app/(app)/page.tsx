import { createClient } from "@/lib/supabase/server";
import type { Part } from "@/types/db";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ count: activeJobs }, { data: lowStockParts }, { data: openAssignments }] =
    await Promise.all([
      supabase
        .from("job_orders")
        .select("*", { count: "exact", head: true })
        .in("status", ["received", "in_progress", "waiting_qc"]),
      supabase
        .from("parts")
        .select("*")
        .order("quantity_on_hand", { ascending: true })
        .limit(100),
      supabase
        .from("job_assignments")
        .select("*, technicians(name), job_orders(id, vehicles(license_plate))")
        .neq("status", "done"),
    ]);

  const lowStock = (lowStockParts ?? []).filter(
    (p: Part) => p.quantity_on_hand <= p.reorder_point
  );

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-black">แดชบอร์ด</h1>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-black/10 p-5">
          <p className="text-sm text-neutral-500">งานที่กำลังดำเนินการ</p>
          <p className="mt-1 text-3xl font-semibold text-black">
            {activeJobs ?? 0}
          </p>
        </div>
        <div className="rounded-lg border border-black/10 p-5">
          <p className="text-sm text-neutral-500">อะไหล่ใกล้หมด</p>
          <p className="mt-1 text-3xl font-semibold text-red-600">
            {lowStock.length}
          </p>
        </div>
        <div className="rounded-lg border border-black/10 p-5">
          <p className="text-sm text-neutral-500">งานช่างที่ยังไม่เสร็จ</p>
          <p className="mt-1 text-3xl font-semibold text-black">
            {openAssignments?.length ?? 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="mb-3 text-base font-semibold text-black">
            อะไหล่ใกล้หมด
          </h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-neutral-500">ไม่มีอะไหล่ใกล้หมด</p>
          ) : (
            <ul className="divide-y divide-black/10 rounded-lg border border-black/10">
              {lowStock.slice(0, 8).map((p: Part) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between px-4 py-2.5 text-sm"
                >
                  <span className="text-neutral-800">{p.name}</span>
                  <span className="font-medium text-red-600">
                    เหลือ {p.quantity_on_hand} {p.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-base font-semibold text-black">
            งานช่างที่ยังไม่เสร็จ
          </h2>
          {!openAssignments || openAssignments.length === 0 ? (
            <p className="text-sm text-neutral-500">ไม่มีงานค้าง</p>
          ) : (
            <ul className="divide-y divide-black/10 rounded-lg border border-black/10">
              {openAssignments.slice(0, 8).map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between px-4 py-2.5 text-sm"
                >
                  <span className="text-neutral-800">
                    {a.technicians?.name ?? "-"} ·{" "}
                    {a.job_orders?.vehicles?.license_plate ?? "-"}
                  </span>
                  <span className="text-neutral-500">
                    {a.status === "pending" ? "รอเริ่ม" : "กำลังทำ"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
