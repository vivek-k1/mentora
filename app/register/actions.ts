"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export type RegisterState = { error?: string } | undefined;

export async function registerUser(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!name || !email || !password) return { error: "All fields are required." };
  if (password.length < 8)
    return { error: "Password must be at least 8 characters." };
  if (role !== "STUDENT" && role !== "MENTOR")
    return { error: "Invalid role." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists." };

  await prisma.user.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role,
      profile: { create: {} },
    },
  });

  redirect("/login?registered=1");
}
