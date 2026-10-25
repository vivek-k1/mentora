import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { mentorDecideRequest } from "@/lib/actions/requests";

export default async function MentorDashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  const [pending, active, profile] = await Promise.all([
    prisma.mentorshipRequest.findMany({
      where: { mentorId: session.user.id, status: "PENDING_MENTOR" },
      include: { student: { include: { profile: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.mentorshipRequest.findMany({
      where: { mentorId: session.user.id, status: "APPROVED" },
      include: { student: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
  ]);

  const atCapacity = profile ? active.length >= profile.maxMentees : false;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">
        Welcome, {session.user.name}
      </h1>
      <p className="mt-1 text-slate-500">
        {`${active.length} active mentee${active.length === 1 ? "" : "s"}`}
        {profile ? ` of ${profile.maxMentees} max` : ""}
        {` · ${pending.length} pending request${pending.length === 1 ? "" : "s"}`}
      </p>

      {/* Incoming requests */}
      <h2 className="mt-8 text-lg font-semibold text-slate-900">
        Incoming requests
      </h2>
      {atCapacity && pending.length > 0 && (
        <p className="mt-2 text-sm text-amber-700 bg-amber-50 rounded-lg p-3 max-w-2xl">
          You are at your mentee capacity. Increase your max mentees in your
          profile to accept more.
        </p>
      )}
      {pending.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">No pending requests.</p>
      ) : (
        <div className="mt-3 space-y-3 max-w-3xl">
          {pending.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-slate-200 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">
                    {r.student.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {r.student.profile?.degree ?? "Student"}
                    {r.student.profile?.cgpa
                      ? ` · CGPA ${r.student.profile.cgpa}`
                      : ""}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <form action={mentorDecideRequest}>
                    <input type="hidden" name="requestId" value={r.id} />
                    <input type="hidden" name="decision" value="accept" />
                    <button
                      disabled={atCapacity}
                      className="rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-40"
                    >
                      Accept
                    </button>
                  </form>
                  <form action={mentorDecideRequest}>
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

      {/* Active mentorships */}
      <h2 className="mt-10 text-lg font-semibold text-slate-900">
        Active mentorships
      </h2>
      {active.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">No active mentorships.</p>
      ) : (
        <div className="mt-3 space-y-3 max-w-3xl">
          {active.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{r.student.name}</p>
                <p className="text-sm text-slate-500 truncate">
                  {r.problemDescription}
                </p>
              </div>
              <Link
                href={`/dashboard/hub/${r.id}`}
                className="shrink-0 rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-700"
              >
                Open hub
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
