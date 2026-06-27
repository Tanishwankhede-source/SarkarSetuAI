import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SarkarSetu — Citizen Welfare Portal | सरकारसेतु",
  description: "Government citizen welfare and scheme discovery portal. Find eligible schemes, track applications, and access welfare benefits.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
