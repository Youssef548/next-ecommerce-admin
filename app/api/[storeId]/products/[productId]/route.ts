import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { updateProductWithRelations, adaptProductToLegacy } from "@/lib/product-helpers";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    // Validate store and product
    const store = await prismadb.store.findFirst({
      where: {
        id: parseInt(params.storeId),
      },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Retrieve the specific product with new relationships
    const product = await prismadb.product.findUnique({
      where: {
        id: parseInt(params.productId),
      },
      include: {
        images: true,
        categories: { include: { category: true } },
        sizes: { include: { size: true } },
        colors: { include: { color: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Convert to legacy format for backward compatibility
    const adaptedProduct = adaptProductToLegacy(product);

    return NextResponse.json(adaptedProduct);
  } catch (error) {
    console.error("[PRODUCT_GET]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
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

    if (!params.productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
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

    const product = await updateProductWithRelations(
      parseInt(params.productId),
      {
        name,
        price,
        isFeatured,
        isArchived,
        categoryIds,
        sizeIds,
        colorIds,
        imageUrls: images,
      }
    );

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_PATCH]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
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

    if (!params.productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
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

    const product = await prismadb.product.delete({
      where: {
        id: parseInt(params.productId),
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCT_DELETE]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
