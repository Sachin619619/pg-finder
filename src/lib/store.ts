// Client-side state management using localStorage

export function getWishlist(): string[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("pg-wishlist");
  return data ? JSON.parse(data) : [];
}

export function toggleWishlist(id: string): boolean {
  const list = getWishlist();
  const idx = list.indexOf(id);
  if (idx >= 0) {
    list.splice(idx, 1);
    localStorage.setItem("pg-wishlist", JSON.stringify(list));
    return false;
  } else {
    list.push(id);
    localStorage.setItem("pg-wishlist", JSON.stringify(list));
    return true;
  }
}

export function isWishlisted(id: string): boolean {
  return getWishlist().includes(id);
}

export type Review = {
  id: string;
  pgId: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
};

const sampleReviews: Review[] = [
  { id: "r1", pgId: "1", name: "Rahul S.", rating: 5, comment: "Great food and clean rooms. The location is perfect — close to metro and market.", date: "2026-03-10", verified: true },
  { id: "r2", pgId: "1", name: "Amit K.", rating: 4, comment: "Value for money. WiFi could be faster but overall good experience.", date: "2026-02-28", verified: true },
  { id: "r3", pgId: "2", name: "Sneha M.", rating: 5, comment: "Absolutely premium experience! The gym and rooftop are amazing. Worth every rupee.", date: "2026-03-15", verified: true },
  { id: "r4", pgId: "2", name: "Vikram R.", rating: 4, comment: "Excellent facilities. Staff is very helpful. Food quality is consistent.", date: "2026-03-01", verified: false },
  { id: "r5", pgId: "3", name: "Priya D.", rating: 5, comment: "Best ladies PG in Indiranagar! Feel very safe here. Aunty's food is homely.", date: "2026-03-12", verified: true },
  { id: "r6", pgId: "5", name: "Karthik N.", rating: 5, comment: "Top-notch amenities. The AC rooms are a lifesaver in Bangalore summers.", date: "2026-03-08", verified: true },
  { id: "r7", pgId: "5", name: "Deepak G.", rating: 4, comment: "Good PG overall. A bit noisy on weekends but manageable.", date: "2026-02-20", verified: false },
  { id: "r8", pgId: "10", name: "Ananya P.", rating: 5, comment: "Love the rooftop garden and gym. Perfect for Manyata Tech Park employees!", date: "2026-03-18", verified: true },
  { id: "r9", pgId: "14", name: "Nikhil V.", rating: 5, comment: "Koramangala's best PG. The co-working space is a bonus!", date: "2026-03-05", verified: true },
  { id: "r10", pgId: "20", name: "Swathi R.", rating: 5, comment: "Luxury living at its finest! Smart TV, mini-fridge — feels like a hotel.", date: "2026-03-14", verified: true },
  { id: "r11", pgId: "16", name: "Kavya S.", rating: 5, comment: "Traditional South Indian meals + Malleshwaram vibes. Can't ask for more!", date: "2026-03-02", verified: true },
  { id: "r12", pgId: "7", name: "Arjun M.", rating: 4, comment: "Great for Whitefield IT crowd. Walking distance to ITPL.", date: "2026-02-15", verified: true },
  { id: "r13", pgId: "4", name: "Ravi T.", rating: 4, comment: "Budget friendly and close to office. Food is decent.", date: "2026-03-11", verified: false },
  { id: "r14", pgId: "9", name: "Sumanth K.", rating: 4, comment: "Perfect for Infosys freshers. 5 min walk to campus!", date: "2026-02-25", verified: true },
  { id: "r15", pgId: "12", name: "Divya L.", rating: 5, comment: "Safe, clean, and the warden is very caring. Food is home-style.", date: "2026-03-16", verified: true },
];

export function getReviews(pgId: string): Review[] {
  return sampleReviews.filter((r) => r.pgId === pgId);
}

export function getAllReviews(): Review[] {
  return sampleReviews;
}

// Price alert subscriptions
export function subscribePriceAlert(email: string, area: string, maxPrice: number): void {
  if (typeof window === "undefined") return;
  const alerts = JSON.parse(localStorage.getItem("pg-price-alerts") || "[]");
  alerts.push({ email, area, maxPrice, createdAt: new Date().toISOString() });
  localStorage.setItem("pg-price-alerts", JSON.stringify(alerts));
}

// Callback requests
export function requestCallback(pgId: string, name: string, phone: string): void {
  if (typeof window === "undefined") return;
  const requests = JSON.parse(localStorage.getItem("pg-callbacks") || "[]");
  requests.push({ pgId, name, phone, createdAt: new Date().toISOString() });
  localStorage.setItem("pg-callbacks", JSON.stringify(requests));
}
