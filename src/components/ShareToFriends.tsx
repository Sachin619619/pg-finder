"use client";

import { useState } from "react";

interface ShareToFriendsProps {
  pgName: string;
  pgPrice: number;
  pgArea: string;
  pgId: string;
}

export default function ShareToFriends({ pgName, pgPrice, pgArea, pgId }: ShareToFriendsProps) {
  const [showMessage, setShowMessage] = useState(false);
  const url = `https://castleliving.in/listing/${pgId}`;
  
  const shareText = `🏰 Found an amazing PG on Castle Living!\n\n📍 *${pgName}* in ${pgArea}\n💰 ₹${pgPrice.toLocaleString()}/month\n🔗 ${url}\n\nCheck it out!`;

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: "📱",
      color: "bg-emerald-500 hover:bg-emerald-600",
      url: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    },
    {
      name: "Telegram",
      icon: "✈️",
      color: "bg-blue-500 hover:bg-blue-600",
      url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: "Twitter",
      icon: "𝕏",
      color: "bg-black hover:bg-gray-800",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
    },
    {
      name: "Copy Link",
      icon: "🔗",
      color: "bg-gray-600 hover:bg-gray-700",
      action: "copy",
    },
  ];

  const handleShare = (link: typeof shareLinks[0]) => {
    if (link.action === "copy") {
      navigator.clipboard.writeText(url).then(() => {
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 2000);
      });
    } else if (link.url) {
      window.open(link.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">👥</span>
        <h3 className="text-sm font-bold text-gray-900">Share with Friends</h3>
        {showMessage && <span className="text-xs text-emerald-600 font-semibold">✓ Copied!</span>}
      </div>
      
      <p className="text-xs text-gray-500 mb-4">
        Know someone looking for a PG? Share this listing and help them find their perfect home!
      </p>

      <div className="grid grid-cols-2 gap-2">
        {shareLinks.map(link => (
          <button
            key={link.name}
            onClick={() => handleShare(link)}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all ${link.color}`}
          >
            <span>{link.icon}</span>
            <span>{link.name}</span>
          </button>
        ))}
      </div>

      {/* Share message preview */}
      <div className="mt-4 p-3 bg-gray-50 rounded-xl">
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Message Preview</p>
        <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">{shareText}</p>
      </div>
    </div>
  );
}
