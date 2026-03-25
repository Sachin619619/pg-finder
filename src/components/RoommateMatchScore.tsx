"use client";

import type { RoommateProfile } from "@/lib/db";

interface RoommateMatchScoreProps {
  profile: RoommateProfile;
  userPrefs?: {
    preferredAreas?: string[];
    budgetMax?: number;
    budgetMin?: number;
    preferredGender?: string;
    lifestyle?: string[];
  };
}

const lifestyleCompatibility: Record<string, Record<string, number>> = {
  "Early Bird": { "Early Bird": 100, "Night Owl": 30, "Fitness Enthusiast": 70, "Homebody": 60, "Social Butterfly": 50, "Vegetarian": 50, "Non-Veg": 50, "Vegan": 50, "Pet Lover": 50, "Clean Freak": 80, "Chill": 70, "Studious": 60 },
  "Night Owl": { "Early Bird": 30, "Night Owl": 100, "Fitness Enthusiast": 50, "Homebody": 70, "Social Butterfly": 80, "Vegetarian": 50, "Non-Veg": 50, "Vegan": 50, "Pet Lover": 50, "Clean Freak": 60, "Chill": 70, "Studious": 50 },
  "Fitness Enthusiast": { "Early Bird": 70, "Night Owl": 50, "Fitness Enthusiast": 100, "Homebody": 50, "Social Butterfly": 60, "Vegetarian": 70, "Non-Veg": 40, "Vegan": 60, "Pet Lover": 70, "Clean Freak": 80, "Chill": 60, "Studious": 50 },
  "Homebody": { "Early Bird": 60, "Night Owl": 70, "Fitness Enthusiast": 50, "Homebody": 100, "Social Butterfly": 40, "Vegetarian": 50, "Non-Veg": 50, "Vegan": 50, "Pet Lover": 60, "Clean Freak": 70, "Chill": 80, "Studious": 60 },
  "Social Butterfly": { "Early Bird": 50, "Night Owl": 80, "Fitness Enthusiast": 60, "Homebody": 40, "Social Butterfly": 100, "Vegetarian": 50, "Non-Veg": 50, "Vegan": 50, "Pet Lover": 50, "Clean Freak": 50, "Chill": 70, "Studious": 40 },
  "Vegetarian": { "Early Bird": 50, "Night Owl": 50, "Fitness Enthusiast": 70, "Homebody": 50, "Social Butterfly": 50, "Vegetarian": 100, "Non-Veg": 30, "Vegan": 80, "Pet Lover": 50, "Clean Freak": 50, "Chill": 50, "Studious": 50 },
  "Non-Veg": { "Early Bird": 50, "Night Owl": 50, "Fitness Enthusiast": 40, "Homebody": 50, "Social Butterfly": 50, "Vegetarian": 30, "Non-Veg": 100, "Vegan": 30, "Pet Lover": 50, "Clean Freak": 50, "Chill": 50, "Studious": 50 },
  "Vegan": { "Early Bird": 50, "Night Owl": 50, "Fitness Enthusiast": 60, "Homebody": 50, "Social Butterfly": 50, "Vegetarian": 80, "Non-Veg": 30, "Vegan": 100, "Pet Lover": 50, "Clean Freak": 50, "Chill": 50, "Studious": 50 },
  "Pet Lover": { "Early Bird": 50, "Night Owl": 50, "Fitness Enthusiast": 70, "Homebody": 60, "Social Butterfly": 50, "Vegetarian": 50, "Non-Veg": 50, "Vegan": 50, "Pet Lover": 100, "Clean Freak": 40, "Chill": 50, "Studious": 50 },
  "Clean Freak": { "Early Bird": 80, "Night Owl": 60, "Fitness Enthusiast": 80, "Homebody": 70, "Social Butterfly": 50, "Vegetarian": 50, "Non-Veg": 50, "Vegan": 50, "Pet Lover": 40, "Clean Freak": 100, "Chill": 60, "Studious": 70 },
  "Chill": { "Early Bird": 70, "Night Owl": 70, "Fitness Enthusiast": 60, "Homebody": 80, "Social Butterfly": 70, "Vegetarian": 50, "Non-Veg": 50, "Vegan": 50, "Pet Lover": 50, "Clean Freak": 60, "Chill": 100, "Studious": 60 },
  "Studious": { "Early Bird": 60, "Night Owl": 50, "Fitness Enthusiast": 50, "Homebody": 60, "Social Butterfly": 40, "Vegetarian": 50, "Non-Veg": 50, "Vegan": 50, "Pet Lover": 50, "Clean Freak": 70, "Chill": 60, "Studious": 100 },
};

