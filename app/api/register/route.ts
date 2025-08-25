import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { createUser } from "@/lib/repository/user";
import { RegisterForm, registerSchema } from "@/lib/schemas/userSchema";
// Centralized Error Class for Better Error Handling
class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}
async function validateUserInput(body: RegisterForm) {
  const result = registerSchema.safeParse(body);

  if (!result.success) {
    const errorMessage = result.error.errors[0]?.message || "Invalid input";
    throw new AppError(errorMessage, 422);
  }

  return result.data;
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
  } catch (error: unknown) {
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
