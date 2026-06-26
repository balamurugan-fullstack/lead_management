import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StatusBanner from '../components/StatusBanner';
import api from '../services/api';
import type { LeadFormData } from '../types';
import { getErrorMessage } from '../utils/error';

const defaultValues: LeadFormData = {
  name: '',
  company: '',
  email: '',
  phone: '',
  status: 'new',
  source: 'website',
  notes: '',
};

const LeadFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState<LeadFormData>(defaultValues);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormData, string>>>({});

  useEffect(() => {
    if (!isEdit) return;

    const loadLead = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/leads/${id}`);
        setForm({
          name: res.data.name || '',
          company: res.data.company || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          status: res.data.status || 'new',
          source: res.data.source || 'website',
          notes: res.data.notes || '',
        });
      } catch (err) {
        setBanner({ type: 'error', message: getErrorMessage(err, 'Unable to load lead') });
      } finally {
        setIsLoading(false);
      }
    };

    void loadLead();
  }, [id, isEdit]);

  useEffect(() => {
    if (!banner) return;
    const timer = window.setTimeout(() => setBanner(null), 2500);
    return () => window.clearTimeout(timer);
  }, [banner]);

  const validate = () => {
    const nextErrors: Partial<Record<keyof LeadFormData, string>> = {};
    if (!form.name.trim()) nextErrors.name = 'Lead name is required.';
    if (!form.company.trim()) nextErrors.company = 'Company is required.';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const payload = {
        name: form.name,
        company: form.company,
        email: form.email,
        phone: form.phone,
        status: form.status,
        source: form.source,
        notes: form.notes,
      };
      if (isEdit) {
        await api.put(`/leads/${id}`, payload);
      } else {
        await api.post('/leads', payload);
      }
      setBanner({ type: 'success', message: isEdit ? 'Lead updated successfully.' : 'Lead created successfully.' });
      window.setTimeout(() => navigate('/leads'), 400);
    } catch (err) {
      setBanner({ type: 'error', message: getErrorMessage(err, 'Unable to save lead') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">{isEdit ? 'Edit lead' : 'Add lead'}</h1>
      {banner && <div className="mt-4"><StatusBanner type={banner.type} message={banner.message} onDismiss={() => setBanner(null)} /></div>}
      {isLoading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-11 animate-pulse rounded-lg bg-slate-200" />)}
        </div>
      ) : (
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <input className={`rounded-lg border border-slate-200 p-3 w-full ${errors.name ? 'border-rose-400' : ''}`} placeholder="Name" value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors((current) => ({ ...current, name: undefined })); }} required />
            {errors.name && <p className="mt-1 text-sm font-medium text-rose-500">{errors.name}</p>}
          </div>
          <div>
            <input className={`rounded-lg border border-slate-200 p-3 w-full ${errors.company ? 'border-rose-400' : ''}`} placeholder="Company" value={form.company} onChange={(e) => { setForm({ ...form, company: e.target.value }); if (errors.company) setErrors((current) => ({ ...current, company: undefined })); }} required />
            {errors.company && <p className="mt-1 text-sm font-medium text-rose-500">{errors.company}</p>}
          </div>
          <div>
            <input className={`rounded-lg border border-slate-200 p-3 w-full ${errors.email ? 'border-rose-400' : ''}`} placeholder="Email" type="email" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); if (errors.email) setErrors((current) => ({ ...current, email: undefined })); }} />
            {errors.email && <p className="mt-1 text-sm font-medium text-rose-500">{errors.email}</p>}
          </div>
          <input className="rounded-lg border border-slate-200 p-3" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <select className="rounded-lg border border-slate-200 p-3" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
          <select className="rounded-lg border border-slate-200 p-3" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
            <option value="">Select source</option>
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="social">Social</option>
            <option value="other">Other</option>
          </select>
          <textarea className="rounded-lg border border-slate-200 p-3 md:col-span-2" placeholder="Notes" rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="md:col-span-2 flex gap-3">
            <button className="cursor-pointer rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-70" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save lead'}
            </button>
            <button className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2" type="button" onClick={() => navigate('/leads')}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default LeadFormPage;
