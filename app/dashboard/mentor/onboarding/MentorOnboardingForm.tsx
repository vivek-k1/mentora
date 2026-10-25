"use client";

import { useActionState } from "react";
import { updateMentorProfile, type ProfileState } from "@/lib/actions/profile";
import { inputClass, labelClass, buttonClass } from "@/components/forms";

export function MentorOnboardingForm({
  defaults,
}: {
  defaults: {
    bio: string;
    skills: string;
    availabilityStatus: string;
    maxMentees: string;
  };
}) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    updateMentorProfile,
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
        <label className={labelClass}>Bio</label>
        <textarea
          name="bio"
          rows={3}
          defaultValue={defaults.bio}
          required
          className={inputClass}
          placeholder="Who are you and how can you help students?"
        />
      </div>
      <div>
        <label className={labelClass}>Skills you can mentor on (comma-separated)</label>
        <input
          name="skills"
          defaultValue={defaults.skills}
          required
          className={inputClass}
          placeholder="React, System Design, Interview Prep"
        />
      </div>
      <div>
        <label className={labelClass}>Availability</label>
        <select
          name="availabilityStatus"
          defaultValue={defaults.availabilityStatus}
          className={inputClass}
        >
          <option value="AVAILABLE">Available — accepting new mentees</option>
          <option value="BUSY">Busy — limited availability</option>
          <option value="UNAVAILABLE">Unavailable</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Maximum mentees</label>
        <input
          name="maxMentees"
          type="number"
          min="1"
          max="20"
          defaultValue={defaults.maxMentees}
          required
          className={inputClass}
        />
      </div>
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
