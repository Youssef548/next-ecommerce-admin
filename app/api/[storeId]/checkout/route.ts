import Stripe from "stripe";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";
import { Product } from "@prisma/client";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { productIds } = await req.json();

    if (!productIds || productIds.length === 0) {
      return new NextResponse("Product IDs are required", {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Convert string IDs to integers
    const productIdInts = productIds
      .map((id: string) => parseInt(id))
      .filter((id: number) => !isNaN(id));

    if (productIdInts.length !== productIds.length) {
      return new NextResponse("Invalid product IDs", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const products = await prismadb.product.findMany({
      where: {
        id: { in: productIdInts },
        storeId: parseInt(params.storeId),
        isArchived: false,
      },
    });

    if (products.length === 0) {
      return new NextResponse("No products found", {
        status: 404,
        headers: corsHeaders,
      });
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    products.forEach((product: Product) => {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
          },
          unit_amount: Math.round(parseFloat(product.price.toString()) * 100),
        },
      });
    });

    const order = await prismadb.order.create({
      data: {
        storeId: parseInt(params.storeId),
        isPaid: false,
        orderItems: {
          create: productIdInts.map((productId: number) => ({
            product: {
              connect: {
                id: productId,
              },
            },
          })),
        },
      },
    });

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      billing_address_collection: "required",
      phone_number_collection: {
        enabled: true,
      },
      success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
      cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
      metadata: {
        orderId: order.id.toString(),
      },
    });

    return NextResponse.json({ url: session.url }, { headers: corsHeaders });
  } catch (error) {
    console.error("[CHECKOUT_POST]", error);
    return new NextResponse("Internal error", {
      status: 500,
      headers: corsHeaders,
    });
  }
}
