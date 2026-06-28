'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, ArrowRight, Star } from 'lucide-react';

export default function CoffeeShopPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans">
      <header className="border-b border-zinc-900/50 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="w-6 h-6 text-amber-500" />
            <span className="font-bold text-lg tracking-tight">Bean & Brew</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-400">
            <a href="#menu" className="hover:text-amber-500 transition-colors">Menu</a>
            <a href="#about" className="hover:text-amber-500 transition-colors">Our Story</a>
            <button className="bg-amber-500 text-black font-semibold px-4 py-2 rounded-full hover:bg-amber-400 transition-all">
              Order Now
            </button>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <section className="flex flex-col items-center text-center py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <span className="text-amber-500 font-mono text-sm tracking-widest uppercase">Crafted with passion</span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
              Wake up to <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">perfect flavor</span>
            </h1>
            <p className="text-zinc-400 max-w-lg mx-auto text-lg">
              Experience the finest ethically sourced beans, roasted daily for the perfect cup every time.
            </p>
            <div className="flex gap-4 justify-center pt-6">
              <button className="flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-zinc-200 transition-all">
                Explore Menu <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </section>

        <section id="menu" className="py-20">
          <h2 className="text-3xl font-bold text-center mb-12">Signature Brews</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl hover:border-amber-500/50 transition-all group">
                <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
                  <Coffee className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Artisan Roast {i}</h3>
                <p className="text-zinc-400 text-sm mb-4">Notes of dark chocolate, caramel, and a hint of citrus.</p>
                <div className="flex items-center gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4 h-4 fill-current" />)}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}