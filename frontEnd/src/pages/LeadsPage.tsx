import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBanner from '../components/StatusBanner';
import api from '../services/api';
import type { Lead } from '../types';
import { getErrorMessage } from '../utils/error';

const LeadsPage = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingLeadId, setDeletingLeadId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        const params = new URLSearchParams();
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (status) params.set('status', status);
        if (source) params.set('source', source);
        const res = await api.get(`/leads?${params.toString()}`);
        setLeads(res.data.leads);
      } catch (err) {
        setError(getErrorMessage(err, 'Unable to load leads'));
      } finally {
        setIsLoading(false);
      }
    };

    void fetchLeads();
  }, [debouncedSearch, status, source]);

  useEffect(() => {
    if (!error && !successMessage) return;
    const timer = window.setTimeout(() => {
      setError(null);
      setSuccessMessage(null);
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [error, successMessage]);

  const handleDelete = async (leadId: number) => {
    try {
      setDeletingLeadId(leadId);
      await api.delete(`/leads/${leadId}`);
      setLeads((current) => current.filter((lead) => lead.id !== leadId));
      setSuccessMessage('Lead deleted successfully');
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to delete lead'));
    } finally {
      setDeletingLeadId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Leads</h1>
          <p className="text-slate-500">Search, filter, and manage your pipeline.</p>
        </div>
        <Link to="/leads/new" className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">
          + Add lead
        </Link>
      </div>
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
        <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Search by title/company/email" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="rounded-lg border border-slate-200 px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
        </select>
        <select className="rounded-lg border border-slate-200 px-3 py-2" value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="">All sources</option>
          <option value="website">Website</option>
          <option value="referral">Referral</option>
          <option value="social">Social</option>
        </select>
      </div>
      {error && <StatusBanner type="error" message={error} onDismiss={() => setError(null)} />}
      {successMessage && <StatusBanner type="success" message={successMessage} onDismiss={() => setSuccessMessage(null)} />}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Company</th>
              <th className="p-4">Status</th>
              <th className="p-4">Source</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={index} className="border-t border-slate-100">
                  <td className="p-4"><div className="h-4 w-24 animate-pulse rounded bg-slate-200" /></td>
                  <td className="p-4"><div className="h-4 w-24 animate-pulse rounded bg-slate-200" /></td>
                  <td className="p-4"><div className="h-4 w-16 animate-pulse rounded bg-slate-200" /></td>
                  <td className="p-4"><div className="h-4 w-16 animate-pulse rounded bg-slate-200" /></td>
                  <td className="p-4"><div className="h-4 w-12 animate-pulse rounded bg-slate-200" /></td>
                </tr>
              ))
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No leads found.</td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="border-t border-slate-100">
                  <td className="p-4">{lead.title}</td>
                  <td className="p-4">{lead.company}</td>
                  <td className="p-4">{lead.status}</td>
                  <td className="p-4">{lead.source}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Link to={`/leads/${lead.id}/edit`} className="text-cyan-600">Edit</Link>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(lead.id)}
                        disabled={deletingLeadId === lead.id}
                        className="cursor-pointer text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingLeadId === lead.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Delete lead"
        message="This action cannot be undone. Do you want to remove this lead?"
        confirmText="Delete"
        onConfirm={() => {
          if (confirmDeleteId !== null) {
            void handleDelete(confirmDeleteId);
          }
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

export default LeadsPage;
