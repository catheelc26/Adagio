export type Plan = {
  id: "monthly" | "annual";
  name: string;
  price: string;
  cadence: string;
  description: string;
  priceId: string | undefined;
  featured?: boolean;
  features: string[];
};

export const PLANS: Plan[] = [
  {
    id: "monthly",
    name: "Mensual",
    price: "29€",
    cadence: "/ mes",
    description: "Ideal para probar el ecosistema completo sin compromiso.",
    priceId: process.env.STRIPE_PRICE_ID_MONTHLY,
    features: [
      "Acceso a los 8 pilares",
      "Biblioteca completa, sin límite de reproducciones",
      "Perfil con clases favoritas",
      "Cancela cuando quieras",
    ],
  },
  {
    id: "annual",
    name: "Anual",
    price: "279€",
    cadence: "/ año",
    description: "Dos meses gratis para quienes se comprometen con su proceso.",
    priceId: process.env.STRIPE_PRICE_ID_ANNUAL,
    featured: true,
    features: [
      "Todo lo del plan mensual",
      "Equivale a 23,25€/mes",
      "Acceso prioritario a nuevas clases",
      "Cancela cuando quieras",
    ],
  },
];
