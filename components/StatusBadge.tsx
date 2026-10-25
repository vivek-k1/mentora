const STYLES: Record<string, string> = {
  PENDING_ADMIN: "bg-amber-50 text-amber-700 border-amber-200",
  PENDING_MENTOR: "bg-blue-50 text-blue-700 border-blue-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

const LABELS: Record<string, string> = {
  PENDING_ADMIN: "Pending admin approval",
  PENDING_MENTOR: "Awaiting mentor",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        STYLES[status] ?? "bg-slate-50 text-slate-600 border-slate-200"
      }`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
