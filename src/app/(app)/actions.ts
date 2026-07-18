"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

function num(formData: FormData, key: string) {
  const v = str(formData, key);
  return v === null ? null : Number(v);
}

// --- Customers & vehicles ---

export async function createCustomer(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("customers").insert({
    name: str(formData, "name"),
    phone: str(formData, "phone"),
    email: str(formData, "email"),
    address: str(formData, "address"),
  });
  revalidatePath("/customers");
}

export async function createVehicle(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("vehicles").insert({
    customer_id: str(formData, "customer_id"),
    license_plate: str(formData, "license_plate"),
    brand: str(formData, "brand"),
    model: str(formData, "model"),
    year: num(formData, "year"),
    color: str(formData, "color"),
  });
  revalidatePath("/customers");
}

// --- Parts inventory ---

export async function createPart(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("parts").insert({
    sku: str(formData, "sku"),
    name: str(formData, "name"),
    category: str(formData, "category"),
    brand: str(formData, "brand"),
    unit: str(formData, "unit") ?? "ชิ้น",
    cost_price: num(formData, "cost_price") ?? 0,
    sell_price: num(formData, "sell_price") ?? 0,
    quantity_on_hand: num(formData, "quantity_on_hand") ?? 0,
    reorder_point: num(formData, "reorder_point") ?? 5,
    supplier_name: str(formData, "supplier_name"),
  });
  revalidatePath("/parts");
}

export async function receiveStock(formData: FormData) {
  const supabase = await createClient();
  const partId = str(formData, "part_id");
  const quantity = num(formData, "quantity") ?? 0;
  if (!partId || quantity <= 0) return;

  const { data: part } = await supabase
    .from("parts")
    .select("quantity_on_hand")
    .eq("id", partId)
    .single();

  await supabase
    .from("parts")
    .update({ quantity_on_hand: (part?.quantity_on_hand ?? 0) + quantity })
    .eq("id", partId);

  await supabase.from("stock_movements").insert({
    part_id: partId,
    movement_type: "in",
    quantity,
    note: "รับอะไหล่เข้าคลัง",
  });

  revalidatePath("/parts");
}

// --- Technicians ---

export async function createTechnician(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("technicians").insert({
    name: str(formData, "name"),
    phone: str(formData, "phone"),
    specialty: str(formData, "specialty"),
  });
  revalidatePath("/technicians");
}

// --- Job orders ---

export async function createJobOrder(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("job_orders").insert({
    vehicle_id: str(formData, "vehicle_id"),
    complaint: str(formData, "complaint"),
    odometer: num(formData, "odometer"),
    promised_at: str(formData, "promised_at"),
  });

  revalidatePath("/job-orders");
}

export async function updateJobOrderStatus(formData: FormData) {
  const supabase = await createClient();
  const id = str(formData, "job_order_id");
  const status = str(formData, "status");
  if (!id || !status) return;

  const update: Record<string, unknown> = { status };
  if (status === "completed") update.completed_at = new Date().toISOString();

  await supabase.from("job_orders").update(update).eq("id", id);
  revalidatePath("/job-orders");
  revalidatePath(`/job-orders/${id}`);
}

export async function assignTechnician(formData: FormData) {
  const supabase = await createClient();
  const jobOrderId = str(formData, "job_order_id");
  await supabase.from("job_assignments").insert({
    job_order_id: jobOrderId,
    technician_id: str(formData, "technician_id"),
    task_description: str(formData, "task_description"),
  });
  revalidatePath(`/job-orders/${jobOrderId}`);
  revalidatePath("/technicians");
}

export async function updateAssignmentStatus(formData: FormData) {
  const supabase = await createClient();
  const id = str(formData, "assignment_id");
  const status = str(formData, "status");
  const jobOrderId = str(formData, "job_order_id");
  if (!id || !status) return;

  const update: Record<string, unknown> = { status };
  if (status === "in_progress") update.started_at = new Date().toISOString();
  if (status === "done") update.finished_at = new Date().toISOString();

  await supabase.from("job_assignments").update(update).eq("id", id);
  if (jobOrderId) revalidatePath(`/job-orders/${jobOrderId}`);
  revalidatePath("/technicians");
}

export async function addJobOrderPart(formData: FormData) {
  const supabase = await createClient();
  const jobOrderId = str(formData, "job_order_id");
  const partId = str(formData, "part_id");
  const quantity = num(formData, "quantity") ?? 0;
  if (!jobOrderId || !partId || quantity <= 0) return;

  const { data: part } = await supabase
    .from("parts")
    .select("sell_price, quantity_on_hand")
    .eq("id", partId)
    .single();

  if (!part || part.quantity_on_hand < quantity) {
    return; // insufficient stock
  }

  await supabase.from("job_order_parts").insert({
    job_order_id: jobOrderId,
    part_id: partId,
    quantity,
    unit_price: part?.sell_price ?? 0,
  });

  revalidatePath(`/job-orders/${jobOrderId}`);
  revalidatePath("/parts");
}
