import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google"; // Changed to modern SaaS favorites
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { cn } from "@/lib/utils";
import { AuthSync } from "@/components/auth-sync";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  metadataBase: new URL("https://ailar.uz"),
  title: "Ailar - AI Vositalar va Yangiliklar",
  description: "O'zbek tilidagi eng katta AI katalogi, yangiliklar va promptlar kutubxonasi.",
  alternates: {
    canonical: "/",
  },
  authors: [{ name: "Shukhratbek Mamadaliev", url: "https://github.com/shukhratbekdev" }],
  creator: "Shukhratbek Mamadaliev",
  openGraph: {
    title: "Ailar - AI Vositalar va Yangiliklar",
    description: "O'zbek tilidagi eng katta AI katalogi, yangiliklar va promptlar kutubxonasi.",
    url: "https://ailar.uz",
    siteName: "Ailar",
    locale: "uz_UZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ailar - AI Vositalar va Yangiliklar",
    description: "O'zbek tilidagi eng katta AI katalogi, yangiliklar va promptlar kutubxonasi.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased flex flex-col",
        inter.variable,
        jakarta.variable
      )}>
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthSync />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
