"use client";

import {
  Milk, Egg, Fish, Beef, Carrot, Salad, Apple, Croissant, Wheat, CupSoda,
  Coffee, Wine, Cookie, Snowflake, Soup, CookingPot, SprayCan, ShoppingBasket,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

// lucide has no mushroom icon — hand-drawn to match its 24×24 outline style.
function Mushroom(props: LucideProps) {
  const { className, strokeWidth = 2, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {/* cap (dome on a flat base) */}
      <path d="M4 11a8 8 0 0 1 16 0Z" />
      {/* stem */}
      <path d="M10 11v6a2 2 0 0 0 4 0v-6" />
    </svg>
  );
}

// icon key (from categoryIcon.ts) → concrete icon component
const ICONS: Record<string, ComponentType<LucideProps>> = {
  dairy: Milk,
  eggs: Egg,
  fish: Fish,
  meat: Beef,
  mushroom: Mushroom,
  leafy: Salad,
  vegetables: Carrot,
  fruit: Apple,
  bakery: Croissant,
  pasta_rice: Wheat,
  drinks: CupSoda,
  coffee_tea: Coffee,
  alcohol: Wine,
  snacks: Cookie,
  frozen: Snowflake,
  breakfast: Soup,
  pantry: CookingPot,
  household: SprayCan,
  other: ShoppingBasket,
};

interface CategoryIconProps {
  /** icon key from a FoodCategory */
  icon: string;
  className?: string;
  strokeWidth?: number;
}

export function CategoryIcon({ icon, className, strokeWidth = 1.5 }: CategoryIconProps) {
  const Icon = ICONS[icon] ?? ShoppingBasket;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}
