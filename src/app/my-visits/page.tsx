"use client";

import Header from "@/components/Header";
import MyBookings from "@/components/MyBookings";

export default function MyVisitsPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pt-24 animate-fade-in-up">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Visits</h1>
          <p className="text-sm text-gray-400 mt-1">Track and manage your scheduled PG visits</p>
        </div>
        <MyBookings />
      </main>
    </>
  );
}
