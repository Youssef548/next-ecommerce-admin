import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    const userExists = await prismadb.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const body = await req.json();
    const { label, billboardId } = body;

    if (!label) {
      return NextResponse.json({ error: "Label is required" }, { status: 400 });
    }

    if (!billboardId) {
      return NextResponse.json({ error: "Billboard ID is required" }, { status: 400 });
    }

    if (!params.storeId) {
      return NextResponse.json(
        { error: "Store ID is required" },
        { status: 400 }
      );
    }

    // Check if the store belongs to the user
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: parseInt(params.storeId),
        userId,
      },
    });

    if (!storeByUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const category = await prismadb.category.create({
      data: {
        label,
        billboardId: parseInt(billboardId),
        storeId: parseInt(params.storeId),
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORY_POST]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {

    if (!params.storeId) {
      return NextResponse.json(
        { error: "Store ID is required" },
        { status: 400 }
      );
    }

    const categories = await prismadb.category.findMany({
      where: {
        storeId: parseInt(params.storeId),
      },
      include: {
        billboard: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("[CATEGORY_GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
