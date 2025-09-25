import HomeLanding from "./components/HomeLanding";
import prisma from "@/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function Home() {
  const packages = await prisma.packages.findMany({
    where: { deletedAt: null },
    orderBy: { priceInCents: "asc" },
  });

  return <HomeLanding packages={packages} />;
}
