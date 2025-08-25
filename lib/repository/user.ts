import prisma from "@/lib/prismadb";
import { AppError } from "@/lib/errors";

export async function createUser(data: {
  name: string;
  email: string;
  hashedPassword: string;
}) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (user) {
      throw new AppError("User already exists", 400);
    }

    return await prisma.user.create({ data });
  } catch (error: unknown) {
    console.error("Database Error:", error);
    throw new AppError("Failed to create user", 500);
  }
}
