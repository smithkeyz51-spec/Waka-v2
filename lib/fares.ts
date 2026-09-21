import { createClient } from "@/lib/supabase/client";
import { Fare, FareRow, rowToFare, VehicleType, TimeOfDay } from "./types";

export async function loadFares(city?: string): Promise<Fare[]> {
  const supabase = createClient();
  let query = supabase
    .from("fares")
    .select("*")
    .order("created_at", { ascending: false });

  if (city) {
    query = query.eq("city", city);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to load fares:", error.message);
    return [];
  }
  if (!data) {
    return [];
  }

  const userIds = Array.from(
    new Set(
      (data as FareRow[])
        .map((r) => r.user_id)
        .filter((id): id is string => !!id)
    )
  );

  const nameById = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: profileRows, error: profileError } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds);

    if (profileError) {
      console.error("Failed to load profiles:", profileError.message);
    } else {
      for (const p of profileRows ?? []) {
        if (p.display_name) nameById.set(p.id, p.display_name);
      }
    }
  }

  return (data as FareRow[]).map((row) => {
    const fare = rowToFare(row);
    if (row.user_id) {
      fare.userName = nameById.get(row.user_id) ?? null;
    }
    return fare;
  });
}

export async function addFare(fare: {
  city: string;
  from: string;
  to: string;
  amount: number;
  vehicleType: VehicleType;
  timeOfDay: TimeOfDay;
  note?: string;
}): Promise<{ fare: Fare | null; error: string | null }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("fares")
    .insert({
      city: fare.city,
      from_stop: fare.from,
      to_stop: fare.to,
      amount: fare.amount,
      vehicle_type: fare.vehicleType,
      time_of_day: fare.timeOfDay,
      note: fare.note ?? null,
      user_id: user?.id ?? null,
    })
    .select()
    .single();

  if (error) {
    return { fare: null, error: error.message };
  }

  const newFare = rowToFare(data as FareRow);

  fetch("/api/notify-fare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      from: fare.from,
      to: fare.to,
      amount: fare.amount,
      city: fare.city,
      fareId: newFare.id,
    }),
  }).catch(() => {
    // Ignore — push notifications are best-effort.
  });

  return { fare: newFare, error: null };
}

export async function deleteFare(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("fares").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

export interface CityStats {
  totalFares: number;
  today: number;
  topContributors: { name: string; count: number }[];
}

export async function loadCityStats(city: string): Promise<CityStats> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("fares")
    .select("created_at, user_id")
    .eq("city", city)
    .limit(1000);

  if (error) {
    console.error("Failed to load city stats:", error.message);
    return { totalFares: 0, today: 0, topContributors: [] };
  }
  if (!data) {
    return { totalFares: 0, today: 0, topContributors: [] };
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const todayCount = data.filter(
    (row) => new Date(row.created_at).getTime() >= startOfToday.getTime()
  ).length;

  const userIds = Array.from(
    new Set(data.map((r) => r.user_id).filter((id): id is string => !!id))
  );

  const nameById = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: profileRows, error: profileError } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds);

    if (profileError) {
      console.error("Failed to load profiles:", profileError.message);
    } else {
      for (const p of profileRows ?? []) {
        if (p.display_name) nameById.set(p.id, p.display_name);
      }
    }
  }

  const counts = new Map<string, number>();
  for (const row of data) {
    if (!row.user_id) continue;
    const name = nameById.get(row.user_id) || "Anonymous";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  const topContributors = Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalFares: data.length,
    today: todayCount,
    topContributors,
  };
}

export function subscribeToFares(onInsert: (fare: Fare) => void) {
  const supabase = createClient();

  const channel = supabase
    .channel("fares-changes")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "fares" },
      (payload) => {
        onInsert(rowToFare(payload.new as FareRow));
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
