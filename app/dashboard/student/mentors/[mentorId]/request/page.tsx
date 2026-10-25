import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RequestForm } from "./RequestForm";

export default async function RequestMentorshipPage({
  params,
}: {
  params: Promise<{ mentorId: string }>;
}) {
  const { mentorId } = await params;

  const mentor = await prisma.user.findFirst({
    where: { id: mentorId, role: "MENTOR" },
    include: { profile: true },
  });
  if (!mentor) notFound();

  return (
    <div className="max-w-xl">
      <Link
        href="/dashboard/student/mentors"
        className="text-sm text-slate-500 hover:text-slate-900"
      >
        ← Back to mentors
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">
        Request mentorship from {mentor.name}
      </h1>
      <p className="mt-1 text-slate-500">
        {mentor.profile?.bio ?? ""}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {(mentor.profile?.skills ?? "")
          .split(",")
          .filter(Boolean)
          .map((s) => (
            <span
              key={s}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
            >
              {s.trim()}
            </span>
          ))}
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6">
        <RequestForm mentorId={mentor.id} />
      </div>
    </div>
  );
}
