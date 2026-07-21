import type { Relationship } from "./types";

/**
 * Score-band verdict copy for the results/share card.
 * Band by fraction correct: 0–39%, 40–69%, 70–89%, 90–100%.
 */
const VERDICTS: Record<Relationship, [string, string, string, string]> = {
  partner: [
    "Do you two even talk? 🫠",
    "You know the vibe, not the details",
    "Okay, you were paying attention 👀",
    "Certified soulmate-level recall 💘",
  ],
  friend: [
    "Left on read, clearly 💀",
    "You skim the chat, admit it",
    "Solid. You actually read the messages",
    "You know this chat better than they do 👀",
  ],
  family: [
    "Someone's been muting the family chat",
    "You show up for the holidays at least",
    "The favorite child, obviously",
    "Keeper of the family lore 🏆",
  ],
  group: [
    "Lurker confirmed 💀",
    "Half in the chat, half in witness protection",
    "Group chat historian in training",
    "The chat's official archivist 🏆",
  ],
};

export function verdictFor(relationship: Relationship, score: number, total: number): string {
  const frac = total > 0 ? score / total : 0;
  const band = frac >= 0.9 ? 3 : frac >= 0.7 ? 2 : frac >= 0.4 ? 1 : 0;
  return VERDICTS[relationship][band];
}
