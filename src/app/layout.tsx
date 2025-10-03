import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "./contexts/WalletContext";
import Navbar from "./components/Navbar";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Dsessenger",
    description: "Decentralised messaging app",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <WalletProvider>
                    <div className="relative h-screen w-screen">
                        <div className="relative flex flex-col flex-1 transition-all overflow-auto">
                            <Navbar />
                            <main className="">{children}</main>
                        </div>
                    </div>
                </WalletProvider>
            </body>
        </html>
    );
}
