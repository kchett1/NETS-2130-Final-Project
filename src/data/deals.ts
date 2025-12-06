export type Deal = {
  id: string;
  truckId: string;
  title: string;
  description: string;
  reward: string;
  expiresOn: string;
  promoCode?: string;
};

export const deals: Deal[] = [
  {
    id: "deal-q-truck-combo",
    truckId: "the-q-food-truck",
    title: "Smoke & Smoothie Duo",
    description:
      "Flash LocustGrub before 2pm for a free all-natural smoothie with any pulled pork platter.",
    reward: "Complimentary smoothie",
    expiresOn: "2025-12-20",
    promoCode: "QBOOST",
  },
  {
    id: "deal-nafi-fire",
    truckId: "nafi-food-express",
    title: "Extra Spicy Upgrade",
    description:
      "Ask for the LocustGrub heat level and they'll toss in extra sauce + a free drink to cool it down.",
    reward: "Free drink",
    expiresOn: "2025-12-31",
  },
  {
    id: "deal-cucina-loyalty",
    truckId: "cucina-zapata",
    title: "Captain Crunch Punch Card",
    description:
      "Buy four burritos this month, upload your check-ins, and the fifth Captain Crunch is on the house.",
    reward: "5th burrito free",
    expiresOn: "2025-12-28",
  },
  {
    id: "deal-don-memo-tuesday",
    truckId: "tacos-don-memo",
    title: "Big Bite Tuesday",
    description:
      "Every Tuesday after 5pm, combo any two tacos and a Jarritos for $10 when you show the live status screen.",
    reward: "$10 taco combo",
    expiresOn: "2025-12-16",
  },
];
