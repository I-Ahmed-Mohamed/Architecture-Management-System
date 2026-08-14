export interface Client {
  id: string;
  name: string;
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
}

export interface Contract {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  value: number;
  paid: number;
  status: 'draft' | 'signed';
}
