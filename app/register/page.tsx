"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerUser, type RegisterState } from "./actions";

function RegisterForm() {
  const params = useSearchParams();
  const defaultRole =
    params.get("role")?.toLowerCase() === "mentor" ? "MENTOR" : "STUDENT";
  const [state, formAction, pending] = useActionState<RegisterState, FormData>(
    registerUser,
    undefined
  );

  return (
    <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
      <h1 className="text-2xl font-semibold text-slate-900">Create account</h1>
      <p className="mt-1 text-sm text-slate-500">
        Join Mentora as a student or mentor
      </p>

      {state?.error && (
        <p className="mt-4 text-sm text-red-700 bg-red-50 rounded-lg p-3">
          {state.error}
        </p>
      )}

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Full name
          </label>
          <input
            name="name"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="you@college.edu"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="At least 8 characters"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            I am a
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(["STUDENT", "MENTOR"] as const).map((r) => (
              <label
                key={r}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm cursor-pointer has-[:checked]:border-slate-900 has-[:checked]:bg-slate-900 has-[:checked]:text-white"
              >
                <input
                  type="radio"
                  name="role"
                  value={r}
                  defaultChecked={defaultRole === r}
                  className="sr-only"
                />
                {r === "STUDENT" ? "Student" : "Mentor (Alumni)"}
              </label>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-slate-900 text-white py-2.5 text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
        >
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-500 text-center">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-slate-900 underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Suspense>
        <RegisterForm />
      </Suspense>
    </main>
  );
}
