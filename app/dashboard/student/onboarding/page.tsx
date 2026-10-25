import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StudentOnboardingForm } from "./StudentOnboardingForm";

export default async function StudentOnboardingPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-slate-900">My Profile</h1>
      <p className="mt-1 text-slate-500">
        Tell us about yourself so mentors can understand your background.
      </p>
      <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6">
        <StudentOnboardingForm
          defaults={{
            degree: profile?.degree ?? "",
            cgpa: profile?.cgpa?.toString() ?? "",
            careerGoals: profile?.careerGoals ?? "",
            skills: profile?.skills ?? "",
          }}
        />
      </div>
    </div>
  );
}
