"use client";

export default function DarkModeStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
.dark h1, .dark h2, .dark h3, .dark h4 { color: #fff !important; }
.dark .text-gray-900 { color: #f3f4f6 !important; }
.dark .text-gray-700 { color: #d1d5db !important; }
.dark .text-gray-600 { color: #d1d5db !important; }
.dark .bg-gray-50 { background-color: rgba(30, 30, 50, 0.6) !important; }
.dark .bg-gray-100 { background-color: rgba(40, 40, 60, 0.6) !important; }
.dark .bg-white { background-color: rgba(20, 20, 35, 0.9) !important; }
.dark .bg-white\\/80 { background-color: rgba(20, 20, 35, 0.8) !important; }
.dark .border-gray-100 { border-color: rgba(255,255,255,0.08) !important; }
.dark .border-gray-200 { border-color: rgba(255,255,255,0.1) !important; }
.dark .border-gray-300 { border-color: rgba(255,255,255,0.12) !important; }
.dark .bg-yellow-50 { background-color: rgba(120,100,0,0.2) !important; }
.dark .bg-violet-50 { background-color: rgba(108,60,233,0.15) !important; }
.dark .bg-blue-50 { background-color: rgba(59,130,246,0.15) !important; }
.dark .bg-pink-50 { background-color: rgba(236,72,153,0.15) !important; }
.dark .bg-purple-50 { background-color: rgba(168,85,247,0.15) !important; }
.dark .bg-green-50 { background-color: rgba(34,197,94,0.15) !important; }
.dark .bg-orange-50 { background-color: rgba(249,115,22,0.15) !important; }
.dark .bg-emerald-50 { background-color: rgba(16,185,129,0.15) !important; }
.dark .bg-amber-50 { background-color: rgba(245,158,11,0.15) !important; }
.dark .bg-red-50 { background-color: rgba(239,68,68,0.15) !important; }
.dark .bg-sky-50 { background-color: rgba(14,165,233,0.15) !important; }
.dark .text-violet-700 { color: #c4b5fd !important; }
.dark .text-blue-700 { color: #93c5fd !important; }
.dark .text-pink-700 { color: #f9a8d4 !important; }
.dark .text-purple-700 { color: #d8b4fe !important; }
.dark .text-green-700 { color: #86efac !important; }
.dark .text-orange-700 { color: #fdba74 !important; }
.dark .text-emerald-700 { color: #6ee7b7 !important; }
`,
      }}
    />
  );
}
