
import React from 'react';
import * as motion from 'motion/react-client';

export default function CoffeeShopLanding() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#2C2420] font-sans overflow-hidden">
      <header className="flex justify-between items-center py-6 px-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tighter">Bean<span className="text-[#A47E64]">&</span>Brew</h1>
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <a href="#menu" className="hover:text-[#A47E64] transition-colors">Menu</a>
          <a href="#origins" className="hover:text-[#A47E64] transition-colors">Origins</a>
          <a href="#locations" className="hover:text-[#A47E64] transition-colors">Locations</a>
        </nav>
        <button className="md:hidden p-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/>
          </svg>
        </button>
      </header>

      <section className="relative flex flex-col items-center justify-center pt-24 pb-32 px-6 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-6 leading-tight">
            Crafted for <br className="hidden md:block"/>
            <span className="italic text-[#A47E64] font-serif">the moment.</span>
          </h2>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-[#6B5A52] max-w-xl mb-12 leading-relaxed"
        >
          Ethically sourced beans, meticulously roasted, and brewed to perfection. Because every morning deserves a masterpiece.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button className="px-8 py-4 bg-[#2C2420] text-white rounded-full font-semibold hover:bg-[#4A3D36] transition-colors shadow-xl shadow-black/10">
            Order Pickup
          </button>
          <button className="px-8 py-4 bg-transparent border border-[#2C2420]/20 text-[#2C2420] rounded-full font-semibold hover:bg-[#2C2420]/5 transition-colors">
            Our Menu
          </button>
        </motion.div>
      </section>

      <section id="menu" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#A47E64] mb-3">Our Offerings</h3>
              <h2 className="text-4xl font-bold tracking-tight">The Classics</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              { name: 'Pour Over', desc: 'Single-origin beans brewed slowly for maximum clarity.', price: '$4.50' },
              { name: 'Flat White', desc: 'Velvety microfoam over a double ristretto shot.', price: '$5.00' },
              { name: 'Cold Brew', desc: 'Steeped for 18 hours for a smooth, bold finish.', price: '$4.50' },
              { name: 'Cortado', desc: 'Equal parts espresso and steamed milk.', price: '$4.25' },
              { name: 'Matcha Latte', desc: 'Ceremonial grade matcha with perfectly textured milk.', price: '$5.50' },
              { name: 'House Drip', desc: 'Our signature blends, rotating daily.', price: '$3.50' }
            ].map((item, idx) => (
              <motion.div 
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group border-b border-[#2C2420]/10 pb-6"
              >
                <div className="flex justify-between items-baseline mb-2">
                  <h4 className="text-xl font-bold">{item.name}</h4>
                  <span className="text-[#A47E64] font-medium">{item.price}</span>
                </div>
                <p className="text-[#6B5A52] text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#2C2420] text-white py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <h2 className="text-2xl font-bold tracking-tighter">Bean<span className="text-[#A47E64]">&</span>Brew</h2>
          <div className="flex gap-6 text-sm text-white/60">
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-sm text-white/40">&copy; 2026 Bean & Brew Coffee.</p>
        </div>
      </footer>
    </main>
  );
}
