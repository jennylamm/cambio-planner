import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cambio Pendant Planner",
  description:
    "Design an About Space Cambio pendant light — drag shades onto a fixture and see the running cost.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
