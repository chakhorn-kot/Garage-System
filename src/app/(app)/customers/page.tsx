import { createClient } from "@/lib/supabase/server";
import type { Customer, Vehicle } from "@/types/db";
import { createCustomer, createVehicle } from "../actions";

export default async function CustomersPage() {
  const supabase = await createClient();

  const [{ data: customers }, { data: vehicles }] = await Promise.all([
    supabase.from("customers").select("*").order("created_at", { ascending: false }),
    supabase.from("vehicles").select("*").order("created_at", { ascending: false }),
  ]);

  const vehiclesByCustomer = new Map<string, Vehicle[]>();
  (vehicles ?? []).forEach((v: Vehicle) => {
    const list = vehiclesByCustomer.get(v.customer_id) ?? [];
    list.push(v);
    vehiclesByCustomer.set(v.customer_id, list);
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-black">
        ลูกค้า & รถ
      </h1>

      <div className="mb-8 grid grid-cols-2 gap-6">
        <form
          action={createCustomer}
          className="space-y-3 rounded-lg border border-black/10 p-5"
        >
          <h2 className="font-semibold text-black">เพิ่มลูกค้าใหม่</h2>
          <input
            name="name"
            required
            placeholder="ชื่อลูกค้า"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            name="phone"
            placeholder="เบอร์โทร"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            name="email"
            placeholder="อีเมล"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            name="address"
            placeholder="ที่อยู่"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <button className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700">
            บันทึกลูกค้า
          </button>
        </form>

        <form
          action={createVehicle}
          className="space-y-3 rounded-lg border border-black/10 p-5"
        >
          <h2 className="font-semibold text-black">เพิ่มรถ</h2>
          <select
            name="customer_id"
            required
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="">เลือกลูกค้า</option>
            {(customers ?? []).map((c: Customer) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            name="license_plate"
            required
            placeholder="ทะเบียนรถ"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              name="brand"
              placeholder="ยี่ห้อ"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
            <input
              name="model"
              placeholder="รุ่น"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              name="year"
              type="number"
              placeholder="ปี"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
            <input
              name="color"
              placeholder="สี"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <button className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700">
            บันทึกรถ
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {(customers ?? []).map((c: Customer) => (
          <div key={c.id} className="rounded-lg border border-black/10 p-4">
            <div className="flex items-baseline justify-between">
              <h3 className="font-semibold text-black">{c.name}</h3>
              <span className="text-sm text-neutral-500">{c.phone}</span>
            </div>
            <div className="mt-2 space-y-1">
              {(vehiclesByCustomer.get(c.id) ?? []).map((v) => (
                <div key={v.id} className="text-sm text-neutral-600">
                  {v.license_plate} · {v.brand} {v.model} {v.year ?? ""}
                </div>
              ))}
              {(vehiclesByCustomer.get(c.id) ?? []).length === 0 && (
                <p className="text-sm text-neutral-400">ยังไม่มีรถ</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
