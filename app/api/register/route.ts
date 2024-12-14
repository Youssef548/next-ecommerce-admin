import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { createUser } from "@/lib/repository/user";
import { RegisterForm, registerSchema } from "@/lib/schemas/userSchema";
import * as z from "zod";
// Centralized Error Class for Better Error Handling
class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}
async function validateUserInput(body: RegisterForm) {
  try {
    return registerSchema.parse(body);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors[0]?.message || "Invalid input";
      throw new AppError(errorMessage, 422);
    }

    throw new AppError("Invalid input", 422);
  }
}

// Password Hashing Utility
async function hashPassword(password: string) {
  try {
    return await bcrypt.hash(password, 12);
  } catch {
    throw new AppError("Failed to hash password", 500);
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
