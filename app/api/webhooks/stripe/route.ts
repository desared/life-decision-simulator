import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const adminDb = getAdminDb();

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;

        if (!userId) {
          console.error("No client_reference_id in checkout session");
          break;
        }

        const userRef = adminDb.collection("users").doc(userId);

        // Store Stripe customer ID on user profile
        if (session.customer) {
          await userRef.update({
            stripeCustomerId: session.customer as string,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }

        if (session.mode === "payment") {
          // One-time payment = Pay Per Scenario
          await userRef.update({
            paidScenarioCredits: FieldValue.increment(1),
            updatedAt: FieldValue.serverTimestamp(),
          });

          // Record payment
          await userRef.collection("payments").add({
            userId,
            stripeSessionId: session.id,
            stripeCustomerId: (session.customer as string) || null,
            type: "per_scenario",
            amount: session.amount_total ?? 299,
            currency: session.currency ?? "eur",
            status: "completed",
            createdAt: FieldValue.serverTimestamp(),
          });

          console.log(`Added 1 scenario credit to user ${userId}`);
        } else if (session.mode === "subscription") {
          // Recurring = Pro subscription
          await userRef.update({
            subscriptionTier: "pro",
            stripeSubscriptionId: session.subscription as string,
            subscriptionStatus: "active",
            updatedAt: FieldValue.serverTimestamp(),
          });

          // Record payment
          await userRef.collection("payments").add({
            userId,
            stripeSessionId: session.id,
            stripeCustomerId: (session.customer as string) || null,
            type: "pro_subscription",
            amount: session.amount_total ?? 1999,
            currency: session.currency ?? "eur",
            status: "completed",
            createdAt: FieldValue.serverTimestamp(),
          });

          console.log(`Activated Pro subscription for user ${userId}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by stripeCustomerId
        const usersSnapshot = await adminDb
          .collection("users")
          .where("stripeCustomerId", "==", customerId)
          .limit(1)
          .get();

        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          await userDoc.ref.update({
            subscriptionTier: "free",
            subscriptionStatus: "canceled",
            stripeSubscriptionId: null,
            updatedAt: FieldValue.serverTimestamp(),
          });
          console.log(`Downgraded user ${userDoc.id} to free`);
        } else {
          console.log(`No user found for customer ${customerId}`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const usersSnapshot = await adminDb
          .collection("users")
          .where("stripeCustomerId", "==", customerId)
          .limit(1)
          .get();

        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          await userDoc.ref.update({
            subscriptionStatus: "past_due",
            updatedAt: FieldValue.serverTimestamp(),
          });
          console.log(`Marked user ${userDoc.id} as past_due`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`Error processing webhook event ${event.type}:`, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
