"use client";

import posthog from "posthog-js";

const brands = [
  { name: "Maison Noir", claim: "Timeless tailoring, modern silhouettes", accent: "#1a1a1a" },
  { name: "Velvet Studio", claim: "Soft luxury for every day", accent: "#7a3b5c" },
  { name: "Sneakers Premium", claim: "Crafted kicks, street ready", accent: "#2d4a3a" },
  { name: "Walking Warsawa", claim: "Urban comfort made in Poland", accent: "#c8851f" },
];

export function PromotedBrands() {
  return (
    <section className="max-w-[1440px] mx-auto px-8 py-20">
      <div className="text-center mb-12">
        <h2
          className="text-[44px] leading-tight"
          style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, letterSpacing: "-0.5px" }}
        >
          Most Lovable Brands
        </h2>
      </div>

      <div
        className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none -mx-8 px-8 md:mx-0 md:px-0 pb-2 md:pb-0"
        style={{ scrollbarWidth: "none" }}
      >
        {brands.map((b) => (
          <div
            key={b.name}
            className="group relative bg-card border border-border flex-shrink-0 w-[78%] md:w-auto snap-start flex flex-col"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
          >
            <span
              className="absolute top-2.5 right-2.5 z-10 bg-background text-foreground uppercase font-semibold px-2 py-1 border"
              style={{ fontSize: "9px", letterSpacing: "1px", borderColor: "#e8d28a", color: "#8a6d1f" }}
            >
              PROMOTED
            </span>

            <div
              className="aspect-square flex items-center justify-center px-6"
              style={{ background: `linear-gradient(180deg, ${b.accent}10 0%, ${b.accent}22 100%)` }}
            >
              <div
                className="text-center"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  fontSize: "26px",
                  letterSpacing: "-0.5px",
                  color: b.accent,
                  lineHeight: 1.1,
                }}
              >
                {b.name}
              </div>
            </div>

            <div className="p-5 flex flex-col gap-4 flex-1">
              <p
                style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: 1.5,
                  color: "#6b6b6b",
                }}
              >
                {b.claim}
              </p>
              <button
                className="uppercase border border-foreground/80 text-foreground hover:bg-foreground hover:text-background transition-colors rounded-full px-5 py-2.5 mt-auto self-start"
                style={{ fontSize: "10px", letterSpacing: "2px", fontWeight: 600 }}
                onClick={() => posthog.capture("promoted_brands_click", { brand_name: b.name })}
              >
                Zobacz kolekcję
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
