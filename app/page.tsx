import HomeLanding from "./components/HomeLanding";
import prisma from "@/prisma";

export default async function Home() {
  const packages = await prisma.package.findMany({
    where: { deletedAt: null },
    orderBy: { priceInCents: "asc" },
  });

  return <HomeLanding packages={packages} />;
}
