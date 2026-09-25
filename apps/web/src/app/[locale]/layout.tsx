import React from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { locales, Locale } from '../../i18n';
import { AppNavbar } from '../../components/layout/AppNavbar';
import { ServerWakeupBanner } from '../../components/common/ServerWakeupBanner';
import '../globals.css';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  const isRtl = locale === 'ar';

  return (
    <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'}>
      <head>
        <title>FIXnGO - Maintenance, Rentals and Field Teams in One App</title>
        <meta
          name="description"
          content="Electrical, plumbing and AC work, labour supply, equipment rental and material sales with live tracking and finance built in."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Sora:wght@300;400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body className="min-h-screen bg-ground text-ink font-body antialiased selection:bg-signal-orange/20 selection:text-signal-orange">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppNavbar locale={locale} />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <ServerWakeupBanner locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
