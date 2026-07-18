import { createClient } from "@/lib/supabase/server";
import type { Technician, JobAssignment } from "@/types/db";
import { ASSIGNMENT_STATUS_LABEL, ASSIGNMENT_STATUS_COLOR } from "@/types/db";
import { createTechnician, updateAssignmentStatus } from "../actions";

export default async function TechniciansPage() {
  const supabase = await createClient();

  const [{ data: technicians }, { data: assignments }] = await Promise.all([
    supabase.from("technicians").select("*").order("name"),
    supabase
      .from("job_assignments")
      .select("*, job_orders(id, status, vehicles(license_plate))")
      .neq("status", "done")
      .order("created_at", { ascending: false }),
  ]);

  const assignmentsByTech = new Map<string, JobAssignment[]>();
  (assignments ?? []).forEach((a: JobAssignment) => {
    const list = assignmentsByTech.get(a.technician_id) ?? [];
    list.push(a);
    assignmentsByTech.set(a.technician_id, list);
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-black">
        ติดตามงานช่าง
      </h1>

      <form
        action={createTechnician}
        className="mb-8 grid grid-cols-4 gap-3 rounded-lg border border-black/10 p-5"
      >
        <h2 className="col-span-4 font-semibold text-black">
          เพิ่มช่างใหม่
        </h2>
        <input
          name="name"
          required
          placeholder="ชื่อช่าง"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <input
          name="phone"
          placeholder="เบอร์โทร"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <input
          name="specialty"
          placeholder="ความชำนาญ"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <button className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700">
          บันทึก
        </button>
      </form>

      <div className="grid grid-cols-2 gap-6">
        {(technicians ?? []).map((t: Technician) => {
          const jobs = assignmentsByTech.get(t.id) ?? [];
          return (
            <div key={t.id} className="card-hover rounded-lg border border-black/10 p-4">
              <div className="mb-3 flex items-baseline justify-between">
                <h3 className="font-semibold text-black">{t.name}</h3>
                <span className="text-xs text-neutral-500">
                  {t.specialty ?? "-"}
                </span>
              </div>

              {jobs.length === 0 ? (
                <p className="text-sm text-neutral-400">ไม่มีงานค้าง</p>
              ) : (
                <ul className="space-y-2">
                  {jobs.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between rounded-md border border-black/10 bg-white px-3 py-2 text-sm"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-black">
                            {a.job_orders?.vehicles?.license_plate ?? "-"}
                          </p>
                          <span
                            className={
                              "rounded-full px-2 py-0.5 text-[10px] font-medium " +
                              ASSIGNMENT_STATUS_COLOR[a.status]
                            }
                          >
                            {ASSIGNMENT_STATUS_LABEL[a.status]}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500">
                          {a.task_description ?? "งานซ่อม"}
                        </p>
                      </div>
                      <form action={updateAssignmentStatus} className="flex items-center gap-2">
                        <input type="hidden" name="assignment_id" value={a.id} />
                        <input
                          type="hidden"
                          name="job_order_id"
                          value={a.job_order_id}
                        />
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
                        <button className="rounded-md border border-black px-2 py-1 text-xs text-black transition-colors hover:bg-black hover:text-white">
                          อัปเดต
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
