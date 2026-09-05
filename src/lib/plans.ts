export type Plan = {
  id: "monthly" | "annual";
  name: string;
  price: string;
  cadence: string;
  description: string;
  planId: string | undefined;
  featured?: boolean;
  features: string[];
};

export const PLANS: Plan[] = [
  {
    id: "monthly",
    name: "Mensual",
    price: "$30",
    cadence: "/ mes",
    description: "Ideal para probar el ecosistema completo sin compromiso.",
    planId: process.env.PAYPAL_PLAN_ID_MONTHLY,
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
    price: "$250",
    cadence: "/ año",
    description: "Ahorra frente al plan mensual para quienes se comprometen con su proceso.",
    planId: process.env.PAYPAL_PLAN_ID_ANNUAL,
    featured: true,
    features: [
      "Todo lo del plan mensual",
      "Equivale a $20.83/mes",
      "Acceso prioritario a nuevas clases",
      "Cancela cuando quieras",
    ],
  },
];
