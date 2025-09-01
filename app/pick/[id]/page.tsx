import { notFound } from "next/navigation";

type Params = { params: { id: string } };

export default function PickDetailPage({ params }: Params) {
  const { id } = params;
  if (!id) {
    notFound();
  }
  return (
    <div className="container mx-auto gutters section-spacing">
      <h1 className="text-3xl font-bold mb-4">Pick Detail</h1>
      <p className="dark:text-gray-400">Details for pick ID: <span className="font-mono">{id}</span></p>
    </div>
  );
}


