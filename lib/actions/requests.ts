"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ActionState = { error?: string; success?: boolean } | undefined;

const ACTIVE_STATUSES = ["PENDING_ADMIN", "PENDING_MENTOR", "APPROVED"] as const;

/** Student → create a mentorship request (status PENDING_ADMIN). */
export async function createMentorshipRequest(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session || session.user.role !== "STUDENT")
    return { error: "Only students can request mentorship." };

  const mentorId = formData.get("mentorId") as string;
  const problemDescription = (
    formData.get("problemDescription") as string
  )?.trim();

  if (!mentorId || !problemDescription)
    return { error: "Please describe what you need help with." };

  const mentor = await prisma.user.findFirst({
    where: { id: mentorId, role: "MENTOR" },
    include: { profile: true },
  });
  if (!mentor) return { error: "Mentor not found." };
  if (mentor.profile?.availabilityStatus !== "AVAILABLE")
    return { error: "This mentor is not currently available." };

  const existing = await prisma.mentorshipRequest.findFirst({
    where: {
      studentId: session.user.id,
      mentorId,
      status: { in: [...ACTIVE_STATUSES] },
    },
  });
  if (existing)
    return { error: "You already have an active request with this mentor." };

  await prisma.mentorshipRequest.create({
    data: {
      studentId: session.user.id,
      mentorId,
      problemDescription,
      status: "PENDING_ADMIN",
    },
  });

  revalidatePath("/dashboard/student");
  redirect("/dashboard/student?requested=1");
}

/** Admin → approve (PENDING_ADMIN → PENDING_MENTOR) or reject. */
export async function adminDecideRequest(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return;

  const id = formData.get("requestId") as string;
  const decision = formData.get("decision") as string;

  const request = await prisma.mentorshipRequest.findUnique({ where: { id } });
  if (!request || request.status !== "PENDING_ADMIN") return;

  await prisma.mentorshipRequest.update({
    where: { id },
    data: { status: decision === "approve" ? "PENDING_MENTOR" : "REJECTED" },
  });

  revalidatePath("/dashboard/admin");
}

/** Mentor → accept (PENDING_MENTOR → APPROVED) or reject. */
export async function mentorDecideRequest(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session || session.user.role !== "MENTOR") return;

  const id = formData.get("requestId") as string;
  const decision = formData.get("decision") as string;

  const request = await prisma.mentorshipRequest.findUnique({ where: { id } });
  if (
    !request ||
    request.mentorId !== session.user.id ||
    request.status !== "PENDING_MENTOR"
  )
    return;

  if (decision === "accept") {
    // Capacity check
    const [activeCount, profile] = await Promise.all([
      prisma.mentorshipRequest.count({
        where: { mentorId: session.user.id, status: "APPROVED" },
      }),
      prisma.profile.findUnique({ where: { userId: session.user.id } }),
    ]);
    if (profile && activeCount >= profile.maxMentees) {
      // At capacity — leave request pending.
      revalidatePath("/dashboard/mentor");
      return;
    }
  }

  await prisma.mentorshipRequest.update({
    where: { id },
    data: { status: decision === "accept" ? "APPROVED" : "REJECTED" },
  });

  revalidatePath("/dashboard/mentor");
}

/** Student or mentor on an APPROVED request → send a message. */
export async function sendMessage(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session) return;

  const requestId = formData.get("requestId") as string;
  const content = (formData.get("content") as string)?.trim();
  if (!requestId || !content) return;

  const request = await prisma.mentorshipRequest.findUnique({
    where: { id: requestId },
  });
  if (
    !request ||
    request.status !== "APPROVED" ||
    (request.studentId !== session.user.id &&
      request.mentorId !== session.user.id)
  )
    return;

  await prisma.message.create({
    data: { requestId, senderId: session.user.id, content },
  });

  revalidatePath(`/dashboard/hub/${requestId}`);
}

/** Student or mentor → log a meeting / leave feedback on an APPROVED request. */
export async function leaveFeedback(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session) return;

  const requestId = formData.get("requestId") as string;
  const feedback = (formData.get("feedback") as string)?.trim();
  if (!requestId || !feedback) return;

  const request = await prisma.mentorshipRequest.findUnique({
    where: { id: requestId },
  });
  if (
    !request ||
    request.status !== "APPROVED" ||
    (request.studentId !== session.user.id &&
      request.mentorId !== session.user.id)
  )
    return;

  const stamp = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const author = session.user.name ?? "Unknown";
  const entry = `[${stamp}] ${author}: ${feedback}`;

  await prisma.mentorshipRequest.update({
    where: { id: requestId },
    data: {
      feedback: request.feedback ? `${request.feedback}\n${entry}` : entry,
    },
  });

  revalidatePath(`/dashboard/hub/${requestId}`);
}
