import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Vehicle, JobOrder } from "@/types/db";
import { JOB_STATUS_LABEL, JOB_STATUS_COLOR } from "@/types/db";
import { createJobOrder } from "../actions";

export default async function JobOrdersPage() {
  const supabase = await createClient();

  const [{ data: jobOrders }, { data: vehicles }] = await Promise.all([
    supabase
      .from("job_orders")
      .select("*, vehicles(license_plate, brand, model, customers(name))")
      .order("created_at", { ascending: false }),
    supabase
      .from("vehicles")
      .select("*, customers(name)")
      .order("license_plate"),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-black">
        ใบสั่งซ่อม
      </h1>

      <form
        action={createJobOrder}
        className="mb-8 grid grid-cols-4 gap-3 rounded-lg border border-black/10 p-5"
      >
        <h2 className="col-span-4 font-semibold text-black">
          เปิดใบสั่งซ่อมใหม่
        </h2>
        <select
          name="vehicle_id"
          required
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
        >
          <option value="">เลือกรถ</option>
          {(vehicles ?? []).map((v: Vehicle) => (
            <option key={v.id} value={v.id}>
              {v.license_plate} · {v.customers?.name}
            </option>
          ))}
        </select>
        <input
          name="complaint"
          placeholder="อาการที่แจ้ง"
          className="col-span-2 rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <input
          name="odometer"
          type="number"
          placeholder="เลขไมล์"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <input
          name="promised_at"
          type="datetime-local"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <button className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700">
          เปิดใบสั่งซ่อม
        </button>
      </form>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/10 text-left text-neutral-500">
            <th className="pb-2 font-medium">รถ</th>
            <th className="pb-2 font-medium">ลูกค้า</th>
            <th className="pb-2 font-medium">อาการ</th>
            <th className="pb-2 font-medium">สถานะ</th>
            <th className="pb-2 font-medium">รับเมื่อ</th>
          </tr>
        </thead>
        <tbody>
          {(jobOrders ?? []).map((j: JobOrder) => (
            <tr key={j.id} className="border-b border-neutral-100">
              <td className="py-2.5">
                <Link
                  href={`/job-orders/${j.id}`}
                  className="font-medium text-black transition-colors hover:text-red-600 hover:underline"
                >
                  {j.vehicles?.license_plate}
                </Link>
              </td>
              <td className="py-2.5 text-neutral-600">
                {j.vehicles?.customers?.name}
              </td>
              <td className="py-2.5 text-neutral-600">
                {j.complaint ?? "-"}
              </td>
              <td className="py-2.5">
                <span
                  className={
                    "rounded-full px-2.5 py-1 text-xs font-medium " +
                    JOB_STATUS_COLOR[j.status]
                  }
                >
                  {JOB_STATUS_LABEL[j.status]}
                </span>
              </td>
              <td className="py-2.5 text-neutral-500">
                {new Date(j.received_at).toLocaleDateString("th-TH")}
              </td>
            </tr>
          ))}
          {(!jobOrders || jobOrders.length === 0) && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-neutral-400">
                ยังไม่มีใบสั่งซ่อม
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
