import { createClient } from "@/lib/supabase/client";
import { Fare, FareRow, rowToFare, VehicleType, TimeOfDay } from "./types";

export async function loadFares(city?: string): Promise<Fare[]> {
  const supabase = createClient();
  let query = supabase
    .from("fares")
    .select("*, profiles(display_name)")
    .order("created_at", { ascending: false });

  if (city) {
    query = query.eq("city", city);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to load fares:", error.message);
    return [];
  }

  return (data as unknown as FareRow[]).map(rowToFare);
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

  return { fare: rowToFare(data as FareRow), error: null };
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
    .select("created_at, user_id, profiles(display_name)")
    .eq("city", city)
    .limit(1000);

  if (error || !data) {
    return { totalFares: 0, today: 0, topContributors: [] };
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const todayCount = data.filter(
    (row) => new Date(row.created_at).getTime() >= startOfToday.getTime()
  ).length;

  const counts = new Map<string, number>();
  for (const row of data) {
    const rowData = row as unknown as {
      user_id: string | null;
      profiles: { display_name: string | null } | null;
    };
    if (!rowData.user_id) continue;
    const name = rowData.profiles?.display_name || "Anonymous";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  const topContributors = Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

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
