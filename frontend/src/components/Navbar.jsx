import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth.js';
import { 
  Bot, 
  LayoutDashboard, 
  Key, 
  BookOpen, 
  Settings, 
  MessageSquare, 
  Users,
  Menu,
  X,
  LogOut
} from 'lucide-react';

const Navbar = () => {
  const { user, tenant, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'API Keys', href: '/api-keys', icon: Key },
    { name: 'Knowledge Base', href: '/knowledge-base', icon: BookOpen },
    { name: 'Prompt Tuner', href: '/prompt-tuner', icon: Settings },
    { name: 'Chat Tester', href: '/chat-tester', icon: MessageSquare },
    { name: 'Handoff Center', href: '/handoff-center', icon: Users }
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">ChatBot SaaS</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {/* Tenant info */}
            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium text-gray-900">{tenant?.name}</div>
              <div className="text-xs text-gray-500 capitalize">{tenant?.subscription?.plan} plan</div>
            </div>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-600">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:block text-sm font-medium">{user?.name}</span>
              </button>

              {/* Dropdown menu */}
              {mobileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                    <div className="text-xs text-gray-500">{user?.email}</div>
                  </div>
                  
                  {/* Mobile navigation */}
                  <div className="md:hidden">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center space-x-2 px-4 py-2 text-sm hover:bg-gray-50 ${
                            isActive(item.href) ? 'text-primary-600 bg-primary-50' : 'text-gray-700'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                    <div className="border-t border-gray-100 mt-1 pt-1"></div>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;