import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { findProductsWithRelations, createProductWithRelations } from "@/lib/product-helpers";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

export async function POST(
  req: NextRequest,
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
    const {
      name,
      price,
      categoryIds,
      colorIds,
      sizeIds,
      images,
      isFeatured,
      isArchived,
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!price) {
      return NextResponse.json({ error: "Price is required" }, { status: 400 });
    }

    if (!categoryIds || !categoryIds.length) {
      return NextResponse.json(
        { error: "At least one category is required" },
        { status: 400 }
      );
    }

    if (!colorIds || !colorIds.length) {
      return NextResponse.json({ error: "At least one color is required" }, { status: 400 });
    }

    if (!sizeIds || !sizeIds.length) {
      return NextResponse.json({ error: "At least one size is required" }, { status: 400 });
    }

    if (!images || !images.length) {
      return NextResponse.json(
        { error: "Images are required" },
        { status: 400 }
      );
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

    const product = await createProductWithRelations({
      name,
      price,
      isFeatured: isFeatured || false,
      isArchived: isArchived || false,
      storeId: parseInt(params.storeId),
      categoryIds,
      sizeIds,
      colorIds,
      imageUrls: images,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCTS_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");
  const colorId = searchParams.get("colorId");
  const sizeId = searchParams.get("sizeId");
  const isFeatured = searchParams.get("isFeatured");

  try {
    if (!params.storeId) {
      return NextResponse.json(
        { error: "Store ID is required" },
        { status: 400 }
      );
    }

    const products = await findProductsWithRelations({
      storeId: parseInt(params.storeId),
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      colorId: colorId ? parseInt(colorId) : undefined,
      sizeId: sizeId ? parseInt(sizeId) : undefined,
      isFeatured: isFeatured === "true" ? true : undefined,
      isArchived: false,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.log("[PRODUCTS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
