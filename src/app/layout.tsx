import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { LayoutWithNavbar } from "@/components/layout-with-navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Standupovka - Spectacole de comedie și stand-up",
  description: "Așa, bună seara! Show-ul tău preferat revine la Arena pentru că data trecută s-a lăsat cu scandal și băieții nu au încă răspuns la întrebarea: 'Cine este campionul ABS?'",
  keywords: ["standupovka", "stand-up", "comedie", "spectacol", "arena", "ABS", "campion", "scandal", "divertisment"],
  authors: [{ name: "Echipa Standupovka" }],
  creator: "Standupovka",
  publisher: "Standupovka",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ro_RO',
    url: '/',
    title: 'Standupovka - Spectacole de comedie și stand-up',
    description: "Așa, bună seara! Show-ul tău preferat revine la Arena pentru că data trecută s-a lăsat cu scandal și băieții nu au încă răspuns la întrebarea: 'Cine este campionul ABS?'",
    siteName: 'Standupovka',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/og.jpg`,
        width: 1200,
        height: 630,
        alt: 'Standupovka - Spectacole de comedie și stand-up',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Standupovka - Spectacole de comedie și stand-up',
    description: "Așa, bună seara! Show-ul tău preferat revine la Arena pentru că data trecută s-a lăsat cu scandal și băieții nu au încă răspuns la întrebarea: 'Cine este campionul ABS?'",
    images: [`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/og.jpg`],
    creator: '@standupovka',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />
        <meta property="fb:app_id" content="your-facebook-app-id" />
        <meta name="application-name" content="Standupovka" />
        <meta name="apple-mobile-web-app-title" content="Standupovka" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Standupovka",
              "description": "Spectacole de comedie și stand-up",
              "url": process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
              "logo": {
                "@type": "ImageObject",
                "url": `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/logo.svg`
              },
              "sameAs": [
                "https://facebook.com/standupovka",
                "https://instagram.com/standupovka",
                "https://twitter.com/standupovka"
              ]
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <LayoutWithNavbar>
            {children}
          </LayoutWithNavbar>
        </Providers>
      </body>
    </html>
  );
}
