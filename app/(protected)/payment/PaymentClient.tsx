"use client";
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useMe } from '@/app/lib/useMe';
import { authFetch } from '@/app/lib/authFetch';
import { useRouter } from 'next/navigation';

export default function PaymentClient({ amount, packageId }: { amount: string; packageId: number }) {
  const { user } = useMe();
  const router = useRouter();

  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
    currency: 'AUD',
    intent: 'capture',
  } as const;

  return (
    <PayPalScriptProvider options={initialOptions}>
      <div className="card p-6 max-w-md mx-auto text-center">
        <PayPalButtons
          style={{ layout: 'vertical', shape: 'rect', label: 'pay' }}
          createOrder={async () => {
            const res = await authFetch('/api/paypal/createorder', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ order_price: amount, user_id: user?.id, package_id: packageId }),
            });
            const data = await res.json();
            if (!data?.success) throw new Error('Failed to create order');
            return data.data.order.id;
          }}
          onApprove={async (data) => {
            const res = await authFetch('/api/paypal/captureorder', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderID: data.orderID, package_id: packageId }),
            });
            const out = await res.json();
            if (!out?.success) throw new Error('Failed to capture order');
            router.replace('/paymentsuccess');
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
}

