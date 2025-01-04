import prismadb from "@/lib/prismadb";
import { ColorForm } from "./components/ColorForm";

const ColorPage = async ({
  params,
}: {
  params: { colorId: string; storeId: string };
}) => {
  let color = null;
  if (params.colorId !== "new") {
    color = await prismadb.color.findUnique({
      where: {
        id: parseInt(params.colorId),
      },
    });
    console.log("HI");
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ColorForm initialData={color} />
      </div>
    </div>
  );
};

export default ColorPage;
