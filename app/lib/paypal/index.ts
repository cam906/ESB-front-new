import checkoutNodeJssdk from '@paypal/checkout-server-sdk'

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value || String(value).trim() === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const configureEnvironment = function () {
  const clientId = getRequiredEnv('PAYPAL_CLIENT_ID')
  const clientSecret = getRequiredEnv('PAYPAL_CLIENT_SECRET')

  return process.env.NODE_ENV === 'production'
    ? new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret)
    : new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret)
}

const client = function () {
  return new checkoutNodeJssdk.core.PayPalHttpClient(configureEnvironment())
}

export default client