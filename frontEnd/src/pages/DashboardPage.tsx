import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getErrorMessage } from '../utils/error';

const DashboardPage = () => {
  const [stats, setStats] = useState({ totalLeads: 0, newLeads: 0, contactedLeads: 0, qualifiedLeads: 0, wonLeads: 0, lostLeads: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/leads/dashboard');
        setStats(res.data);
      } catch (err) {
        setError(getErrorMessage(err, 'Unable to load dashboard stats'));
      } finally {
        setIsLoading(false);
      }
    };

    void loadStats();
  }, []);

  const statusCards = [
    { label: 'Total leads', value: stats.totalLeads },
    { label: 'New', value: stats.newLeads },
    { label: 'Contacted', value: stats.contactedLeads },
    { label: 'Qualified', value: stats.qualifiedLeads },
    { label: 'Won', value: stats.wonLeads },
    { label: 'Lost', value: stats.lostLeads },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">See lead health at a glance.</p>
        </div>
        <Link to="/leads/new" className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">
          + Add lead
        </Link>
      </div>
      {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      <div className="grid gap-4 md:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 h-8 w-16 animate-pulse rounded bg-slate-200" />
            </div>
          ))
        ) : (
          statusCards.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{item.value}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
