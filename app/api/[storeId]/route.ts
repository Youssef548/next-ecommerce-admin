import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";


export async function GET(
    req: Request,
    { params }: { params: { storeId: string } }
  ) {
    try {

      if (!params.storeId) {
        return NextResponse.json(
          { error: "Store ID is required" },
          { status: 400 }
        );
      }
  
      const store = await prismadb.store.findUnique({
        where: {
          id: parseInt(params.storeId),
        }
      });
  
      return NextResponse.json(store);
    } catch (error) {
      console.error("[STORE_GET]", error);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
  }