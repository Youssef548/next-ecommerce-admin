import { OrderWithProducts } from "@/lib/prisma-types";
import prismadb from "@/lib/prismadb";

export const getTotalRevenue = async (storeId: string) => {
  const paidOrders: OrderWithProducts[] = await prismadb.order.findMany({
    where: {
      storeId: Number(storeId),
      isPaid: true,
    },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  const totalRevenue = paidOrders.reduce((total, order) => {
    const orderTotal = order.orderItems.reduce((orderSum, item) => {
      return orderSum + Number(item.product.price);
    }, 0);
    return total + orderTotal;
  }, 0);

  return totalRevenue;
};
