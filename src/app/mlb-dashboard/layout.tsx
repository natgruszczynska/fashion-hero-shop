import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Most Lovable Brand — Placement Dashboard",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
