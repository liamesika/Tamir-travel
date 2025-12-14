import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: '--font-heebo',
});

export const metadata: Metadata = {
  title: "לונדון שלא הכרתם | טיול טבע ומורשת ייחודי",
  description: "גלו את הצד האחר של לונדון - טיול חווייתי בן יומיים בטבע, כפרים היסטוריים ונופים עוצרי נשימה. כולל לינה, ארוחת בוקר ויום שופינג באאוטלטים",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${heebo.className} ${heebo.variable}`}>{children}</body>
    </html>
  );
}
