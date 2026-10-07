import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing webhook signature or secret" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle subscription lifecycle events
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      console.log(`Checkout completed for customer: ${session.customer}, user: ${session.metadata?.userId}`);
      // In production, update Supabase user/workspace billing status here
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object;
      console.log(`Subscription updated: ${subscription.id}, status: ${subscription.status}`);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      console.log(`Subscription canceled: ${subscription.id}`);
      break;
    }
    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
