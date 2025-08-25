import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";
import { OrderWithItems } from "@/lib/prisma-types";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: unknown) {
    if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
      console.error("[WEBHOOK_ERROR]", error.message);
      return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }
  
    console.error("[WEBHOOK_ERROR]", error);
    return new NextResponse("Webhook Error: Invalid request", { status: 400 });
  }
  const session = event.data.object as Stripe.Checkout.Session;
  const address = session?.customer_details?.address;

  const addressComponents = [
    address?.line1,
    address?.line2,
    address?.city,
    address?.state,
    address?.postal_code,
  ];

  const addressString = addressComponents.filter(Boolean).join(", ");

  if (event.type === "checkout.session.completed") {
    try {
      const orderIdString = session?.metadata?.orderId;

      if (!orderIdString) {
        console.error("[WEBHOOK_ERROR] No orderId in metadata");
        return new NextResponse("No orderId in metadata", { status: 400 });
      }

      const orderId = parseInt(orderIdString);

      if (isNaN(orderId)) {
        console.error("[WEBHOOK_ERROR] Invalid orderId:", orderIdString);
        return new NextResponse("Invalid orderId", { status: 400 });
      }

      console.log("[WEBHOOK] Processing payment for order:", orderId);

      const order: OrderWithItems = await prismadb.order.update({
        where: {
          id: orderId,
        },
        data: {
          isPaid: true,
          address: addressString,
          phone: session?.customer_details?.phone || "",
        },
        include: {
          orderItems: true,
        },
      });

      console.log("[WEBHOOK] Order updated successfully:", order.id);

      const productIds = order.orderItems.map(
        (orderItem) => orderItem.productId
      );

      await prismadb.product.updateMany({
        where: {
          id: { in: [...productIds] },
        },
      });

      console.log("[WEBHOOK] Products updated successfully");
    } catch (error: unknown) {
      console.error("[WEBHOOK_UPDATE_ERROR]", error);
    
      const message = error instanceof Error ? error.message : "Unknown error";
      return new NextResponse(`Database Error: ${message}`, { status: 500 });
    }
  }

  return new NextResponse(null, { status: 200 });
}
