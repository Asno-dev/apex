import React from 'react';
import { Coffee } from 'lucide-react';

export const Navbar = () => (
  <nav className="flex items-center justify-between px-8 py-6">
    <div className="flex items-center gap-2 text-coffee-700 font-bold text-xl">
      <Coffee className="w-6 h-6" />
      <span>BrewHaven</span>
    </div>
    <div className="flex gap-6 text-sm font-medium text-coffee-600">
      <a href="#menu" className="hover:text-coffee-700">Menu</a>
      <a href="#about" className="hover:text-coffee-700">About</a>
      <a href="#contact" className="hover:text-coffee-700">Contact</a>
    </div>
  </nav>
);