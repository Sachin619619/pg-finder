"use client";

import { useEffect } from "react";
import Header from "@/components/Header";
import Link from "next/link";

export default function TermsOfServicePage() {
  useEffect(() => { document.title = "Terms of Service | Castle"; }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F4EDD9]/80 text-[#1B1C15] text-xs font-semibold mb-4">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Legal
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Terms of Service</h1>
            <p className="text-gray-500 text-sm">Last updated: March 23, 2026</p>
          </div>

          {/* Content */}
          <div className="premium-card !rounded-2xl p-6 sm:p-10 space-y-10">

            {/* Introduction */}
            <section>
              <p className="text-gray-600 text-sm leading-relaxed">
                Welcome to <strong className="text-gray-900">Castle</strong>. By accessing or using our platform at{" "}
                <a href="https://castleliving.in" className="text-[#1B1C15] underline underline-offset-2">castleliving.in</a>,
                you agree to be bound by these Terms of Service (&quot;Terms&quot;). Please read them carefully before using our services. If you do not agree to these Terms, you may not use the platform.
              </p>
            </section>

            {/* 1. Platform Overview */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-[#1B1C15] rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">1</span>
                Platform Overview
              </h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>Castle is a PG, hostel, and co-living finder platform designed to help people in Bangalore, India find suitable accommodation. The platform connects tenants seeking accommodation with property owners and agents who list available spaces.</p>
                <p>Castle acts solely as an intermediary platform and is not a party to any rental agreement between tenants and property owners/agents. We do not own, manage, or operate any of the listed properties.</p>
              </div>
            </section>

            {/* 2. User Accounts & Roles */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-[#1B1C15] rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">2</span>
                User Accounts &amp; Roles
              </h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>Castle supports three user roles, each with specific permissions and responsibilities:</p>
                <div className="grid sm:grid-cols-3 gap-4 mt-4">
                  {[
                    {
                      role: "Tenant",
                      color: "emerald",
                      items: ["Browse and search PG listings", "Save and compare properties", "Write reviews and ratings", "Contact owners/agents", "Use the roommate finder"],
                    },
                    {
                      role: "Owner",
                      color: "blue",
                      items: ["List and manage properties", "Respond to tenant inquiries", "Access owner dashboard and analytics", "Update listing details and photos", "View booking requests"],
                    },
                    {
                      role: "Agent",
                      color: "orange",
                      items: ["List properties on behalf of owners", "Manage multiple listings", "Access agent dashboard", "Communicate with tenants", "Track leads and inquiries"],
                    },
                  ].map((r) => (
                    <div key={r.role} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-semibold mb-3 ${
                        r.color === "emerald" ? "bg-emerald-50 text-emerald-600" :
                        r.color === "blue" ? "bg-blue-50 text-blue-600" :
                        "bg-orange-50 text-orange-600"
                      }`}>{r.role}</span>
                      <ul className="space-y-1.5">
                        {r.items.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-xs text-gray-500">
                            <span className="w-1 h-1 bg-[#1B1C15] rounded-full mt-1.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <p className="mt-3">By creating an account, you agree to provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
              </div>
            </section>

            {/* 3. Listing Guidelines */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-[#1B1C15] rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">3</span>
                Listing Guidelines
              </h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>Property owners and agents must adhere to the following guidelines when listing properties on Castle:</p>
                <ul className="list-none space-y-2.5 pl-2">
                  {[
                    "All listings must represent real, available properties in Bangalore, India",
                    "Property details (price, amenities, room type, photos) must be accurate and up to date",
                    "Photos must be genuine representations of the actual property — stock photos or misleading images are prohibited",
                    "Pricing must be transparent, including any additional charges (maintenance, electricity, food, etc.)",
                    "Discriminatory listings based on religion, caste, ethnicity, or any protected characteristic are strictly prohibited",
                    "Contact information provided must be valid and responsive",
                    "Listings for illegal or unauthorized properties will be removed immediately",
                    "Duplicate listings for the same property are not allowed",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 bg-[#1B1C15] rounded-full mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p>Castle reserves the right to remove any listing that violates these guidelines without prior notice.</p>
              </div>
            </section>

            {/* 4. Reviews & Ratings Policy */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-[#1B1C15] rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">4</span>
                Reviews &amp; Ratings Policy
              </h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>Reviews and ratings are a key part of the Castle community. To maintain trust and transparency:</p>
                <ul className="list-none space-y-2.5 pl-2">
                  {[
                    "Reviews must be honest, factual, and based on genuine experiences with the property",
                    "Fake reviews, paid reviews, or reviews by property owners on their own listings are prohibited",
                    "Abusive, defamatory, or threatening language in reviews is not permitted",
                    "Reviews containing personal information of others (phone numbers, addresses) will be removed",
                    "Property owners may respond to reviews publicly, but must maintain a respectful tone",
                    "Castle reserves the right to remove reviews that violate these guidelines",
                    "Users who repeatedly post fraudulent reviews may have their accounts suspended",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 bg-[#1B1C15] rounded-full mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 5. Acceptable Use */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-[#1B1C15] rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">5</span>
                Acceptable Use
              </h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>When using Castle, you agree not to:</p>
                <ul className="list-none space-y-2.5 pl-2">
                  {[
                    "Use the platform for any unlawful purpose or in violation of any applicable laws",
                    "Impersonate another person or misrepresent your identity or affiliation",
                    "Scrape, crawl, or use automated tools to extract data from the platform",
                    "Attempt to gain unauthorized access to other user accounts or platform systems",
                    "Upload malicious content, viruses, or harmful code",
                    "Spam other users with unsolicited messages or advertisements",
                    "Circumvent or manipulate the platform's features, security, or policies",
                    "Use the platform to harass, threaten, or discriminate against other users",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 bg-[#1B1C15] rounded-full mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 6. Account Termination */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-[#1B1C15] rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">6</span>
                Account Termination
              </h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>Castle reserves the right to suspend or terminate your account at any time if:</p>
                <ul className="list-none space-y-2.5 pl-2">
                  {[
                    "You violate any of these Terms of Service",
                    "You engage in fraudulent or deceptive behavior on the platform",
                    "Your listings are repeatedly reported for inaccurate information",
                    "You harass or abuse other users of the platform",
                    "Your account is used for unauthorized commercial purposes",
                    "We are required to do so by law or legal process",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 bg-[#1B1C15] rounded-full mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p>You may also voluntarily delete your account at any time through the account settings. Upon deletion, your personal data will be removed as described in our <Link href="/privacy" className="text-[#1B1C15] underline underline-offset-2">Privacy Policy</Link>.</p>
              </div>
            </section>

            {/* 7. Limitation of Liability */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-[#1B1C15] rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">7</span>
                Limitation of Liability
              </h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-5">
                  <p className="font-semibold text-gray-900 mb-2">Important Notice</p>
                  <p>Castle is a listing and discovery platform only. We do not guarantee the quality, safety, legality, or availability of any listed property. Users are advised to:</p>
                  <ul className="list-none space-y-2 pl-2 mt-3">
                    {[
                      "Physically visit and inspect properties before making any commitments",
                      "Verify the identity and credentials of property owners or agents independently",
                      "Read and understand all rental agreements before signing",
                      "Report any suspicious listings or fraudulent behavior to us immediately",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="mt-3">To the maximum extent permitted by applicable law, Castle shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or goodwill, arising out of or in connection with your use of the platform.</p>
                <p>Castle is not responsible for any disputes, damages, or losses arising from transactions between users, including rental agreements, deposits, or property conditions.</p>
              </div>
            </section>

            {/* 8. Dispute Resolution */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-[#1B1C15] rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">8</span>
                Dispute Resolution
              </h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>In the event of any dispute arising out of or relating to these Terms or the use of Castle:</p>
                <ul className="list-none space-y-2.5 pl-2">
                  {[
                    "Users are encouraged to first attempt to resolve disputes informally by contacting us at support@castle.in",
                    "If informal resolution is not possible, disputes shall be resolved through arbitration in accordance with the Arbitration and Conciliation Act, 1996 (India)",
                    "The place of arbitration shall be Bangalore, Karnataka, India",
                    "These Terms shall be governed by and construed in accordance with the laws of India",
                    "The courts of Bangalore, Karnataka shall have exclusive jurisdiction over any legal proceedings",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 bg-[#1B1C15] rounded-full mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 9. Intellectual Property */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-[#1B1C15] rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">9</span>
                Intellectual Property
              </h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>All content, design, graphics, logos, and trademarks on Castle are the property of Castle or its licensors. You may not copy, reproduce, distribute, or create derivative works from any content on the platform without prior written consent.</p>
                <p>Property photos and descriptions uploaded by users remain the intellectual property of the respective users, but by uploading them, you grant Castle a non-exclusive, royalty-free license to display them on the platform.</p>
              </div>
            </section>

            {/* 10. Changes to Terms */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-[#1B1C15] rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">10</span>
                Changes to These Terms
              </h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>We may revise these Terms at any time by updating this page. By continuing to use Castle after changes are posted, you accept the revised Terms. We encourage you to review this page periodically for the latest information.</p>
              </div>
            </section>

            {/* 11. Contact */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-[#1B1C15] rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">11</span>
                Contact Us
              </h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>If you have any questions about these Terms of Service, please contact us:</p>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 mt-3">
                  <div className="space-y-2 text-sm">
                    <p><strong className="text-gray-900">Castle</strong></p>
                    <p>Bangalore, Karnataka, India</p>
                    <p>Email: <a href="mailto:support@castle.in" className="text-[#1B1C15] underline underline-offset-2">support@castle.in</a></p>
                    <p>Website: <a href="https://castleliving.in" className="text-[#1B1C15] underline underline-offset-2">castleliving.in</a></p>
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* Bottom navigation */}
          <div className="mt-8 flex items-center justify-center gap-6 text-sm">
            <Link href="/privacy" className="text-[#1B1C15] hover:underline underline-offset-2 font-medium">
              Privacy Policy
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
