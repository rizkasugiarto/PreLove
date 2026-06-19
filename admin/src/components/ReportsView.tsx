'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Check, ShieldAlert, Clock, CheckCircle } from 'lucide-react';

export default function ReportsView() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reports')
      .select('*, reporter:profiles!reports_reporter_id_fkey(full_name), product:products(title)')
      .order('created_at', { ascending: false });
    if (data) setReports(data);
    setLoading(false);
  };

  const updateReportStatus = async (reportId: string, nextStatus: string) => {
    const { error } = await supabase
      .from('reports')
      .update({ status: nextStatus })
      .eq('id', reportId);

    if (!error) {
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: nextStatus } : r))
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Laporan Pengaduan</h2>
        <p className="text-slate-500 mt-1">Kelola laporan yang diajukan oleh pengguna terkait produk atau aktivitas ilegal di marketplace.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase text-xs font-semibold border-b border-slate-100">
                <th className="px-6 py-4">Produk yang Dilaporkan</th>
                <th className="px-6 py-4">Pelapor</th>
                <th className="px-6 py-4">Alasan Pengaduan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Belum ada laporan pengaduan masuk.
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-950">
                      🚨 {r.product?.title || 'Produk dihapus'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      👤 {r.reporter?.full_name || 'User'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 leading-relaxed max-w-xs">
                      {r.reason}
                    </td>
                    <td className="px-6 py-4">
                      {r.status === 'resolved' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700">
                          <CheckCircle className="w-3 h-3" />
                          SELESAI
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700">
                          <Clock className="w-3 h-3" />
                          PENDING
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.status !== 'resolved' && (
                        <button
                          onClick={() => updateReportStatus(r.id, 'resolved')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-sm transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Tandai Selesai
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
