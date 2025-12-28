"use client";

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Calendar, FileText, LogOut, Users, Settings, Menu, X, Tag } from 'lucide-react';

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { name: 'תאריכי טיול', href: '/admin', icon: Calendar },
    { name: 'הזמנות', href: '/admin/bookings', icon: FileText },
    { name: 'לקוחות', href: '/admin/users', icon: Users },
    { name: 'קופונים', href: '/admin/coupons', icon: Tag },
    { name: 'הגדרות', href: '/admin/settings', icon: Settings },
  ];

  return (
    <nav className="bg-white shadow-md border-b border-gray-200" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="text-lg sm:text-xl font-bold text-primary-600 flex-shrink-0">
            תמיר טריפ - מנהל
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* Desktop Logout */}
          <button
            onClick={handleLogout}
            className="hidden lg:inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition"
          >
            <LogOut className="w-4 h-4" />
            התנתק
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </button>
              );
            })}
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition"
            >
              <LogOut className="w-5 h-5" />
              התנתק
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
