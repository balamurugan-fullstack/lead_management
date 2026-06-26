export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Lead {
  id: number;
  name: string;
  company: string;
  email?: string | null;
  phone?: string | null;
  status: string;
  source?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeadFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  notes: string;
}
