import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const password = await bcrypt.hash("password123", 10);

  // Admin
  await prisma.user.upsert({
    where: { email: "admin@mentora.edu" },
    update: {},
    create: {
      name: "Platform Admin",
      email: "admin@mentora.edu",
      password,
      role: "ADMIN",
    },
  });

  // Mentors
  const mentors = [
    {
      name: "Aarav Sharma",
      email: "aarav@alumni.edu",
      bio: "Senior Software Engineer at a fintech startup. Happy to help with web dev careers and interview prep.",
      skills: "React,Node.js,System Design,Interview Prep",
      maxMentees: 3,
    },
    {
      name: "Priya Nair",
      email: "priya@alumni.edu",
      bio: "Data Scientist with 6 years of experience in ML and analytics.",
      skills: "Python,Machine Learning,Data Science,SQL",
      maxMentees: 2,
    },
    {
      name: "Rohan Mehta",
      email: "rohan@alumni.edu",
      bio: "Product Manager, ex-software engineer. Can guide on PM transitions and higher studies abroad.",
      skills: "Product Management,Higher Studies,Resume Review",
      maxMentees: 4,
    },
  ];

  for (const m of mentors) {
    await prisma.user.upsert({
      where: { email: m.email },
      update: {},
      create: {
        name: m.name,
        email: m.email,
        password,
        role: "MENTOR",
        profile: {
          create: {
            bio: m.bio,
            skills: m.skills,
            availabilityStatus: "AVAILABLE",
            maxMentees: m.maxMentees,
          },
        },
      },
    });
  }

  // Students
  const students = [
    {
      name: "Isha Verma",
      email: "isha@student.edu",
      degree: "B.Tech Computer Science",
      cgpa: 8.7,
      careerGoals: "Become a full-stack developer at a product company.",
      skills: "JavaScript,React",
    },
    {
      name: "Karan Singh",
      email: "karan@student.edu",
      degree: "B.Tech Electronics",
      cgpa: 7.9,
      careerGoals: "Transition into data science roles.",
      skills: "Python,Statistics",
    },
  ];

  for (const s of students) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        name: s.name,
        email: s.email,
        password,
        role: "STUDENT",
        profile: {
          create: {
            degree: s.degree,
            cgpa: s.cgpa,
            careerGoals: s.careerGoals,
            skills: s.skills,
          },
        },
      },
    });
  }

  console.log("Seed complete. All accounts use password: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
