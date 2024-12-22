import { getServerSession } from "next-auth";

import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";

import { SettingsForm } from "./components/SettingsForm";
import { authOptions } from "@/lib/auth";

interface SettingsPageProps {
  params: {
    storeId: string;
  };
}

const SettingsPage = async ({ params }: SettingsPageProps) => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth");
  } else if (!session.user.id) {
    redirect("/");
  }

  if (!params.storeId) {
    redirect("/");
  }
  const storeId = parseInt(params.storeId);
  const userId = parseInt(session.user.id);

  const store = await prismadb.store.findFirst({
    where: {
      id: storeId,
      userId,
    },
  });

  if (!store) {
    redirect("/");
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SettingsForm initialData={store} />
      </div>
    </div>
  );
};

export default SettingsPage;
