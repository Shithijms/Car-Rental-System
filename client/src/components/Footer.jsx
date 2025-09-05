import React from 'react';
import { assets } from '../assets/assets';

const Footer = () => {
  const linkSections = [
    {
      title: "Quick Links",
      links: [
        { name: "Home", href: "/" },
        { name: "Browse Cars", href: "/cars" },
        { name: "My Bookings", href: "/my-bookings" },
        { name: "Contact", href: "#" }
      ]
    },
    {
      title: "Support",
      links: [
        { name: "FAQs", href: "#" },
        { name: "Terms & Conditions", href: "#" },
        { name: "Privacy Policy", href: "#" }
      ]
    },
    {
      title: "Connect",
      links: [
        { name: "Instagram", href: "#" },
        { name: "Twitter", href: "#" },
        { name: "Facebook", href: "#" }
      ]
    }
  ];

  return (
    <footer className="px-6 md:px-16 lg:px-24 xl:px-32 bg-gray-50 border-t border-gray-200">
      <div className="flex flex-col md:flex-row items-start justify-between gap-10 py-10 text-gray-700">
        <div>
          <img className="w-32 mb-4" src={assets.logo} alt="Car Rental System Logo" />
          <p className="max-w-[410px]">
            Car Rental System – Your trusted partner for affordable and luxury car rentals. Book, drive, and enjoy seamless journeys with us.
          </p>
        </div>
        <div className="flex flex-wrap justify-between w-full md:w-[60%] gap-8">
          {linkSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-base text-gray-900 mb-3">{section.title}</h3>
              <ul className="text-sm space-y-1">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <a href={link.href} className="hover:underline transition">{link.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <p className="py-4 text-center text-xs md:text-sm text-gray-500/80">
        &copy; {new Date().getFullYear()} Car Rental System. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;