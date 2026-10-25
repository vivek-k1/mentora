import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-100 flex flex-col">
      <header className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto w-full">
        <span className="text-xl font-semibold tracking-tight text-slate-900">
          Mentora
        </span>
        <nav className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-700"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 max-w-2xl">
          Connect students with alumni mentors
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-xl">
          Mentora pairs students seeking career guidance with experienced
          alumni. Browse mentors, request mentorship, and grow together.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/register"
            className="px-6 py-3 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-700"
          >
            Join as a student
          </Link>
          <Link
            href="/register?role=mentor"
            className="px-6 py-3 rounded-lg border border-slate-300 text-slate-800 font-medium hover:bg-slate-50"
          >
            Become a mentor
          </Link>
        </div>
      </section>

      <footer className="py-6 text-center text-sm text-slate-400">
        Mentora — Student Mentoring &amp; Career Support Platform
      </footer>
    </main>
  );
}
