export type JobStatus =
  | "received"
  | "in_progress"
  | "waiting_qc"
  | "completed"
  | "delivered"
  | "cancelled";

export type AssignmentStatus = "pending" | "in_progress" | "done";

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
}

export interface Vehicle {
  id: string;
  customer_id: string;
  license_plate: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  color: string | null;
  vin: string | null;
  created_at: string;
  customers?: Customer;
}

export interface Technician {
  id: string;
  name: string;
  phone: string | null;
  specialty: string | null;
  active: boolean;
  created_at: string;
}

export interface Part {
  id: string;
  sku: string | null;
  name: string;
  category: string | null;
  brand: string | null;
  unit: string;
  cost_price: number;
  sell_price: number;
  quantity_on_hand: number;
  reorder_point: number;
  supplier_name: string | null;
  created_at: string;
}

export interface JobOrder {
  id: string;
  vehicle_id: string;
  status: JobStatus;
  complaint: string | null;
  odometer: number | null;
  received_at: string;
  promised_at: string | null;
  completed_at: string | null;
  total_amount: number;
  created_at: string;
  vehicles?: Vehicle;
}

export interface JobAssignment {
  id: string;
  job_order_id: string;
  technician_id: string;
  task_description: string | null;
  status: AssignmentStatus;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  technicians?: Technician;
  job_orders?: JobOrder;
}

export interface JobOrderPart {
  id: string;
  job_order_id: string;
  part_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  parts?: Part;
}

export interface StockMovement {
  id: string;
  part_id: string;
  movement_type: "in" | "out" | "adjustment";
  quantity: number;
  reference_job_order_id: string | null;
  note: string | null;
  created_at: string;
  parts?: Part;
}

export const JOB_STATUS_LABEL: Record<JobStatus, string> = {
  received: "รับรถ",
  in_progress: "กำลังซ่อม",
  waiting_qc: "รอตรวจสอบ",
  completed: "เสร็จสิ้น",
  delivered: "ส่งมอบแล้ว",
  cancelled: "ยกเลิก",
};

export const ASSIGNMENT_STATUS_LABEL: Record<AssignmentStatus, string> = {
  pending: "รอเริ่ม",
  in_progress: "กำลังทำ",
  done: "เสร็จแล้ว",
};

export const JOB_STATUS_COLOR: Record<JobStatus, string> = {
  received: "bg-neutral-100 text-black",
  in_progress: "bg-red-600 text-white",
  waiting_qc: "bg-black text-white",
  completed: "bg-black text-white",
  delivered: "bg-neutral-100 text-black",
  cancelled: "bg-neutral-100 text-neutral-400 line-through",
};

export const ASSIGNMENT_STATUS_COLOR: Record<AssignmentStatus, string> = {
  pending: "bg-neutral-100 text-black",
  in_progress: "bg-red-600 text-white",
  done: "bg-black text-white",
};
