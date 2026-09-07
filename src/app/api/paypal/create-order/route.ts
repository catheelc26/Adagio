import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createPaypalOrder } from "@/lib/paypal";
import { PLANS } from "@/lib/plans";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { planId } = (await request.json()) as { planId?: string };
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) {
    return NextResponse.json({ error: "Plan inválido." }, { status: 400 });
  }

  const amount = plan.price.replace(/[^0-9.]/g, "");
  const order = await createPaypalOrder(amount);

  return NextResponse.json({ id: order.id });
}
