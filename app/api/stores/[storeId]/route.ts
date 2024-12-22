import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function PATCH(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.storeId) {
      return NextResponse.json(
        { error: "Store id is required" },
        { status: 400 }
      );
    }

    const storeId = parseInt(params.storeId);
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
        userId,
        id: storeId,
      },
    });

    if (!storeExists) {
      return NextResponse.json({ error: "Store not found" }, { status: 400 });
    }
    if (storeExists.id !== storeId) {
      return NextResponse.json(
        { error: "You are not the owner of this store" },
        { status: 400 }
      );
    }

    const store = await prismadb.store.update({
      where: {
        id: storeId,
        userId,
      },
      data: {
        name,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not updated something went wrong please try again" },
        { status: 500 }
      );
    }

    return NextResponse.json(store);
  } catch (error) {
    console.log("[STORE_PATCH]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.storeId) {
      return NextResponse.json(
        { error: "Store id is required" },
        { status: 400 }
      );
    }

    const storeId = parseInt(params.storeId);

    const userId = parseInt(session.user.id);

    const userExists = await prismadb.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const storeExists = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    });

    if (!storeExists) {
      return NextResponse.json({ error: "Store not found" }, { status: 400 });
    }

    if (storeExists.id !== storeId) {
      return NextResponse.json(
        { error: "You are not the owner of this store" },
        { status: 400 }
      );
    }

    const store = await prismadb.store.delete({
      where: {
        id: storeId,
        userId,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not deleted. Something went wrong, please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(store);
  } catch (error) {
    console.log("[STORE_DELETE]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
