import prisma from '@/prisma';
import client from '@/app/lib/paypal';
import paypal from '@paypal/checkout-server-sdk';
import { getCurrentUserFromRequest } from '@/app/lib/cognitoServer';


export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUserFromRequest(request);
    if (!currentUser) return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const orderID = body?.orderID as string | undefined;
    const packageId = Number(body?.package_id || 0);
    if (!orderID || !packageId) return Response.json({ success: false, message: 'Missing orderID or package_id' }, { status: 400 });

    const paypalClient = client();
    const req = new paypal.orders.OrdersCaptureRequest(orderID);
    // PayPal types for OrdersCaptureRequest allow an empty object at runtime.
    // The SDK's TS typing expects RequestData with payment_source, but it's optional in practice.
    // Cast to unknown to satisfy TS without changing runtime behavior.
    (req as unknown as { requestBody: (b: unknown) => void }).requestBody({});
    const response = await paypalClient.execute(req);
    if (!response || response.statusCode !== 201) {
      return Response.json({ success: false, message: 'Failed to capture order' }, { status: 500 });
    }

    // Idempotency: ensure we have created order and not already captured
    const existingOrder = await prisma.order.findUnique({ where: { paypalOrderId: orderID } });
    if (!existingOrder) {
      return Response.json({ success: false, message: 'Order not found' }, { status: 404 });
    }
    if (existingOrder.status === 'captured') {
      return Response.json({ success: true, data: { creditsAdded: 0 } });
    }

    // Credit user based on package
    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) return Response.json({ success: false, message: 'Package not found' }, { status: 404 });

    // Optional: validate amount and currency
    type PaypalCaptureAmount = { currency_code?: string; value?: string };
    type PaypalCaptureResult = { purchase_units?: { payments?: { captures?: { amount?: PaypalCaptureAmount }[] } }[] };
    const result = response.result as unknown as PaypalCaptureResult;
    const capturedAmount = result?.purchase_units?.[0]?.payments?.captures?.[0]?.amount;
    if (capturedAmount?.currency_code !== 'AUD' || Number(capturedAmount?.value) * 100 !== pkg.priceInCents) {
      console.warn('Captured amount mismatch', capturedAmount, pkg.priceInCents);
    }

    await prisma.creditPurchase.create({
      data: {
        UserId: currentUser.id,
        PackageId: pkg.id,
        priceInCents: pkg.priceInCents,
        credits: pkg.credits,
        callbackKey: orderID,
        startedAt: new Date(),
        appliedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { credits: { increment: pkg.credits } },
    });

    await prisma.order.update({
      where: { paypalOrderId: orderID },
      data: { status: 'captured', updatedAt: new Date(), rawResponse: JSON.stringify(result) },
    });

    return Response.json({ success: true, data: { creditsAdded: pkg.credits } });
  } catch (err) {
    console.error('Err at Capture Order: ', err);
    return Response.json({ success: false, message: 'Error capturing order' }, { status: 500 });
  }
}


