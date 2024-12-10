import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

// Centralized Error Class for Better Error Handling
class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Input Validation with Clearer Separation of Concerns
async function validateUserInput(body: any) {
  const { name, email, password } = body;

  if (!name || !email || !password) {
    throw new AppError("Missing required fields", 422);
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    throw new AppError("Invalid email format", 422);
  }

  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters long", 422);
  }

  return { name, email, password };
}

// Password Hashing Utility
async function hashPassword(password: string) {
  try {
    return await bcrypt.hash(password, 12);
  } catch {
    throw new AppError("Failed to hash password", 500);
  }
}

// Database Interaction with Error Logging
async function createUser(data: {
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

// API Route Handler with Improved Error Responses
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = await validateUserInput(body);

    const hashedPassword = await hashPassword(password);

    const user = await createUser({ name, email, hashedPassword });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error: any) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error("Unexpected Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
