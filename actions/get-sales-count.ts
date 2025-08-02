import prismadb from "@/lib/prismadb";

export const getSalesCount = async (storeId: string) => {
  const salesCount = await prismadb.order.count({
    where: {
      storeId: Number(storeId),
      isPaid: true,
    },
  });

  return salesCount;
};
