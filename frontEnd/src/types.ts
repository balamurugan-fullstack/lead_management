export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Lead {
  id: number;
  title: string;
  company: string;
  email?: string | null;
  phone?: string | null;
  status: string;
  source?: string | null;
  value?: number | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeadFormData {
  title: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  value: string;
  notes: string;
}
