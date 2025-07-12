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
    const {
      name,
      price,
      categoryId,
      colorId,
      sizeId,
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

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    if (!colorId) {
      return NextResponse.json({ error: "Color is required" }, { status: 400 });
    }

    if (!sizeId) {
      return NextResponse.json({ error: "Size is required" }, { status: 400 });
    }

    if (!images || !images.length) {
      return NextResponse.json(
        { error: "Images are required" },
        { status: 400 }
      );
    }

    if (!isFeatured == undefined) {
      return NextResponse.json(
        { error: "Featured is required" },
        { status: 400 }
      );
    }

    if (isArchived == undefined) {
      return NextResponse.json(
        { error: "Archived is required" },
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
    console.log();

    const product = await prismadb.product.create({
      data: {
        name,
        price,
        isFeatured,
        isArchived,
        colorId: parseInt(colorId),
        sizeId: parseInt(sizeId),
        images: {
          create: [...images.map((image: string) => ({ url: image }))],
        },
        categoryId: parseInt(categoryId),
        storeId: parseInt(params.storeId),
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCT_POST]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
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

    const products = await prismadb.product.findMany({
      where: {
        storeId: parseInt(params.storeId),
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        colorId: colorId ? parseInt(colorId) : undefined,
        sizeId: sizeId ? parseInt(sizeId) : undefined,
        isFeatured: isFeatured === "true" ? true : undefined,
        isArchived: false,
      },
      include: {
        images: true,
        category: true,
        color: true,
        size: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("[PRODUCT_GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
