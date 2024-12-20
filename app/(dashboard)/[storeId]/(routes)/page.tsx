import prismadb from "@/lib/prismadb";
import { redirect } from "next/navigation";

interface DashboardPageProps {
  params: { storeId: string };
}

const DashboardPage: React.FC<DashboardPageProps> = async ({ params }) => {
  const storeId = parseInt(params.storeId);

  const store = await prismadb.store.findFirst({
    where: {
      id: storeId,
    },
  });

  if (!store) {
    redirect("/");
  }

  return <div>Active Store: {store?.name}</div>;
};

export default DashboardPage;
