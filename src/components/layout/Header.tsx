"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { 
  Menu, 
  X, 
  ChevronDown, 
  LogIn,
  User,
  Zap,
  Camera,
  FileText,
  BarChart3,
  Settings
} from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Features', href: '#features' },
    { name: 'Solutions', href: '#solutions' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' }
  ];

  const productDropdown = [
    { name: 'Client Management', href: '#', icon: User, description: 'Manage client relationships' },
    { name: 'Project Workflows', href: '#', icon: FileText, description: 'Streamline project management' },
    { name: 'Photo Studio', href: '#', icon: Camera, description: 'Professional photo tools' },
    { name: 'Analytics', href: '#', icon: BarChart3, description: 'Business intelligence' },
    { name: 'System Tools', href: '#', icon: Settings, description: 'Advanced system features' }
  ];

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-gray-900">Canvas Hub</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-primary transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
            
            {/* Products Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-1 text-gray-700 hover:text-primary transition-colors font-medium">
                  <span>Products</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                {productDropdown.map((item) => (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link href={item.href} className="flex items-start space-x-3 p-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                        <item.icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/auth">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth">Get Started Free</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t pt-4 mt-4">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Products
              </p>
              {productDropdown.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="border-t pt-4 mt-4 space-y-2">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                  Get Started Free
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}