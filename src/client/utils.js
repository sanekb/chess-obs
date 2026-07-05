import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as v from "valibot";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const nocontentSchema = v.literal("");

export const nbsp = { text: "\u00A0" };
