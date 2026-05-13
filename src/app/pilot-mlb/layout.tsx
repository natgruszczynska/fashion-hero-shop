import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Most Lovable Brands — Pilotaż dla sellerów FashionHero",
  description: "Pierwszy płatny placement na homepage FashionHero. CPC, 500 zł kredytu na start, ryzyko po naszej stronie. Pilotaż dla 30 sellerów.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
