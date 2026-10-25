import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendMessage, leaveFeedback } from "@/lib/actions/requests";
import { AutoRefresh } from "./AutoRefresh";
import { MessageForm, FeedbackSection } from "./HubClient";

export default async function MentorshipHubPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  const { id } = await params;

  const request = await prisma.mentorshipRequest.findUnique({
    where: { id },
    include: {
      student: true,
      mentor: { include: { profile: true } },
      messages: { include: { sender: true }, orderBy: { createdAt: "asc" } },
    },
  });

  // Only the student, the mentor, or an admin may view this hub
  const isParticipant =
    request &&
    (request.studentId === session.user.id ||
      request.mentorId === session.user.id);
  const isAdmin = session.user.role === "ADMIN";
  if (!request || (!isParticipant && !isAdmin)) notFound();
  if (request.status !== "APPROVED") notFound();

  const backHref =
    session.user.role === "MENTOR"
      ? "/dashboard/mentor"
      : session.user.role === "ADMIN"
        ? "/dashboard/admin"
        : "/dashboard/student";

  const other =
    request.studentId === session.user.id ? request.mentor : request.student;

  return (
    <div className="max-w-3xl">
      <AutoRefresh intervalMs={5000} />
      <Link href={backHref} className="text-sm text-slate-500 hover:text-slate-900">
        ← Back to dashboard
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">
        Mentorship Hub
      </h1>
      <p className="mt-1 text-slate-500">
        {request.student.name} &amp; {request.mentor.name}
      </p>
      <div className="mt-3 rounded-lg bg-slate-100 p-3 text-sm text-slate-600">
        <span className="font-medium text-slate-800">Goal:</span>{" "}
        {request.problemDescription}
      </div>

      {/* Messages */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-200 flex flex-col">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Messages</h2>
          <span className="text-xs text-slate-400">
            Chat with {other.name} · refreshes automatically
          </span>
        </div>
        <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
          {request.messages.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-6">
              No messages yet. Say hello!
            </p>
          )}
          {request.messages.map((m) => {
            const mine = m.senderId === session.user.id;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    mine
                      ? "bg-slate-900 text-white rounded-br-sm"
                      : "bg-slate-100 text-slate-800 rounded-bl-sm"
                  }`}
                >
                  {!mine && (
                    <p className="text-xs font-medium text-slate-500 mb-0.5">
                      {m.sender.name}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  <p
                    className={`mt-1 text-[10px] ${
                      mine ? "text-slate-300" : "text-slate-400"
                    }`}
                  >
                    {m.createdAt.toLocaleString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        {isParticipant && (
          <div className="border-t border-slate-100 p-4">
            <MessageForm requestId={request.id} action={sendMessage} />
          </div>
        )}
      </div>

      {/* Meeting log / feedback */}
      <FeedbackSection
        requestId={request.id}
        feedback={request.feedback}
        canEdit={!!isParticipant}
        action={leaveFeedback}
      />
    </div>
  );
}
