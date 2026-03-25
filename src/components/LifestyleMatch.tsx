"use client";

interface LifestyleMatchProps {
  profileLifestyle: string;
  pgAmenities: string[];
}

const lifestyleIcons: Record<string, string> = {
  "Early Bird": "🌅",
  "Night Owl": "🦉",
  "Fitness Enthusiast": "🏋️",
  "Homebody": "🏠",
  "Social Butterfly": "🦋",
  "Vegetarian": "🥗",
  "Non-Veg": "🍗",
  "Vegan": "🌱",
  "Pet Lover": "🐾",
  "Clean Freak": "🧹",
  "Chill": "😌",
  "Studious": "📚",
};

export default function LifestyleMatch({ profileLifestyle, pgAmenities }: LifestyleMatchProps) {
  const lifestyles = profileLifestyle.split(", ").filter(Boolean);
  
  const matchedAmenities = pgAmenities.reduce((acc, amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes("gym") || amenityLower.includes("fitness")) acc.push("Fitness Enthusiast");
    if (amenityLower.includes("food") || amenityLower.includes("meal")) acc.push("Food");
    if (amenityLower.includes("wifi")) acc.push("Remote Work");
    if (amenityLower.includes("tv")) acc.push("Entertainment");
    if (amenityLower.includes("parking")) acc.push("Pet Lover");
    return acc;
  }, [] as string[]);

  return (
    <div className="flex flex-wrap gap-1.5">
      {lifestyles.map(ls => {
        const icon = lifestyleIcons[ls] || "•";
        return (
          <span key={ls} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold border border-blue-100">
            <span>{icon}</span>
            {ls}
          </span>
        );
      })}
    </div>
  );
}
