User clicks Buy on a Choose button
if not logged in, it redirects to the login page.
if logged in, it initiate paypal payment with NEXT_PUBLIC_PAYPAL_CLIENT_ID.
PayPal popup completes. On success, it Sends a GraphQL mutation CreateOrSaveCreditPurchase with:
UserId, PackageId, PayPal IDs, processor='PAYPAL', and timestamp.
If the backend returns an ID, it redirects to the Payment Success page.
Payment Success page shows “Thanks for your purchase” and auto-redirects to the dashboard after ~4 seconds.
Errors:
If the mutation fails or returns no ID, a toast shows “Payment ... processed, but we have problems to update your credits!”.
