import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import { sendPremiumConfirmationEmail } from "../services/email.service.js"; // Ensure the correct file extension is used for ESM

const prisma = new PrismaClient();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Stripe secret key is not defined");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-09-30.acacia",
});

export async function createCheckoutSession(req, res) {
  const user = req.user;

  console.log("Create checout session for user", user);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Lifetime Subscription",
            },
            unit_amount: 1000, // $10
          },
          quantity: 1,
        },
      ],
      customer_email: user.email,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/payment-success`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
      client_reference_id: user.id.toString(),
    });

    console.log("Stripe session created:", session);

    res.json({ sessionId: session.id });

    console.log("Checkout session created", session.id);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create charge" });
  }
}

export async function handleWebhook(req, res) {
  const sig = req.headers["stripe-signature"];

  let event;

  console.log("Received webhook event", req.body);

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.client_reference_id;

    if (userId) {
      const user = await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { isPremium: true },
      });

      console.log(`User ${userId} upgraded to premium`);

      if (user && user.email) {
        await sendPremiumConfirmationEmail(user.email, user.displayName);
      }
    }
  }

  res.json({ received: true });
}

export async function getPremiumStatus(req, res) {
  const user = req.user;

  console.log("Get premium status for user", user);

  if (user.isPremium) {
    res.json({ status: "active" });
  } else {
    res.json({ status: "inactive" });
  }
}
