import { createClient } from "@/lib/supabase/server";
import type { Part } from "@/types/db";
import { IconWrench, IconAlert, IconTechnician } from "@/components/icons";

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

  const stats = [
    {
      label: "งานที่กำลังดำเนินการ",
      value: activeJobs ?? 0,
      Icon: IconWrench,
      valueClass: "text-black",
    },
    {
      label: "อะไหล่ใกล้หมด",
      value: lowStock.length,
      Icon: IconAlert,
      valueClass: "text-red-600",
    },
    {
      label: "งานช่างที่ยังไม่เสร็จ",
      value: openAssignments?.length ?? 0,
      Icon: IconTechnician,
      valueClass: "text-black",
    },
  ];

  return (
    <div>
      <div className="bg-carbon relative mb-8 overflow-hidden rounded-lg">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 15% 30%, rgba(220,38,38,0.35), transparent 55%)",
          }}
        />
        <div className="relative px-6 py-8">
          <p className="font-display text-sm tracking-widest text-red-500">
            OAKGARAGE
          </p>
          <h1 className="font-display mt-1 text-3xl text-white">แดชบอร์ด</h1>
          <p className="mt-1 text-sm text-neutral-400">
            ภาพรวมงานซ่อม อะไหล่ และช่างวันนี้
          </p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="card-hover flex items-start justify-between rounded-lg border border-black/10 p-5"
          >
            <div>
              <p className="text-sm text-neutral-500">{s.label}</p>
              <p className={`font-display mt-1 text-4xl ${s.valueClass}`}>
                {s.value}
              </p>
            </div>
            <s.Icon className="h-8 w-8 shrink-0 text-black/15" />
          </div>
        ))}
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
