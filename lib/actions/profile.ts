"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ProfileState = { error?: string; success?: boolean } | undefined;

export async function updateStudentProfile(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT")
    return { error: "Not authorized." };

  const degree = (formData.get("degree") as string)?.trim();
  const cgpaRaw = (formData.get("cgpa") as string)?.trim();
  const careerGoals = (formData.get("careerGoals") as string)?.trim();
  const skills = (formData.get("skills") as string)?.trim() ?? "";

  const cgpa = cgpaRaw ? parseFloat(cgpaRaw) : null;
  if (cgpa !== null && (isNaN(cgpa) || cgpa < 0 || cgpa > 10))
    return { error: "CGPA must be a number between 0 and 10." };

  await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: { degree, cgpa, careerGoals, skills: normalizeSkills(skills) },
    create: {
      userId: session.user.id,
      degree,
      cgpa,
      careerGoals,
      skills: normalizeSkills(skills),
    },
  });

  revalidatePath("/dashboard/student");
  return { success: true };
}

export async function updateMentorProfile(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await auth();
  if (!session || session.user.role !== "MENTOR")
    return { error: "Not authorized." };

  const bio = (formData.get("bio") as string)?.trim();
  const skills = (formData.get("skills") as string)?.trim() ?? "";
  const availabilityStatus = formData.get("availabilityStatus") as string;
  const maxMentees = parseInt(formData.get("maxMentees") as string, 10);

  if (!["AVAILABLE", "BUSY", "UNAVAILABLE"].includes(availabilityStatus))
    return { error: "Invalid availability status." };
  if (isNaN(maxMentees) || maxMentees < 1 || maxMentees > 20)
    return { error: "Max mentees must be between 1 and 20." };

  await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: {
      bio,
      skills: normalizeSkills(skills),
      availabilityStatus: availabilityStatus as
        | "AVAILABLE"
        | "BUSY"
        | "UNAVAILABLE",
      maxMentees,
    },
    create: {
      userId: session.user.id,
      bio,
      skills: normalizeSkills(skills),
      availabilityStatus: availabilityStatus as
        | "AVAILABLE"
        | "BUSY"
        | "UNAVAILABLE",
      maxMentees,
    },
  });

  revalidatePath("/dashboard/mentor");
  return { success: true };
}

function normalizeSkills(raw: string): string {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .join(",");
}
