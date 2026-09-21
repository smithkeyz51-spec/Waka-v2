import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";

webpush.setVapidDetails(
  "mailto:hello@wakatracker.site",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { from, to, amount, city, fareId } = await request.json();

    if (!from || !to || !amount || !city) {
      return NextResponse.json(
        { error: "Missing required fare fields." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ sent: 0 });
    }

    const payload = JSON.stringify({
      title: `New fare in ${city}`,
      body: `${from} → ${to} · ₦${Number(amount).toLocaleString()}`,
      url: "/",
    });

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        )
      )
    );

    const deadEndpoints: string[] = [];
    results.forEach((result, i) => {
      if (
        result.status === "rejected" &&
        (result.reason?.statusCode === 404 || result.reason?.statusCode === 410)
      ) {
        deadEndpoints.push(subscriptions[i].endpoint);
      }
    });

    if (deadEndpoints.length > 0) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("endpoint", deadEndpoints);
    }

    const sent = results.filter((r) => r.status === "fulfilled").length;
    return NextResponse.json({ sent, fareId });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
