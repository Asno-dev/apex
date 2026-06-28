import React from 'react';
import { ArrowRight, Coffee, Star } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-20 py-10">
      {/* Hero Section */}
      <section className="px-8 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h1 className="text-6xl font-bold text-coffee-700 leading-tight">
            Your Morning Ritual, <span className="text-coffee-500">Perfected.</span>
          </h1>
          <p className="text-lg text-coffee-600 max-w-lg">
            Experience the finest ethically sourced beans, roasted to perfection in our local studio. Delivered fresh to your cup.
          </p>
          <button className="bg-coffee-700 text-white px-8 py-4 rounded-full font-semibold flex items-center gap-2 hover:bg-coffee-600 transition-colors">
            Order Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 bg-coffee-100 h-96 w-full rounded-3xl flex items-center justify-center">
          <Coffee className="w-32 h-32 text-coffee-500" />
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="px-8">
        <h2 className="text-4xl font-bold text-coffee-700 mb-12">Signature Brews</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-coffee-100">
              <div className="w-12 h-12 bg-coffee-50 rounded-full flex items-center justify-center mb-4">
                <Coffee className="text-coffee-500" />
              </div>
              <h3 className="text-xl font-bold text-coffee-700">Artisan Blend {i}</h3>
              <p className="text-coffee-600 mt-2">Notes of chocolate, caramel, and a hint of citrus.</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-bold text-coffee-700">$4.50</span>
                <button className="text-sm font-semibold text-coffee-500 hover:underline">Add to cart</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}