function getMatchScore(profile: RoommateProfile, prefs?: RoommateMatchScoreProps["userPrefs"]): {
  score: number;
  breakdown: { label: string; value: number; max: number }[];
  label: string;
  color: string;
} {
  if (!prefs) {
    // Default score based on profile completeness
    const completeness = 50 + (profile.bio ? 15 : 0) + (profile.lifestyle ? 20 : 0) + (profile.avatar ? 15 : 0);
    return {
      score: completeness,
      breakdown: [{ label: "Profile Score", value: completeness, max: 100 }],
      label: "Profile",
      color: "text-blue-600 bg-blue-50",
    };
  }

  const breakdown: { label: string; value: number; max: number }[] = [];
  let total = 0;
  let max = 0;

  // Area match (30 points max)
  let areaScore = 0;
  if (prefs.preferredAreas && prefs.preferredAreas.length > 0) {
    max += 30;
    if (prefs.preferredAreas.includes(profile.area)) {
      areaScore = 30;
    } else {
      // Partial score for same area group
      areaScore = 15;
    }
    total += areaScore;
    breakdown.push({ label: "Area", value: areaScore, max: 30 });
  }

  // Budget match (25 points max)
  let budgetScore = 0;
  if (prefs.budgetMax !== undefined) {
    max += 25;
    if (profile.budgetMin <= prefs.budgetMax && profile.budgetMax >= (prefs.budgetMin || 0)) {
      budgetScore = 25;
    } else if (profile.budgetMin <= prefs.budgetMax * 1.2) {
      budgetScore = 12;
    }
    total += budgetScore;
    breakdown.push({ label: "Budget", value: budgetScore, max: 25 });
  }

  // Gender match (20 points)
  let genderScore = 0;
  if (prefs.preferredGender && prefs.preferredGender !== "any") {
    max += 20;
    if (profile.gender === prefs.preferredGender) genderScore = 20;
    total += genderScore;
    breakdown.push({ label: "Gender", value: genderScore, max: 20 });
  }

  // Lifestyle compatibility (25 points)
  let lifestyleScore = 0;
  if (prefs.lifestyle && prefs.lifestyle.length > 0 && profile.lifestyle) {
    max += 25;
    const profileLifestyles = profile.lifestyle.split(", ").filter(Boolean);
    let compatSum = 0;
    let compatCount = 0;
    for (const pref of prefs.lifestyle) {
      for (const profL of profileLifestyles) {
        if (lifestyleCompatibility[pref]?.[profL] !== undefined) {
          compatSum += lifestyleCompatibility[pref][profL];
          compatCount++;
        }
      }
    }
    if (compatCount > 0) {
      lifestyleScore = Math.round((compatSum / compatCount / 100) * 25);
    }
    total += lifestyleScore;
    breakdown.push({ label: "Lifestyle", value: lifestyleScore, max: 25 });
  }

  const finalScore = max > 0 ? Math.round((total / max) * 100) : 50;
  
  let label: string;
  let color: string;
  if (finalScore >= 85) { label = "Perfect Match"; color = "text-emerald-600 bg-emerald-50"; }
  else if (finalScore >= 70) { label = "Great Match"; color = "text-green-600 bg-green-50"; }
  else if (finalScore >= 50) { label = "Good"; color = "text-blue-600 bg-blue-50"; }
  else if (finalScore >= 30) { label = "Maybe"; color = "text-amber-600 bg-amber-50"; }
  else { label = "Low Match"; color = "text-red-600 bg-red-50"; }

  return { score: finalScore, breakdown, label, color };
}

export default function RoommateMatchScore({ profile, userPrefs }: RoommateMatchScoreProps) {
  const { score, label, color } = getMatchScore(profile, userPrefs);

  return (
    <div className="flex items-center gap-2">
      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${color}`}>
        <span>💚</span>
        <span>{score}%</span>
      </div>
      <span className="text-[11px] text-gray-500 font-medium">{label}</span>
    </div>
  );
}
