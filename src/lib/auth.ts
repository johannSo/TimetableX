import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Resend } from "resend";
import { Polar } from "@polar-sh/sdk";
import { polar, checkout, portal, usage, webhooks } from "@polar-sh/better-auth";
import { prisma } from "@/lib/db";
import { setHasPro } from "@/lib/pro-status";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function getFromAddress() {
  return process.env.RESEND_FROM || "TimetableX <no-reply@timetablex.app>";
}

const polarClient = process.env.POLAR_ACCESS_TOKEN
  ? new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      server: process.env.POLAR_SERVER === "sandbox" ? "sandbox" : "production",
    })
  : null;

if (polarClient) {
  if (!process.env.POLAR_PRODUCT_MONTHLY_ID || !process.env.POLAR_PRODUCT_LIFETIME_ID) {
    console.warn("[auth] POLAR_PRODUCT_MONTHLY_ID or POLAR_PRODUCT_LIFETIME_ID missing.");
  }
}

const polarProducts = [
  process.env.POLAR_PRODUCT_MONTHLY_ID
    ? { productId: process.env.POLAR_PRODUCT_MONTHLY_ID, slug: "pro-monthly" }
    : null,
  process.env.POLAR_PRODUCT_LIFETIME_ID
    ? { productId: process.env.POLAR_PRODUCT_LIFETIME_ID, slug: "pro-lifetime" }
    : null,
].filter(Boolean) as { productId: string; slug: string }[];

const polarPlugins = polarClient
  ? [
      polar({
        client: polarClient,
        createCustomerOnSignUp: true,
        use: [
          checkout({
            products: polarProducts,
            successUrl:
              process.env.POLAR_SUCCESS_URL ||
              "/success?checkout_id={CHECKOUT_ID}",
            authenticatedUsersOnly: true,
          }),
          portal(),
          usage(),
          ...(process.env.POLAR_WEBHOOK_SECRET
            ? [
                webhooks({
                  secret: process.env.POLAR_WEBHOOK_SECRET,
                  onCustomerStateChanged: async (payload: any) => {
                    const data = payload?.data ?? payload;
                    const customer = data?.customer ?? data?.customer_data ?? data?.customerData;
                    const externalId =
                      customer?.externalId ||
                      customer?.external_id ||
                      data?.externalId ||
                      data?.external_id ||
                      data?.customer_external_id ||
                      data?.customerExternalId;
                    if (!externalId) {
                      console.warn("[polar] customer.state_changed missing externalId");
                      return;
                    }

                    const subscriptions =
                      data?.active_subscriptions ||
                      data?.activeSubscriptions ||
                      data?.subscriptions ||
                      [];
                    const benefits =
                      data?.granted_benefits ||
                      data?.grantedBenefits ||
                      data?.benefits ||
                      [];

                    const hasPro =
                      (Array.isArray(subscriptions) && subscriptions.length > 0) ||
                      (Array.isArray(benefits) && benefits.length > 0);

                    const email = customer?.email || data?.email;
                    await setHasPro(externalId, hasPro, email);
                  },
                  onOrderPaid: async (payload: any) => {
                    const data = payload?.data ?? payload;
                    const customer = data?.customer ?? data?.customer_data ?? data?.customerData;
                    const externalId =
                      customer?.externalId ||
                      customer?.external_id ||
                      data?.externalId ||
                      data?.external_id ||
                      data?.customer_external_id ||
                      data?.customerExternalId;
                    if (!externalId) return;
                    const email = customer?.email || data?.email;
                    await setHasPro(externalId, true, email);
                  },
                  onSubscriptionCanceled: async (payload: any) => {
                    const data = payload?.data ?? payload;
                    const customer = data?.customer ?? data?.customer_data ?? data?.customerData;
                    const externalId =
                      customer?.externalId ||
                      customer?.external_id ||
                      data?.externalId ||
                      data?.external_id ||
                      data?.customer_external_id ||
                      data?.customerExternalId;
                    if (!externalId) return;
                    const status = data?.status || data?.subscription_status;
                    if (status === "canceled") {
                      const email = customer?.email || data?.email;
                      await setHasPro(externalId, false, email);
                    }
                  },
                  onSubscriptionRevoked: async (payload: any) => {
                    const data = payload?.data ?? payload;
                    const customer = data?.customer ?? data?.customer_data ?? data?.customerData;
                    const externalId =
                      customer?.externalId ||
                      customer?.external_id ||
                      data?.externalId ||
                      data?.external_id ||
                      data?.customer_external_id ||
                      data?.customerExternalId;
                    if (!externalId) return;
                    const email = customer?.email || data?.email;
                    await setHasPro(externalId, false, email);
                  },
                  onSubscriptionPastDue: async (payload: any) => {
                    const data = payload?.data ?? payload;
                    const customer = data?.customer ?? data?.customer_data ?? data?.customerData;
                    const externalId =
                      customer?.externalId ||
                      customer?.external_id ||
                      data?.externalId ||
                      data?.external_id ||
                      data?.customer_external_id ||
                      data?.customerExternalId;
                    if (!externalId) return;
                    const email = customer?.email || data?.email;
                    await setHasPro(externalId, false, email);
                  },
                }),
              ]
            : []),
        ],
      }),
    ]
  : [];

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  // Better Auth will read BETTER_AUTH_SECRET/AUTH_SECRET from env by default
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: polarPlugins,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    sendVerificationEmail: async ({ user, url }) => {
      if (!resend) {
        console.warn("RESEND_API_KEY missing; verification email not sent.");
        return;
      }
      console.log("[auth] Sending verification email to", user.email, "from", getFromAddress());
      try {
        const result = await resend.emails.send({
          from: getFromAddress(),
          to: user.email,
          subject: "Verify your email for TimetableX",
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5;">
              <h2>Verify your email</h2>
              <p>Hi ${user.name || "there"},</p>
              <p>Please verify your email address to finish creating your TimetableX account.</p>
              <p><a href="${url}">Verify email</a></p>
              <p>If you did not create this account, you can ignore this email.</p>
            </div>
          `,
        });
        console.log("[auth] Resend response:", result);
      } catch (err) {
        console.error("[auth] Resend sendVerificationEmail failed:", err);
      }
    },
  },
});
