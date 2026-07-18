import { createClient } from "@/lib/supabase/server";
import type { Part, StockMovement } from "@/types/db";
import { createPart, receiveStock } from "../actions";

export default async function PartsPage() {
  const supabase = await createClient();

  const [{ data: parts }, { data: movements }] = await Promise.all([
    supabase.from("parts").select("*").order("name"),
    supabase
      .from("stock_movements")
      .select("*, parts(name)")
      .order("created_at", { ascending: false })
      .limit(15),
  ]);

  const lowStockCount = (parts ?? []).filter(
    (p: Part) => p.quantity_on_hand <= p.reorder_point
  ).length;

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold text-black">คลังอะไหล่</h1>
        {lowStockCount > 0 && (
          <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-medium text-white">
            ใกล้หมด {lowStockCount} รายการ
          </span>
        )}
      </div>

      <div className="mb-8 grid grid-cols-3 gap-6">
        <form
          action={createPart}
          className="col-span-2 grid grid-cols-2 gap-3 rounded-lg border border-black/10 p-5"
        >
          <h2 className="col-span-2 font-semibold text-black">
            เพิ่มอะไหล่ใหม่
          </h2>
          <input
            name="name"
            required
            placeholder="ชื่ออะไหล่"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            name="sku"
            placeholder="รหัส SKU"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            name="category"
            placeholder="หมวดหมู่"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            name="brand"
            placeholder="ยี่ห้อ"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            name="supplier_name"
            placeholder="ซัพพลายเออร์"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            name="unit"
            placeholder="หน่วย (เช่น ชิ้น, ลิตร)"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            name="cost_price"
            type="number"
            step="0.01"
            placeholder="ราคาทุน"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            name="sell_price"
            type="number"
            step="0.01"
            placeholder="ราคาขาย"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            name="quantity_on_hand"
            type="number"
            placeholder="จำนวนคงเหลือเริ่มต้น"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            name="reorder_point"
            type="number"
            placeholder="จุดสั่งซื้อขั้นต่ำ"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <button className="col-span-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700">
            บันทึกอะไหล่
          </button>
        </form>

        <div className="rounded-lg border border-black/10 p-5">
          <h2 className="mb-3 font-semibold text-black">
            ความเคลื่อนไหวล่าสุด
          </h2>
          <ul className="space-y-2 text-sm">
            {(movements ?? []).map((m: StockMovement) => (
              <li key={m.id} className="flex justify-between">
                <span className="text-neutral-700">{m.parts?.name}</span>
                <span
                  className={
                    m.movement_type === "in"
                      ? "text-green-600"
                      : "text-neutral-500"
                  }
                >
                  {m.movement_type === "in" ? "+" : "-"}
                  {m.quantity}
                </span>
              </li>
            ))}
            {(!movements || movements.length === 0) && (
              <p className="text-neutral-400">ยังไม่มีความเคลื่อนไหว</p>
            )}
          </ul>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/10 text-left text-neutral-500">
            <th className="pb-2 font-medium">ชื่ออะไหล่</th>
            <th className="pb-2 font-medium">หมวดหมู่</th>
            <th className="pb-2 font-medium">คงเหลือ</th>
            <th className="pb-2 font-medium">จุดสั่งซื้อ</th>
            <th className="pb-2 font-medium">ราคาขาย</th>
            <th className="pb-2 font-medium">รับเข้าคลัง</th>
          </tr>
        </thead>
        <tbody>
          {(parts ?? []).map((p: Part) => {
            const low = p.quantity_on_hand <= p.reorder_point;
            return (
              <tr key={p.id} className="border-b border-neutral-100">
                <td className="py-2.5 text-black">
                  {p.name}
                  {p.sku && (
                    <span className="ml-2 text-xs text-neutral-400">
                      {p.sku}
                    </span>
                  )}
                </td>
                <td className="py-2.5 text-neutral-600">
                  {p.category ?? "-"}
                </td>
                <td
                  className={
                    "py-2.5 font-medium " +
                    (low ? "text-red-600" : "text-black")
                  }
                >
                  {p.quantity_on_hand} {p.unit}
                </td>
                <td className="py-2.5 text-neutral-600">{p.reorder_point}</td>
                <td className="py-2.5 text-neutral-600">
                  {p.sell_price.toLocaleString()} บาท
                </td>
                <td className="py-2.5">
                  <form action={receiveStock} className="flex gap-2">
                    <input type="hidden" name="part_id" value={p.id} />
                    <input
                      name="quantity"
                      type="number"
                      min={1}
                      placeholder="จำนวน"
                      className="w-20 rounded-md border border-neutral-300 px-2 py-1 text-xs"
                    />
                    <button className="rounded-md border border-black px-2 py-1 text-xs text-black transition-colors hover:bg-black hover:text-white">
                      รับเข้า
                    </button>
                  </form>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
