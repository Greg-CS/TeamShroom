'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Shiny Showcase', id: 'nav-showcase' },
    { href: '/hitlist', label: 'Shiny Pokédex', id: 'nav-hitlist' },
    { href: '/shinyweekly', label: 'Shiny Weekly', id: 'nav-shinyweekly' },
    { href: '/donators', label: 'Donators', id: 'nav-donators' },
  ];

  return (
    <nav className="nav">
      {links.map(link => {
        const isActive = pathname === link.href || 
          (link.href === '/' && pathname?.startsWith('/showcase'));
        return (
          <Link
            key={link.id}
            href={link.href}
            id={link.id}
            className={isActive ? 'active' : ''}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
