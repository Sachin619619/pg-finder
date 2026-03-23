"use client";

import { useEffect } from "react";
import Header from "@/components/Header";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  useEffect(() => { document.title = "Privacy Policy | Castle"; }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a12]">
      <Header />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100/80 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-4">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Legal
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">Privacy Policy</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Last updated: March 23, 2026</p>
          </div>

          {/* Content */}
          <div className="premium-card !rounded-2xl p-6 sm:p-10 space-y-10">

            {/* Introduction */}
            <section>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Welcome to <strong className="text-gray-900 dark:text-white">Castle</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). Castle is a PG/hostel/co-living finder platform operating in Bangalore, India, accessible at{" "}
                <a href="https://castleliving.in" className="text-violet-600 dark:text-violet-400 underline underline-offset-2">castleliving.in</a>.
                We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains what information we collect, how we use it, and what rights you have in relation to it.
              </p>
            </section>

            {/* 1. Information We Collect */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-violet-600 to-fuchsia-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">1</span>
                Information We Collect
              </h2>
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>We collect information that you provide directly to us when you create an account, list a property, search for accommodations, or communicate with other users. This includes:</p>
                <ul className="list-none space-y-2.5 pl-2">
                  {[
                    "Full name and display name",
                    "Email address",
                    "Phone number",
                    "Location and address details (for property listings)",
                    "Profile photo (optional)",
                    "User role preference (tenant, owner, or agent)",
                    "Property details and photos (for owners and agents)",
                    "Search preferences and saved listings",
                    "Reviews and ratings submitted on the platform",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 bg-violet-500 rounded-full mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 2. How We Store Your Data */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-violet-600 to-fuchsia-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">2</span>
                How We Store Your Data
              </h2>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>
                  We use <strong className="text-gray-900 dark:text-white">Supabase</strong> as our primary backend and database service. Supabase provides a secure PostgreSQL database with built-in authentication. Your data is stored in Supabase-managed servers with enterprise-grade security, including:
                </p>
                <ul className="list-none space-y-2.5 pl-2">
                  {[
                    "Row-level security (RLS) policies to ensure users can only access their own data",
                    "Encrypted connections (SSL/TLS) for all data in transit",
                    "Secure authentication with email/password and social login support",
                    "Regular automated backups of all data",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 bg-violet-500 rounded-full mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 3. Cookies & Local Storage */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-violet-600 to-fuchsia-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">3</span>
                Cookies &amp; Local Storage
              </h2>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>We use cookies and browser localStorage to enhance your experience on Castle:</p>
                <ul className="list-none space-y-2.5 pl-2">
                  {[
                    "Authentication tokens — to keep you signed in across sessions",
                    "Theme preference — to remember your dark/light mode choice",
                    "Recently viewed listings — to show you properties you have recently browsed",
                    "Search filters — to preserve your last search preferences",
                    "Saved/bookmarked PGs — stored locally for quick access",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 bg-violet-500 rounded-full mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p>You can clear your browser cookies and localStorage at any time through your browser settings. Please note that doing so may require you to sign in again.</p>
              </div>
            </section>

            {/* 4. Third-Party Services */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-violet-600 to-fuchsia-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">4</span>
                Third-Party Services
              </h2>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>Castle integrates with the following third-party services to provide a better experience:</p>
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  {[
                    {
                      name: "Google Maps",
                      desc: "Used to display property locations on maps, provide directions, and show nearby landmarks. Google may collect location data and usage analytics as per their privacy policy.",
                    },
                    {
                      name: "MiniMax AI",
                      desc: "Powers our AI-driven property recommendations and smart search features. Property data (non-personal) is processed to generate intelligent suggestions.",
                    },
                    {
                      name: "Supabase Auth",
                      desc: "Handles user authentication, session management, and secure password storage using industry-standard bcrypt hashing.",
                    },
                    {
                      name: "Vercel",
                      desc: "Our hosting provider. Vercel may collect basic analytics data such as page views and performance metrics.",
                    },
                  ].map((service) => (
                    <div key={service.name} className="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1.5">{service.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{service.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 5. Data Security */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-violet-600 to-fuchsia-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">5</span>
                Data Security
              </h2>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>We take the security of your personal data seriously and implement the following measures:</p>
                <ul className="list-none space-y-2.5 pl-2">
                  {[
                    "All data transmitted between your browser and our servers is encrypted using HTTPS/TLS",
                    "Passwords are hashed using bcrypt and are never stored in plain text",
                    "Database access is restricted through Supabase row-level security policies",
                    "API routes are protected with authentication middleware",
                    "Regular security reviews and dependency updates",
                    "Admin access is restricted and monitored",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 bg-violet-500 rounded-full mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p>While we strive to protect your personal information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.</p>
              </div>
            </section>

            {/* 6. Your Rights */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-violet-600 to-fuchsia-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">6</span>
                Your Rights
              </h2>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>As a user of Castle, you have the following rights regarding your personal data:</p>
                <ul className="list-none space-y-2.5 pl-2">
                  {[
                    "Access — You can view and download your personal data from your profile page at any time",
                    "Correction — You can update your profile information, including name, email, phone, and preferences",
                    "Deletion — You can permanently delete your account and all associated data through the account settings. This action is irreversible",
                    "Data Portability — You can request a copy of your data in a structured format",
                    "Withdraw Consent — You can withdraw consent for optional data processing at any time",
                    "Opt-out — You can opt out of promotional communications and notifications",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 bg-violet-500 rounded-full mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 7. Data Retention */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-violet-600 to-fuchsia-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">7</span>
                Data Retention
              </h2>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>We retain your personal data for as long as your account is active or as needed to provide our services. If you delete your account, we will remove your personal data within 30 days, except where we are required to retain it by law.</p>
              </div>
            </section>

            {/* 8. Changes to This Policy */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-violet-600 to-fuchsia-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">8</span>
                Changes to This Policy
              </h2>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons. We will notify you of any material changes by posting the updated policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this page periodically.</p>
              </div>
            </section>

            {/* 9. Contact Us */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-gradient-to-br from-violet-600 to-fuchsia-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">9</span>
                Contact Us
              </h2>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:</p>
                <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-xl p-5 mt-3">
                  <div className="space-y-2 text-sm">
                    <p><strong className="text-gray-900 dark:text-white">Castle</strong></p>
                    <p>Bangalore, Karnataka, India</p>
                    <p>Email: <a href="mailto:support@castle.in" className="text-violet-600 dark:text-violet-400 underline underline-offset-2">support@castle.in</a></p>
                    <p>Website: <a href="https://castleliving.in" className="text-violet-600 dark:text-violet-400 underline underline-offset-2">castleliving.in</a></p>
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* Bottom navigation */}
          <div className="mt-8 flex items-center justify-center gap-6 text-sm">
            <Link href="/terms" className="text-violet-600 dark:text-violet-400 hover:underline underline-offset-2 font-medium">
              Terms of Service
            </Link>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <Link href="/" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
