import { prisma } from "@/lib/prisma";
import { adminDecideRequest } from "@/lib/actions/requests";
import { StatusBadge } from "@/components/StatusBadge";

export default async function AdminDashboard() {
  const [
    totalUsers,
    totalStudents,
    totalMentors,
    activeMentorships,
    pendingRequests,
    recentRequests,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "MENTOR" } }),
    prisma.mentorshipRequest.count({ where: { status: "APPROVED" } }),
    prisma.mentorshipRequest.findMany({
      where: { status: "PENDING_ADMIN" },
      include: {
        student: { include: { profile: true } },
        mentor: { include: { profile: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.mentorshipRequest.findMany({
      where: { status: { not: "PENDING_ADMIN" } },
      include: { student: true, mentor: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  const stats = [
    { label: "Total users", value: totalUsers },
    { label: "Students", value: totalStudents },
    { label: "Mentors", value: totalMentors },
    { label: "Active mentorships", value: activeMentorships },
    { label: "Pending approvals", value: pendingRequests.length },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Admin Overview</h1>
      <p className="mt-1 text-slate-500">
        Platform statistics and mentorship request approvals.
      </p>

      {/* Stats */}
      <div className="mt-6 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <p className="text-3xl font-semibold text-slate-900">{s.value}</p>
            <p className="mt-1 text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending approvals */}
      <h2 className="mt-10 text-lg font-semibold text-slate-900">
        Pending approvals
      </h2>
      {pendingRequests.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">
          No requests waiting for approval.
        </p>
      ) : (
        <div className="mt-3 space-y-3 max-w-3xl">
          {pendingRequests.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-slate-200 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">
                    {r.student.name} → {r.mentor.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {r.student.profile?.degree ?? "Student"}
                    {r.student.profile?.cgpa
                      ? ` · CGPA ${r.student.profile.cgpa}`
                      : ""}{" "}
                    · requesting{" "}
                    {r.mentor.profile?.skills.split(",")[0] ?? "mentorship"}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <form action={adminDecideRequest}>
                    <input type="hidden" name="requestId" value={r.id} />
                    <input type="hidden" name="decision" value="approve" />
                    <button className="rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-medium hover:bg-green-700">
                      Approve
                    </button>
                  </form>
                  <form action={adminDecideRequest}>
                    <input type="hidden" name="requestId" value={r.id} />
                    <input type="hidden" name="decision" value="reject" />
                    <button className="rounded-lg border border-slate-300 text-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-50">
                      Reject
                    </button>
                  </form>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                {r.problemDescription}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Recent activity */}
      <h2 className="mt-10 text-lg font-semibold text-slate-900">
        Recent activity
      </h2>
      {recentRequests.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">No activity yet.</p>
      ) : (
        <div className="mt-3 space-y-2 max-w-3xl">
          {recentRequests.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-lg border border-slate-200 px-4 py-3 flex items-center justify-between gap-4"
            >
              <p className="text-sm text-slate-700 truncate">
                {r.student.name} → {r.mentor.name}
              </p>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
