export const metadata = {
  title: "Tender Watch Dashboard",
  description: "Tender tracking dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
