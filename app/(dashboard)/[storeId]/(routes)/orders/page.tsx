import { format } from "date-fns";
import { Prisma } from "@prisma/client";

import { OrderClient } from "./components/client";
import prismadb from "@/lib/prismadb";
import { OrderColumn } from "./components/columns";
import { priceFormatter } from "@/lib/utils";

// Define types based on Prisma schema
type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    orderItems: {
      include: {
        product: true;
      };
    };
  };
}>;

type OrderItem = Prisma.OrderItemGetPayload<{
  include: {
    product: true;
  };
}>;

const OrdersPage = async ({
  params: { storeId },
}: {
  params: { storeId: string };
}) => {
  const orders = await prismadb.order.findMany({
    where: {
      storeId: parseInt(storeId),
    },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedOrders: OrderColumn[] = orders.map((item: OrderWithItems) => ({
    id: item.id.toString(),
    phone: item.phone,
    address: item.address,
    products: item.orderItems
      .map((orderItem: OrderItem) => orderItem.product?.name || "")
      .join(", "),
    totalPrice: priceFormatter.format(
      item.orderItems.reduce((total: number, orderItem: OrderItem) => {
        return total + Number(orderItem.product.price);
      }, 0)
    ),
    isPaid: item.isPaid,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderClient orders={formattedOrders} />
      </div>
    </div>
  );
};

export default OrdersPage;
