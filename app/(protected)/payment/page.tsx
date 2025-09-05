import prisma from "@/prisma";
import PaymentClient from "./PaymentClient";
import { redirect } from "next/navigation";

type Props = { searchParams: Promise<{ packageId?: string }> };

export default async function PaymentPage({ searchParams }: Props) {
  const sp = await searchParams;
  const packageId = Number(sp?.packageId || 0);
  if (!packageId) redirect("/packages");

  const pkg = await prisma.package.findUnique({ where: { id: packageId } });
  if (!pkg) redirect("/packages");

  return (
    <div className="container mx-auto gutters section-spacing text-center">
      <h1 className="text-3xl font-bold mb-4">Checkout: {pkg.title}</h1>
      <p className="mb-6">{pkg.description}</p>
      <PaymentClient amount={(pkg.priceInCents / 100).toFixed(2)} packageId={pkg.id} />
    </div>
  );
}


