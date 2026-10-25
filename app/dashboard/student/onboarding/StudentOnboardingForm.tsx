"use client";

import { useActionState } from "react";
import { updateStudentProfile, type ProfileState } from "@/lib/actions/profile";
import { inputClass, labelClass, buttonClass } from "@/components/forms";

export function StudentOnboardingForm({
  defaults,
}: {
  defaults: { degree: string; cgpa: string; careerGoals: string; skills: string };
}) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    updateStudentProfile,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <p className="text-sm text-red-700 bg-red-50 rounded-lg p-3">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-green-700 bg-green-50 rounded-lg p-3">
          Profile saved.
        </p>
      )}

      <div>
        <label className={labelClass}>Degree / Program</label>
        <input
          name="degree"
          defaultValue={defaults.degree}
          required
          className={inputClass}
          placeholder="B.Tech Computer Science"
        />
      </div>
      <div>
        <label className={labelClass}>CGPA (out of 10)</label>
        <input
          name="cgpa"
          type="number"
          step="0.01"
          min="0"
          max="10"
          defaultValue={defaults.cgpa}
          className={inputClass}
          placeholder="8.5"
        />
      </div>
      <div>
        <label className={labelClass}>Career interests / goals</label>
        <textarea
          name="careerGoals"
          rows={3}
          defaultValue={defaults.careerGoals}
          required
          className={inputClass}
          placeholder="e.g. I want to become a data scientist at a product company…"
        />
      </div>
      <div>
        <label className={labelClass}>Skills (comma-separated)</label>
        <input
          name="skills"
          defaultValue={defaults.skills}
          className={inputClass}
          placeholder="Python, React, SQL"
        />
      </div>
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
