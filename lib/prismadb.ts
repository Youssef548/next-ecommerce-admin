import { PrismaClient } from "@prisma/client";

// @ts-expect-error - globalThis augmentation
const client = globalThis.prisma || new PrismaClient();
// @ts-expect-error - globalThis augmentation
if (process.env.NODE_ENV !== "production") globalThis.prisma = client;

export default client;
