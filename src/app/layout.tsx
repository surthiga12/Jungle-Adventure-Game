import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jungle Explorer: Coding Adventure",
  description: "An exciting jungle adventure where kids learn programming by guiding animal explorers through the wild!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}
        style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, \"Apple Color Emoji\", \"Segoe UI Emoji\"" }}
      >
        {children}
      </body>
    </html>
  );
}
