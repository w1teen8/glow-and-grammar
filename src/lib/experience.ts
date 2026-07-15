// Shared by API responses and client components — experience is always derived
// from `practicingSince`, never hardcoded as a static "X years" string.

export function getYearsOfExperience(practicingSince: Date, now: Date = new Date()): number {
  let years = now.getFullYear() - practicingSince.getFullYear();
  const anniversaryPassed =
    now.getMonth() > practicingSince.getMonth() ||
    (now.getMonth() === practicingSince.getMonth() && now.getDate() >= practicingSince.getDate());

  if (!anniversaryPassed) years -= 1;
  return Math.max(years, 0);
}

// Ukrainian pluralization: 1 рік, 2-4 роки, 5-20 років, 21 рік, 22-24 роки, ...
export function pluralizeYearsUk(years: number): string {
  const mod10 = years % 10;
  const mod100 = years % 100;

  if (mod100 >= 11 && mod100 <= 14) return "років";
  if (mod10 === 1) return "рік";
  if (mod10 >= 2 && mod10 <= 4) return "роки";
  return "років";
}

export function experienceLabel(practicingSince: Date, now: Date = new Date()): string {
  const years = getYearsOfExperience(practicingSince, now);
  if (years < 1) return "Активна практика з " + practicingSince.getFullYear() + " року";
  return `${years}+ ${pluralizeYearsUk(years)} активної практики`;
}

// Founding date of Glow & Grammar as a teaching practice — kept separate from
// `practicingSince` (broader language practice/immersion), never hardcoded
// as a static year count, only as this anchor date.
export const TEACHING_SINCE = new Date("2025-07-09T00:00:00.000Z");

export function teachingExperienceLabel(since: Date = TEACHING_SINCE, now: Date = new Date()): string {
  const years = getYearsOfExperience(since, now);
  if (years < 1) return "Досвід викладання з " + since.getFullYear() + " року";
  return `${years}+ ${pluralizeYearsUk(years)} досвіду викладання`;
}
