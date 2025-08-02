import { Prisma } from "@prisma/client";

// Validator to include orderItems
export const orderWithItemsInclude =
  Prisma.validator<Prisma.OrderDefaultArgs>()({
    include: {
      orderItems: true,
    },
  });

export const orderWithProductsInclude =
  Prisma.validator<Prisma.OrderDefaultArgs>()({
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

// Type of Order with orderItems
export type OrderWithItems = Prisma.OrderGetPayload<
  typeof orderWithItemsInclude
>;

// Type of Order with products
export type OrderWithProducts = Prisma.OrderGetPayload<
  typeof orderWithProductsInclude
>;
