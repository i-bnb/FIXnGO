'use client';

import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import { fetchApi } from '../../../../lib/api-client';
import { ShieldCheck, Eye, Lock, FileCode } from 'lucide-react';

export default function AuditLogsAdminPage({ params: { locale } }: { params: { locale: string } }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data: any = await fetchApi('/api/audit-logs');
      if (data?.items) setLogs(data.items);
    } catch (e) {
      console.warn('Failed to load audit logs:', e);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (r) => (
        <span className="text-xs text-slate-500 font-mono">
          {new Date(r.timestamp).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actorName',
      header: 'Actor',
      render: (r) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{r.actorName}</div>
          <div className="text-[10px] text-teal-800 font-bold">{r.actorRole}</div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (r) => {
        let badge = 'bg-slate-100 text-slate-700';
        if (r.action === 'CREATE') badge = 'bg-emerald-100 text-emerald-800';
        else if (r.action === 'UPDATE') badge = 'bg-blue-100 text-blue-800';
        else if (r.action === 'DISPATCH') badge = 'bg-amber-100 text-amber-800';
        else if (r.action === 'PAYMENT') badge = 'bg-purple-100 text-purple-800';

        return (
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${badge}`}>
            {r.action}
          </span>
        );
      },
    },
    {
      key: 'entityName',
      header: 'Target Entity',
      render: (r) => (
        <div>
          <span className="font-semibold text-slate-800 text-xs">{r.entityName}</span>
          <div className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">{r.entityId}</div>
        </div>
      ),
    },
    {
      key: 'detailsJson',
      header: 'Changes / Payload',
      render: (r) => (
        <span className="text-[11px] text-slate-600 font-mono truncate max-w-xs block">
          {JSON.stringify(r.detailsJson || {})}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Inspect',
      render: (r) => (
        <button
          onClick={() => setSelectedLog(r)}
          className="p-1.5 text-teal-700 hover:bg-teal-50 rounded-lg transition"
          title="Inspect Audit Record"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            System Audit Trail & Compliance Log
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable audit logs capturing every creation, update, dispatch, and payment with actor and timestamp
          </p>
        </div>
      </div>

      <DataTable
        title="Enterprise Audit Log"
        data={logs}
        columns={columns}
        searchPlaceholder="Search actor, action, or entity ID..."
        searchKeys={['actorName', 'action', 'entityName', 'entityId']}
        exportFileName="audit_logs_export"
        filters={[
          {
            key: 'action',
            label: 'Action',
            options: [
              { label: 'Create', value: 'CREATE' },
              { label: 'Update', value: 'UPDATE' },
              { label: 'Dispatch', value: 'DISPATCH' },
              { label: 'Payment', value: 'PAYMENT' },
            ],
          },
        ]}
      />

      {/* Inspect JSON Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <span className="text-xs font-bold text-teal-700">{selectedLog.action}</span>
                <h3 className="font-extrabold text-base text-slate-900">
                  {selectedLog.entityName} #{selectedLog.entityId}
                </h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b">
                <span className="font-semibold">Actor:</span>
                <span>
                  {selectedLog.actorName} ({selectedLog.actorRole})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="font-semibold">Timestamp:</span>
                <span>{new Date(selectedLog.timestamp).toISOString()}</span>
              </div>
              <div>
                <span className="font-semibold block mb-1">Details Diff:</span>
                <pre className="p-3 bg-slate-900 text-teal-400 rounded-xl overflow-x-auto text-[11px] font-mono">
                  {JSON.stringify(selectedLog.detailsJson, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
