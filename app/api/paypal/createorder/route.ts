import prisma from '@/prisma';
import client from '@/app/lib/paypal';
import paypal from '@paypal/checkout-server-sdk';
import { getCurrentUserFromRequest } from '@/app/lib/cognitoServer';

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUserFromRequest(request);
    if (!currentUser) return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const packageId = Number(body?.package_id || 0);
    if (!packageId) return Response.json({ success: false, message: 'Missing package_id' }, { status: 400 });

    const pkg = await prisma.packages.findUnique({ where: { id: packageId } });
    if (!pkg) return Response.json({ success: false, message: 'Package not found' }, { status: 404 });

    const amountValue = (pkg.priceInCents / 100).toFixed(2);

    const paypalClient = client();
    const req = new paypal.orders.OrdersCreateRequest();
    // @ts-expect-error prefer exists on request
    req.headers = { ...req.headers, prefer: 'return=representation' };
    req.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: { currency_code: 'AUD', value: amountValue },
          custom_id: String(packageId),
        },
      ],
    });

    const response = await paypalClient.execute(req);
    if (response.statusCode !== 201) {
      return Response.json({ success: false, message: 'Failed to create order' }, { status: 500 });
    }

    // Persist order in DB
    type PaypalCreateResult = { id?: string };
    const result = response.result as unknown as PaypalCreateResult;
    const paypalOrderId = String(result?.id || '');
    if (!paypalOrderId) {
      return Response.json({ success: false, message: 'Invalid PayPal response' }, { status: 500 });
    }

    await prisma.order.create({
      data: {
        UserId: currentUser.id,
        PackageId: pkg.id,
        paypalOrderId,
        amountInCents: pkg.priceInCents,
        currency: 'AUD',
        status: 'created',
        rawResponse: JSON.stringify(result),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return Response.json({ success: true, data: { order: response.result } });
  } catch (err) {
    console.error('Err at Create Order: ', err);
    return Response.json({ success: false, message: 'Error creating order' }, { status: 500 });
  }
}


