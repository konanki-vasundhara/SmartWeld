import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNavBar() {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: 'home', label: 'Home' },
    { path: '/scanner', icon: 'biotech', label: 'Scan' },
    { path: '/emergency-booking', icon: 'storefront', label: 'Shops' },
    { path: '/vassu-ai', icon: 'smart_toy', label: 'Vassu' },
    { path: '/profile', icon: 'person', label: 'Profile' },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center pt-2 pb-safe px-2 h-20 bg-surface-container/90 backdrop-blur-md border-t border-outline-variant dark:border-outline shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link 
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center px-4 py-1.5 transition-all ${
                isActive 
                  ? 'text-primary dark:text-primary-fixed bg-secondary-container dark:bg-on-secondary-fixed-variant rounded-xl' 
                  : 'text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed-dim'
              }`}
            >
              <span 
                className="material-symbols-outlined" 
                data-icon={item.icon} 
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="font-label-bold text-[10px] md:text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      {/* Spacer to prevent content from hiding behind the navbar */}
      <div className="h-20 w-full shrink-0"></div>
    </>
  );
}
