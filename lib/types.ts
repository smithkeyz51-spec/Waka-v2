export type VehicleType = "danfo" | "keke" | "brt" | "bolt" | "bus";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

// Shape used throughout the UI (camelCase).
export interface Fare {
  id: string;
  city: string;
  from: string;
  to: string;
  amount: number;
  vehicleType: VehicleType;
  timeOfDay: TimeOfDay;
  note?: string;
  userId?: string | null;
  createdAt: number;
}

// Row shape as it actually comes back from Supabase (snake_case columns).
export interface FareRow {
  id: string;
  city: string;
  from_stop: string;
  to_stop: string;
  amount: number;
  vehicle_type: VehicleType;
  time_of_day: TimeOfDay;
  note: string | null;
  user_id: string | null;
  created_at: string;
}

export function rowToFare(row: FareRow): Fare {
  return {
    id: row.id,
    city: row.city,
    from: row.from_stop,
    to: row.to_stop,
    amount: row.amount,
    vehicleType: row.vehicle_type,
    timeOfDay: row.time_of_day,
    note: row.note ?? undefined,
    userId: row.user_id,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export const CITIES = [
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Ibadan",
  "Benin City",
  "Kano",
] as const;

export type City = (typeof CITIES)[number];

export const VEHICLE_LABELS: Record<VehicleType, string> = {
  danfo: "Danfo",
  keke: "Keke NAPEP",
  brt: "BRT",
  bolt: "Bolt / Uber",
  bus: "Bus",
};

export const TIME_LABELS: Record<TimeOfDay, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  night: "Night",
};

export const LAGOS_LGAS = [
  "Agege",
  "Ajeromi-Ifelodun",
  "Alimosho",
  "Amuwo-Odofin",
  "Apapa",
  "Badagry",
  "Epe",
  "Eti-Osa",
  "Ibeju-Lekki",
  "Ifako-Ijaiye",
  "Ikeja",
  "Ikorodu",
  "Kosofe",
  "Lagos Island",
  "Lagos Mainland",
  "Mushin",
  "Ojo",
  "Oshodi-Isolo",
  "Shomolu",
  "Surulere",
] as const;

export const LAGOS_LGA_STOPS: Record<string, string[]> = {
  Agege: ["Agege", "Dopemu", "Iyana Ipaja", "Oke-Koto", "Pen Cinema"],
  "Ajeromi-Ifelodun": ["Ajegunle", "Boundary", "Olodi Apapa", "Wilmer"],
  Alimosho: ["Egbeda", "Ipaja", "Akowonjo", "Ikotun", "Igando", "Idimu", "Abule Egba"],
  "Amuwo-Odofin": ["Festac Town", "Mile 2", "Satellite Town", "Kirikiri"],
  Apapa: ["Apapa", "Ijora", "Wharf Road", "Tincan"],
  Badagry: ["Badagry", "Agbara", "Ajara", "Topo"],
  Epe: ["Epe", "Poka", "Ejinrin", "Itoikin"],
  "Eti-Osa": ["Victoria Island", "Ikoyi", "Lekki Phase 1", "Lekki Phase 2", "Ajah", "Chevron", "Obalende"],
  "Ibeju-Lekki": ["Ibeju-Lekki", "Awoyaya", "Sangotedo", "Eleko"],
  "Ifako-Ijaiye": ["Ifako", "Ijaiye", "Iju", "Ogba"],
  Ikeja: ["Ikeja", "Allen Avenue", "Opebi", "Alausa", "Maryland", "Oregun", "Ojodu Berger"],
  Ikorodu: ["Ikorodu", "Owutu", "Agric", "Ipakodo", "Itamaga"],
  Kosofe: ["Ketu", "Ojota", "Mile 12", "Alapere", "Ogudu"],
  "Lagos Island": ["CMS", "Marina", "Idumota", "Obalende", "Onikan"],
  "Lagos Mainland": ["Yaba", "Ebute Metta", "Iddo", "Herbert Macaulay"],
  Mushin: ["Mushin", "Ilupeju", "Odi-Olowo", "Palmgrove"],
  Ojo: ["Ojo", "Okokomaiko", "Alaba", "Iyana Iba"],
  "Oshodi-Isolo": ["Oshodi", "Isolo", "Ejigbo", "Mafoluku", "Airport Road"],
  Shomolu: ["Shomolu", "Bariga", "Pedro", "Onipanu"],
  Surulere: ["Surulere", "Costain", "National Stadium", "Ojuelegba", "Aguda"],
};

export const LAGOS_ALL_STOPS = Object.values(LAGOS_LGA_STOPS).flat();

export const COMMON_STOPS: Record<string, string[]> = {
  Lagos: LAGOS_ALL_STOPS,
  Abuja: [
    "Wuse", "Garki", "Nyanya", "Kubwa", "Jabi", "Utako", "Gwarinpa",
    "Area 1", "Berger Junction", "Lugbe",
  ],
  "Port Harcourt": [
    "Mile 1", "Mile 3", "Rumuola", "Waterlines", "Choba", "Rumuokoro",
    "Eleme", "GRA",
  ],
  Ibadan: ["Iwo Road", "Challenge", "Bodija", "Dugbe", "Mokola", "Ring Road"],
  "Benin City": ["Ring Road", "Uselu", "New Benin", "Ugbowo"],
  Kano: ["Sabon Gari", "Kofar Mata", "BUK Road", "Naibawa"],
};
