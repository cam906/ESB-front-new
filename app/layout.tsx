import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AuthCookieSync from "./components/AuthCookieSync";
import AuthenticatorProvider from "./amplify-client-config";
import ApolloAppProvider from "./components/ApolloAppProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Elite Sports Bets",
  description: "Elite Sports Bets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
      >
        <AuthenticatorProvider>
          <ApolloAppProvider>
            <AuthCookieSync />
            <Header />
            {children}
            <Footer />
          </ApolloAppProvider>
        </AuthenticatorProvider>
      </body>
    </html>
  );
}
