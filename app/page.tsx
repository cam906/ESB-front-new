import HomeLanding from "./components/HomeLanding";
import prisma from "@/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function Home() {
  //print out env variables
  console.log(process.env.DATABASE_URL);
  console.log(process.env._AWS_ACCESS_KEY_ID);
  console.log(process.env._AWS_SECRET_ACCESS_KEY);
  const packages = await prisma.package.findMany({
    where: { deletedAt: null },
    orderBy: { priceInCents: "asc" },
  });

  return <HomeLanding packages={packages} />;
}
