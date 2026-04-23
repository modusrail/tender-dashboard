export const metadata = {
  title: "Tender Dashboard",
  description: "Modus Rail Tender Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
