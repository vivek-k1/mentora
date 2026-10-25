import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

const NAV: Record<string, { href: string; label: string }[]> = {
  STUDENT: [
    { href: "/dashboard/student", label: "Overview" },
    { href: "/dashboard/student/mentors", label: "Find Mentors" },
    { href: "/dashboard/student/onboarding", label: "My Profile" },
  ],
  MENTOR: [
    { href: "/dashboard/mentor", label: "Overview" },
    { href: "/dashboard/mentor/onboarding", label: "My Profile" },
  ],
  ADMIN: [{ href: "/dashboard/admin", label: "Overview" }],
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  const role = session.user.role;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-60 shrink-0 border-r border-slate-200 bg-white flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100">
          <Link href="/" className="text-lg font-semibold text-slate-900">
            Mentora
          </Link>
          <p className="text-xs text-slate-400 mt-0.5 capitalize">
            {role.toLowerCase()} portal
          </p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {(NAV[role] ?? []).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 font-medium"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-slate-100">
          <p className="text-sm font-medium text-slate-800 truncate">
            {session.user.name}
          </p>
          <p className="text-xs text-slate-400 truncate">{session.user.email}</p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button className="mt-3 w-full rounded-lg border border-slate-300 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
