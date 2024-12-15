import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { error } from "console";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = parseInt(session.user.id);

    const userExists = await prismadb.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const body = await request.json();

    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const storeExists = await prismadb.store.findFirst({
      where: {
        name,
        userId,
      },
    });

    if (storeExists) {
      return NextResponse.json(
        { error: "Store already exists" },
        { status: 400 }
      );
    }

    const store = await prismadb.store.create({
      data: {
        name,
        userId,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not created something went wrong please try again" },
        { status: 500 }
      );
    }

    return NextResponse.json(store);
  } catch (error) {
    console.log("[STORES_POST]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
