import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";

export default async function StudentDashboard({
  searchParams,
}: {
  searchParams: Promise<{ requested?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  const { requested } = await searchParams;

  const requests = await prisma.mentorshipRequest.findMany({
    where: { studentId: session.user.id },
    include: { mentor: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">
        Welcome, {session.user.name}
      </h1>
      <p className="mt-1 text-slate-500">
        Track your mentorship requests and active mentorships.
      </p>

      {requested && (
        <p className="mt-4 text-sm text-green-700 bg-green-50 rounded-lg p-3 max-w-xl">
          Request sent! An admin will review it shortly.
        </p>
      )}

      {requests.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-500">You haven&apos;t requested any mentorships yet.</p>
          <Link
            href="/dashboard/student/mentors"
            className="mt-4 inline-block rounded-lg bg-slate-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-slate-700"
          >
            Browse mentors
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3 max-w-3xl">
          {requests.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">
                  Mentorship with {r.mentor.name}
                </p>
                <p className="mt-0.5 text-sm text-slate-500 truncate">
                  {r.problemDescription}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge status={r.status} />
                {r.status === "APPROVED" && (
                  <Link
                    href={`/dashboard/hub/${r.id}`}
                    className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-700"
                  >
                    Open hub
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
