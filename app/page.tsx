"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Header from "@/components/Header";
import CitySelector from "@/components/CitySelector";
import LogFareForm from "@/components/LogFareForm";
import FareCard from "@/components/FareCard";
import SearchBar from "@/components/SearchBar";
import EmptyState from "@/components/EmptyState";
import NewFareToast from "@/components/NewFareToast";
import { loadFares, addFare, deleteFare, subscribeToFares } from "@/lib/fares";
import { CITIES, Fare, TimeOfDay, VehicleType } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, isAdmin } = useAuth();
  const [city, setCity] = useState<string>(CITIES[0]);
  const [fares, setFares] = useState<Fare[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [incomingFare, setIncomingFare] = useState<Fare | null>(null);

  const refresh = useCallback(async (targetCity: string) => {
    setLoading(true);
    const data = await loadFares(targetCity);
    setFares(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh(city);
  }, [city, refresh]);

  useEffect(() => {
    const unsubscribe = subscribeToFares((fare) => {
      if (fare.city === city) {
        setFares((prev) => {
          if (prev.some((f) => f.id === fare.id)) return prev;
          return [fare, ...prev];
        });
      }
      setIncomingFare(fare);
    });
    return unsubscribe;
  }, [city]);

  async function handleAddFare(fare: {
    city: string;
    from: string;
    to: string;
    amount: number;
    vehicleType: VehicleType;
    timeOfDay: TimeOfDay;
    note?: string;
  }) {
    const { error } = await addFare(fare);
    if (!error) {
      await refresh(city);
    }
    return { error };
  }

  async function handleDelete(id: string) {
    const { success } = await deleteFare(id);
    if (success) {
      setFares((prev) => prev.filter((f) => f.id !== id));
    }
  }

  const filtered = useMemo(() => {
    if (!query.trim()) return fares;
    const q = query.trim().toLowerCase();
    return fares.filter(
      (f) =>
        f.from.toLowerCase().includes(q) || f.to.toLowerCase().includes(q)
    );
  }, [fares, query]);

  return (
    <div className="flex-1 flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-3xl w-full px-5 py-6 space-y-5">
        <CitySelector selected={city} onSelect={setCity} />

        <LogFareForm city={city} onSubmit={handleAddFare} />

        <SearchBar value={query} onChange={setQuery} />

        <div className="space-y-2.5">
          {loading ? (
            <div className="flex justify-center py-14">
              <Loader2 size={22} className="animate-spin text-[#1A1A1A]/30" />
            </div>
          ) : (
            <>
              {filtered.length === 0 && (
                <EmptyState city={city} hasSearch={query.trim().length > 0} />
              )}
              {filtered.map((fare) => (
                <FareCard
                  key={fare.id}
                  fare={fare}
                  canDelete={isAdmin || (!!user && user.id === fare.userId)}
                  onDelete={handleDelete}
                />
              ))}
            </>
          )}
        </div>
      </main>
      <footer className="border-t-2 border-[#1A1A1A]/8 py-5 text-center">
        <p className="text-xs text-[#1A1A1A]/40">
          Fares are crowdsourced and may vary with traffic, weather and time.
          Waka am with sense.
        </p>
      </footer>

      {incomingFare && (
        <NewFareToast
          fare={incomingFare}
          onDismiss={() => setIncomingFare(null)}
          onView={() => {
            setCity(incomingFare.city);
            setIncomingFare(null);
          }}
        />
      )}
    </div>
  );
}
