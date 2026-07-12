import { forbidden } from 'next/navigation';
import { ScrollText } from 'lucide-react';
import { getAuditLog } from '@/app/actions/admin';

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const result = await getAuditLog(page, 50);
  if (!result.success) {
    forbidden();
  }

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">Audit Log</h1>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">
          Immutable trail of every admin-privileged action — store approvals, refund decisions, role changes, payouts
        </p>
      </div>

      {result.entries.length > 0 ? (
        <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm max-w-5xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 pl-5">Action</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3 pr-5 text-right">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result.entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-3 pl-5 font-black text-slate-800">{entry.action}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {entry.targetType} · {entry.targetId.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3 text-slate-500">{entry.adminUserId.slice(0, 8)}…</td>
                  <td className="px-4 py-3 pr-5 text-right text-slate-400 font-semibold">
                    {new Date(entry.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center max-w-lg shadow-sm flex flex-col items-center gap-2">
          <ScrollText className="w-7 h-7 text-slate-300" />
          <h4 className="text-sm font-extrabold text-slate-700">No Audit Entries Yet</h4>
        </div>
      )}

      {result.pageCount > 1 && (
        <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
          {page > 1 && <a href={`/admin/audit-log?page=${page - 1}`} className="hover:text-indigo-600">← Prev</a>}
          <span>Page {page} of {result.pageCount}</span>
          {page < result.pageCount && <a href={`/admin/audit-log?page=${page + 1}`} className="hover:text-indigo-600">Next →</a>}
        </div>
      )}
    </div>
  );
}
