const PAYPAL_API_BASE =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

export const isPaypalConfigured = Boolean(
  process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET
);

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal no está configurado (faltan PAYPAL_CLIENT_ID/PAYPAL_CLIENT_SECRET).");
  }

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`No se pudo autenticar con PayPal (${response.status}): ${await response.text()}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export async function paypalFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Error de PayPal (${response.status}) en ${path}: ${await response.text()}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export type PaypalSubscriptionStatus =
  | "APPROVAL_PENDING"
  | "APPROVED"
  | "ACTIVE"
  | "SUSPENDED"
  | "CANCELLED"
  | "EXPIRED";

export type PaypalSubscription = {
  id: string;
  status: PaypalSubscriptionStatus;
  plan_id: string;
  billing_info?: {
    next_billing_time?: string;
  };
};

export function getPaypalSubscription(subscriptionId: string) {
  return paypalFetch<PaypalSubscription>(`/v1/billing/subscriptions/${subscriptionId}`);
}

export function cancelPaypalSubscription(subscriptionId: string, reason: string) {
  return paypalFetch<void>(`/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export async function verifyPaypalWebhookSignature(params: {
  transmissionId: string;
  transmissionTime: string;
  certUrl: string;
  authAlgo: string;
  transmissionSig: string;
  webhookId: string;
  webhookEvent: unknown;
}): Promise<boolean> {
  const result = await paypalFetch<{ verification_status: "SUCCESS" | "FAILURE" }>(
    "/v1/notifications/verify-webhook-signature",
    {
      method: "POST",
      body: JSON.stringify({
        transmission_id: params.transmissionId,
        transmission_time: params.transmissionTime,
        cert_url: params.certUrl,
        auth_algo: params.authAlgo,
        transmission_sig: params.transmissionSig,
        webhook_id: params.webhookId,
        webhook_event: params.webhookEvent,
      }),
    }
  );

  return result.verification_status === "SUCCESS";
}
