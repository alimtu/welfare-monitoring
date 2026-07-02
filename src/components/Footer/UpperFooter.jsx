'use client';

import Image from 'next/image';
import Link from 'next/link';
import { defaultImagePath } from '../../constants';

// Constants
const ICON_SIZE = 20;
const GRID_BREAKPOINTS = {
  base: 'grid-cols-2',
  sm: 'sm:grid-cols-3',
  md: 'md:grid-cols-6',
};

// Default footer links configuration
const DEFAULT_LINKS = [
  {
    text: 'دفترچه تلفن',
    href: 'contact',
    iconSrc: '/Images/FooterIcons/book.svg',
    iconAlt: 'Phone Book',
  },
  {
    text: 'تماس با ریاست',
    href: 'contact',
    iconSrc: '/Images/FooterIcons/Phone.svg',
    iconAlt: 'Contact President',
  },
  {
    text: 'خبرنامه',
    href: 'newsportal',
    iconSrc: '/Images/FooterIcons/atSign.svg',
    iconAlt: 'Newsletter',
  },
  {
    text: 'اینستاگرام',
    href: 'https://instagram.com/Uni-account',
    iconSrc: '/Images/FooterIcons/instagram.svg',
    iconAlt: 'Instagram',
    isSocialMedia: true,
  },
  {
    text: 'ایتا',
    href: 'https://eitaa.com/Uni-account',
    iconSrc: '/Images/FooterIcons/eitaa.svg',
    iconAlt: 'Eitaa',
    isSocialMedia: true,
  },
  {
    text: 'واتس‌آپ',
    href: 'https://wa.me/Uni-number',
    iconSrc: '/Images/FooterIcons/whatsapp.svg',
    iconAlt: 'WhatsApp',
    isSocialMedia: true,
  },
];

// Reusable FooterIcon component
const FooterIcon = ({ src, alt, size = ICON_SIZE }) => (
  <Image
    src={src || defaultImagePath}
    alt={alt}
    width={size}
    height={size}
    style={{ width: 'auto', height: 'auto' }}
    className="transition-transform group-hover:scale-110"
    loading="lazy"
  />
);

// Reusable FooterLink component
const FooterLink = ({ link, children }) => {
  const baseClasses =
    'group flex items-center gap-2 text-white hover:text-orange-400 transition-all duration-300 hover:scale-105';

  if (link.isSocialMedia) {
    return (
      <a
        className={baseClasses}
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visit our ${link.text} page`}
      >
        {children}
      </a>
    );
  }

  return (
    <Link className={baseClasses} href={link.href} aria-label={`Go to ${link.text} page`}>
      {children}
    </Link>
  );
};

// Main UpperFooter component
const UpperFooter = ({ links = DEFAULT_LINKS }) => {
  const gridClasses = [
    'grid',
    GRID_BREAKPOINTS.base,
    GRID_BREAKPOINTS.sm,
    GRID_BREAKPOINTS.md,
    'gap-6 lg:gap-8',
    'place-items-center sm:place-items-start md:place-items-center',
    'w-full max-w-7xl mx-auto',
  ].join(' ');

  return (
    <footer className="w-full bg-secondary-950 py-6 lg:py-8 px-6 lg:px-8 mt-5">
      <div className="flex justify-center items-center">
        <nav
          className={`text-xs lg:text-sm ${gridClasses}`}
          role="navigation"
          aria-label="Footer navigation"
        >
          {links.map((link, index) => (
            <FooterLink key={`footer-link-${index}`} link={link}>
              <FooterIcon src={link.iconSrc} alt={link.iconAlt} />
              <span className="whitespace-nowrap">{link.text}</span>
            </FooterLink>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default UpperFooter;
