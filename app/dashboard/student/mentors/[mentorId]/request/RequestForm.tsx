"use client";

import { useActionState } from "react";
import {
  createMentorshipRequest,
  type ActionState,
} from "@/lib/actions/requests";
import { inputClass, labelClass, buttonClass } from "@/components/forms";

export function RequestForm({ mentorId }: { mentorId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createMentorshipRequest,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="mentorId" value={mentorId} />
      {state?.error && (
        <p className="text-sm text-red-700 bg-red-50 rounded-lg p-3">
          {state.error}
        </p>
      )}
      <div>
        <label className={labelClass}>
          What do you need help with? Describe your goals.
        </label>
        <textarea
          name="problemDescription"
          rows={5}
          required
          minLength={20}
          className={inputClass}
          placeholder="e.g. I'm a 3rd-year CS student aiming for a backend role. I'd love guidance on system design fundamentals and interview preparation…"
        />
      </div>
      <p className="text-xs text-slate-400">
        Your request will first be reviewed by an admin, then sent to the
        mentor.
      </p>
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Sending…" : "Send request"}
      </button>
    </form>
  );
}
