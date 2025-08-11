import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; billboardId: string } }
) {
  try {
    // Validate store and billboard
    const store = await prismadb.store.findFirst({
      where: {
        id: parseInt(params.storeId),
      },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Retrieve the specific billboard
    const billboard = await prismadb.billboard.findFirst({
      where: {
        id: parseInt(params.billboardId),
        storeId: parseInt(params.storeId),
      },
    });

    if (!billboard) {
      return NextResponse.json(
        { error: "Billboard not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(billboard);
  } catch (error) {
    console.error("[BILLBOARD_GET]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; billboardId: string } }
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
    const { label, imageUrl } = body;

    if (!label) {
      return NextResponse.json({ error: "Label is required" }, { status: 400 });
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    if (!params.storeId) {
      return NextResponse.json(
        { error: "Store ID is required" },
        { status: 400 }
      );
    }

    if (!params.billboardId) {
      return NextResponse.json(
        { error: "Billboard ID is required" },
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

    const billboard = await prismadb.billboard.updateMany({
      where: {
        id: parseInt(params.billboardId),
        storeId: parseInt(params.storeId),
      },
      data: {
        label,
        imageUrl,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.error("[BILLBOARD_PATCH]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; billboardId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    const userExists = await prismadb.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    if (!params.storeId) {
      return NextResponse.json(
        { error: "Store ID is required" },
        { status: 400 }
      );
    }

    if (!params.billboardId) {
      return NextResponse.json(
        { error: "Billboard ID is required" },
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

    const billboard = await prismadb.billboard.deleteMany({
      where: {
        id: parseInt(params.billboardId),
        storeId: parseInt(params.storeId),
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.error("[BILLBOARD_DELETE]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
