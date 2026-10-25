import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function DashboardRedirect() {
  const session = await auth();
  if (!session) redirect("/login");

  switch (session.user.role) {
    case "ADMIN":
      redirect("/dashboard/admin");
    case "MENTOR":
      redirect("/dashboard/mentor");
    default:
      redirect("/dashboard/student");
  }
}
