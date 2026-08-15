export interface Client {
  id: string;
  name: string;
  branchName: string;
  phone: string;
  email: string;
  dateAdded: string;
}

export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  phase: string;
  startDate: string;
  status: 'active' | 'pending' | 'completed';
  projectStatus?: string; // e.g. التصميم، التراخيص، الإنشاءات، التشطيبات
  progress?: number; // 0 to 100
}

export interface Contract {
  id: string;
  clientId: string;
  clientName: string;
  branchName: string;
  taxId: string;
  poNumber: string;
  date: string;
  value: number;
  paid: number;
  status: 'draft' | 'signed';
}

export interface Supplier {
  id: string;
  name: string;
  category: 'مورد خامات' | 'مقاول باطن';
  specialty: string; 
  phone: string;
  dateAdded: string;
}

export interface SupplierTransaction {
  id: string;
  supplierId: string;
  date: string;
  type: 'invoice' | 'payment'; // invoice = مسحوبات/مطالبة (له), payment = دفعة نقدية (عليه)
  amount: number;
  description: string;
}
