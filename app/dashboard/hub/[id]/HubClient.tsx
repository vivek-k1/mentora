"use client";

import { inputClass, buttonClass, labelClass } from "@/components/forms";

export function MessageForm({
  requestId,
  action,
}: {
  requestId: string;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action} className="flex gap-2">
      <input type="hidden" name="requestId" value={requestId} />
      <input
        name="content"
        required
        maxLength={2000}
        placeholder="Write a message…"
        className={`${inputClass} mt-0`}
      />
      <button type="submit" className={`${buttonClass} shrink-0`}>
        Send
      </button>
    </form>
  );
}

export function FeedbackSection({
  requestId,
  feedback,
  canEdit,
  action,
}: {
  requestId: string;
  feedback: string | null;
  canEdit: boolean;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-5">
      <h2 className="font-semibold text-slate-900">Meeting log &amp; feedback</h2>
      <p className="mt-1 text-sm text-slate-500">
        Record what you discussed after each meeting.
      </p>

      {feedback ? (
        <pre className="mt-4 whitespace-pre-wrap text-sm text-slate-700 bg-slate-50 rounded-lg p-3 font-sans">
          {feedback}
        </pre>
      ) : (
        <p className="mt-4 text-sm text-slate-400">No meetings logged yet.</p>
      )}

      {canEdit && (
        <form action={action} className="mt-4 space-y-3">
          <input type="hidden" name="requestId" value={requestId} />
          <div>
            <label className={labelClass}>Log a meeting</label>
            <textarea
              name="feedback"
              rows={3}
              required
              className={inputClass}
              placeholder="e.g. Discussed resume structure and a 4-week interview plan."
            />
          </div>
          <button type="submit" className={buttonClass}>
            Log meeting / leave feedback
          </button>
        </form>
      )}
    </div>
  );
}
