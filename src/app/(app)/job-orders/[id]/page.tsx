import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Technician, Part, JobAssignment, JobOrderPart } from "@/types/db";
import { JOB_STATUS_LABEL, ASSIGNMENT_STATUS_LABEL } from "@/types/db";
import {
  updateJobOrderStatus,
  assignTechnician,
  updateAssignmentStatus,
  addJobOrderPart,
} from "../../actions";

export default async function JobOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: jobOrder },
    { data: technicians },
    { data: parts },
    { data: assignments },
    { data: usedParts },
  ] = await Promise.all([
    supabase
      .from("job_orders")
      .select("*, vehicles(license_plate, brand, model, customers(name, phone))")
      .eq("id", id)
      .single(),
    supabase.from("technicians").select("*").eq("active", true).order("name"),
    supabase.from("parts").select("*").order("name"),
    supabase
      .from("job_assignments")
      .select("*, technicians(name)")
      .eq("job_order_id", id)
      .order("created_at"),
    supabase
      .from("job_order_parts")
      .select("*, parts(name, unit)")
      .eq("job_order_id", id)
      .order("created_at"),
  ]);

  if (!jobOrder) notFound();

  const partsCost = (usedParts ?? []).reduce(
    (sum: number, p: JobOrderPart) => sum + p.quantity * p.unit_price,
    0
  );

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">
            {jobOrder.vehicles?.license_plate}
          </h1>
          <p className="text-sm text-neutral-500">
            {jobOrder.vehicles?.brand} {jobOrder.vehicles?.model} ·{" "}
            {jobOrder.vehicles?.customers?.name} ·{" "}
            {jobOrder.vehicles?.customers?.phone}
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            อาการ: {jobOrder.complaint ?? "-"}
          </p>
        </div>

        <form action={updateJobOrderStatus} className="flex items-center gap-2">
          <input type="hidden" name="job_order_id" value={jobOrder.id} />
          <select
            key={jobOrder.status}
            name="status"
            defaultValue={jobOrder.status}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            {Object.entries(JOB_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800">
            อัปเดตสถานะ
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Technician assignment / tracking */}
        <div className="rounded-lg border border-neutral-200 p-5">
          <h2 className="mb-3 font-semibold text-neutral-900">มอบหมายช่าง</h2>

          <form action={assignTechnician} className="mb-4 space-y-2">
            <input type="hidden" name="job_order_id" value={jobOrder.id} />
            <select
              name="technician_id"
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            >
              <option value="">เลือกช่าง</option>
              {(technicians ?? []).map((t: Technician) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <input
              name="task_description"
              placeholder="รายละเอียดงาน"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
            <button className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100">
              มอบหมายงาน
            </button>
          </form>

          <ul className="space-y-2">
            {(assignments ?? []).map((a: JobAssignment) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-md bg-neutral-50 px-3 py-2 text-sm"
              >
                <div>
                  <p className="text-neutral-800">{a.technicians?.name}</p>
                  <p className="text-xs text-neutral-500">
                    {a.task_description ?? "งานซ่อม"}
                  </p>
                </div>
                <form action={updateAssignmentStatus} className="flex items-center gap-2">
                  <input type="hidden" name="assignment_id" value={a.id} />
                  <input type="hidden" name="job_order_id" value={jobOrder.id} />
                  <select
                    key={a.status}
                    name="status"
                    defaultValue={a.status}
                    className="rounded-md border border-neutral-300 px-2 py-1 text-xs"
                  >
                    {Object.entries(ASSIGNMENT_STATUS_LABEL).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                  <button className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100">
                    อัปเดต
                  </button>
                </form>
              </li>
            ))}
            {(!assignments || assignments.length === 0) && (
              <p className="text-sm text-neutral-400">ยังไม่ได้มอบหมายช่าง</p>
            )}
          </ul>
        </div>

        {/* Parts used tracking */}
        <div className="rounded-lg border border-neutral-200 p-5">
          <h2 className="mb-3 font-semibold text-neutral-900">อะไหล่ที่ใช้</h2>

          <form action={addJobOrderPart} className="mb-4 flex gap-2">
            <input type="hidden" name="job_order_id" value={jobOrder.id} />
            <select
              name="part_id"
              required
              className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
            >
              <option value="">เลือกอะไหล่</option>
              {(parts ?? []).map((p: Part) => (
                <option key={p.id} value={p.id}>
                  {p.name} (คงเหลือ {p.quantity_on_hand})
                </option>
              ))}
            </select>
            <input
              name="quantity"
              type="number"
              min={1}
              placeholder="จำนวน"
              className="w-24 rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
            <button className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100">
              เบิกใช้
            </button>
          </form>

          <ul className="space-y-2">
            {(usedParts ?? []).map((up: JobOrderPart) => (
              <li
                key={up.id}
                className="flex justify-between rounded-md bg-neutral-50 px-3 py-2 text-sm"
              >
                <span className="text-neutral-800">
                  {up.parts?.name} x {up.quantity} {up.parts?.unit}
                </span>
                <span className="text-neutral-600">
                  {(up.quantity * up.unit_price).toLocaleString()} บาท
                </span>
              </li>
            ))}
            {(!usedParts || usedParts.length === 0) && (
              <p className="text-sm text-neutral-400">ยังไม่มีการเบิกอะไหล่</p>
            )}
          </ul>

          {usedParts && usedParts.length > 0 && (
            <div className="mt-3 flex justify-between border-t border-neutral-200 pt-3 text-sm font-medium text-neutral-900">
              <span>รวมค่าอะไหล่</span>
              <span>{partsCost.toLocaleString()} บาท</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
