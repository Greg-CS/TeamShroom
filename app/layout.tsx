import type { Metadata } from 'next';
import { Navigation } from '@/components/Navigation';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Team Shroom Shiny Dex',
  description: 'Team Shroom Shiny Pokémon Showcase',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/img/symbols/shroomsprite.png" />
      </head>
      <body>
        <Navigation />
        <main id="page-content">{children}</main>
      </body>
    </html>
  );
}
