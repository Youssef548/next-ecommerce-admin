import prisma from "@/lib/prismadb";
import { AppError } from "@/lib/errors";

export async function createUser(data: {
  name: string;
  email: string;
  hashedPassword: string;
}) {
  try {
    return await prisma.user.create({ data });
  } catch (error: any) {
    console.error("Database Error:", error);
    throw new AppError("Failed to create user", 500);
  }
}
