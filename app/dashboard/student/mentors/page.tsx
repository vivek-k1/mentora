import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function MentorDiscoveryPage({
  searchParams,
}: {
  searchParams: Promise<{ skill?: string }>;
}) {
  const { skill } = await searchParams;

  const mentors = await prisma.user.findMany({
    where: {
      role: "MENTOR",
      profile: {
        availabilityStatus: "AVAILABLE",
        ...(skill ? { skills: { contains: skill } } : {}),
      },
    },
    include: { profile: true },
    orderBy: { name: "asc" },
  });

  // Build the set of all skills across available mentors for filter chips
  const allMentors = await prisma.profile.findMany({
    where: { user: { role: "MENTOR" }, availabilityStatus: "AVAILABLE" },
    select: { skills: true },
  });
  const allSkills = Array.from(
    new Set(
      allMentors.flatMap((p) => p.skills.split(",").map((s) => s.trim()))
    )
  )
    .filter(Boolean)
    .sort();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Find Mentors</h1>
      <p className="mt-1 text-slate-500">
        Browse available alumni mentors and request mentorship.
      </p>

      {/* Skill filter chips */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/dashboard/student/mentors"
          className={`rounded-full px-3 py-1 text-sm border ${
            !skill
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
          }`}
        >
          All
        </Link>
        {allSkills.map((s) => (
          <Link
            key={s}
            href={`/dashboard/student/mentors?skill=${encodeURIComponent(s)}`}
            className={`rounded-full px-3 py-1 text-sm border ${
              skill === s
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {/* Mentor grid */}
      {mentors.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-400">
          No available mentors{skill ? ` with “${skill}”` : ""} right now.
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {mentors.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold">
                  {m.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{m.name}</p>
                  <p className="text-xs text-green-600 font-medium">
                    Available
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600 line-clamp-3 flex-1">
                {m.profile?.bio ?? "No bio yet."}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(m.profile?.skills ?? "")
                  .split(",")
                  .filter(Boolean)
                  .slice(0, 4)
                  .map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                    >
                      {s.trim()}
                    </span>
                  ))}
              </div>
              <Link
                href={`/dashboard/student/mentors/${m.id}/request`}
                className="mt-4 rounded-lg bg-slate-900 text-white text-center py-2 text-sm font-medium hover:bg-slate-700"
              >
                Request Mentorship
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
