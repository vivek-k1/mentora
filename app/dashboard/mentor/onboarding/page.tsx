import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MentorOnboardingForm } from "./MentorOnboardingForm";

export default async function MentorOnboardingPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-slate-900">My Profile</h1>
      <p className="mt-1 text-slate-500">
        Students see this when browsing mentors. Keep it up to date.
      </p>
      <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6">
        <MentorOnboardingForm
          defaults={{
            bio: profile?.bio ?? "",
            skills: profile?.skills ?? "",
            availabilityStatus: profile?.availabilityStatus ?? "AVAILABLE",
            maxMentees: profile?.maxMentees?.toString() ?? "3",
          }}
        />
      </div>
    </div>
  );
}
