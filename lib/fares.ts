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

  return (data as FareRow[]).map(rowToFare);
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
