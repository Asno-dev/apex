import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, FileSliders } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SlideData {
  title: string;
  subtitle?: string;
  layout: string;
  variant: string;
  content?: string;
  points?: string[];
  sections?: { heading: string; detail: string }[];
  metrics?: { label: string; value: string; note?: string }[];
}

interface PresentationData {
  title: string;
  slides: SlideData[];
  theme: {
    primaryColor: string;
    accentColor: string;
    highlightColor: string;
    bgType?: string;
    bgColor1: string;
    bgColor2?: string;
    textColor: string;
    titleTextColor: string;
  };
}

export function SlidePreview({ jsonUrl }: { jsonUrl: string }) {
  const [data, setData] = useState<PresentationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch(jsonUrl)
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP error ${res.status}: ${text.substring(0, 50)}`);
        }
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("SlidePreview Fetch Error:", err);
        setError(`Failed to load preview: ${err.message}`);
        setLoading(false);
      });
  }, [jsonUrl]);

  if (loading) return <div className="flex h-full items-center justify-center text-white">Loading Slides...</div>;
  if (error || !data || !data.slides) return <div className="flex h-full items-center justify-center text-red-500">{error || 'Invalid presentation data'}</div>;

  const slides = data.slides;
  const theme = data.theme || {
    primaryColor: "0F172A",
    accentColor: "2563EB",
    bgColor1: "FFFFFF",
    textColor: "000000",
    titleTextColor: "000000"
  };

  const nextSlide = () => setCurrentIndex(i => (i + 1) % slides.length);
  const prevSlide = () => setCurrentIndex(i => (i - 1 + slides.length) % slides.length);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#161616] overflow-hidden justify-center items-center p-2 md:p-8">
      
      {/* Container for the single active slide */}
      <div className="relative w-full max-w-6xl aspect-[16/9] md:shadow-2xl md:rounded-lg overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <SlideRenderer slide={slides[currentIndex]} theme={theme} slideNumber={currentIndex + 1} />
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation Buttons Always Visible slightly outside or overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-between p-4 z-10">
           <button 
             onClick={prevSlide}
             className={cn(
               "pointer-events-auto h-12 w-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black hover:scale-110 transition-all backdrop-blur",
               currentIndex === 0 && "opacity-0 pointer-events-none"
             )}
             disabled={currentIndex === 0}
           >
             <ChevronLeft size={24} />
           </button>
           <button 
             onClick={nextSlide}
             className={cn(
               "pointer-events-auto h-12 w-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black hover:scale-110 transition-all backdrop-blur",
               currentIndex === slides.length - 1 && "opacity-0 pointer-events-none"
             )}
             disabled={currentIndex === slides.length - 1}
           >
             <ChevronRight size={24} />
           </button>
        </div>
      </div>
      
      {/* Dots Indicator */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              idx === currentIndex ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
            )}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function SlideRenderer({ slide, theme, slideNumber }: { slide: SlideData, theme: any, slideNumber: number }) {
  const bgStyle = theme.bgType === 'gradient' && theme.bgColor2 
    ? { background: `linear-gradient(135deg, #${theme.bgColor1}, #${theme.bgColor2})` }
    : { backgroundColor: `#${theme.bgColor1 || 'ffffff'}` };

  const titleColor = `#${theme.titleTextColor || '000000'}`;
  const textColor = `#${theme.textColor || '333333'}`;
  const accentStr = `#${theme.accentColor || '2563EB'}`;

  const renderSections = () => {
    if (!slide.sections || slide.sections.length === 0) return null;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 max-h-[300px] overflow-hidden">
        {slide.sections.map((s, i) => (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 * i }} key={i} className="p-6 rounded-xl border border-black/5 shadow-sm bg-white/40 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-3" style={{ color: titleColor }}>{s.heading}</h3>
            <p className="text-lg opacity-80" style={{ color: textColor }}>{s.detail}</p>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderMetrics = () => {
    if (!slide.metrics || slide.metrics.length === 0) return null;
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {slide.metrics.map((m, i) => (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 * i }} key={i} className="flex flex-col p-6 rounded-2xl bg-black/5" style={{ borderLeft: `6px solid ${accentStr}` }}>
            <span className="text-5xl font-black mb-2 tracking-tighter" style={{ color: accentStr }}>{m.value}</span>
            <span className="text-lg font-semibold" style={{ color: titleColor }}>{m.label}</span>
            {m.note && <span className="text-sm mt-2 opacity-70" style={{ color: textColor }}>{m.note}</span>}
          </motion.div>
        ))}
      </div>
    );
  };

  const renderPoints = () => {
    if (!slide.points || slide.points.length === 0) return null;
    return (
      <ul className="space-y-4 mt-6">
        {slide.points.map((p, i) => (
           <motion.li initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 * i }} key={i} className="flex items-start text-xl lg:text-2xl" style={{ color: textColor }}>
             <span className="mr-4 mt-2 h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: accentStr }} />
             <span>{p}</span>
           </motion.li>
        ))}
      </ul>
    );
  }

  return (
    <div className="w-full h-full relative" style={bgStyle}>
      <div className="absolute inset-0 p-10 md:p-16 flex flex-col">
        {/* Header */}
        <div className="mb-10 w-full animate-fade-in-down">
          <h1 className={cn("font-black tracking-tight", slide.layout === 'title' ? "text-6xl md:text-8xl mt-20 text-center" : "text-4xl md:text-5xl")} style={{ color: titleColor }}>
            {slide.title}
          </h1>
          {slide.subtitle && (
            <h2 className={cn("mt-4 opacity-80", slide.layout === 'title' ? "text-2xl md:text-3xl text-center" : "text-xl md:text-2xl")} style={{ color: textColor }}>
              {slide.subtitle}
            </h2>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col justify-start">
          {renderMetrics()}
          {renderSections()}
          {slide.content && <p className="text-xl md:text-2xl mt-6 opacity-90 leading-relaxed" style={{ color: textColor }}>{slide.content}</p>}
          {renderPoints()}
        </div>

        {/* Footer / Slide Number */}
        <div className="absolute bottom-6 right-8 text-sm opacity-50 font-mono font-bold" style={{ color: titleColor }}>
          {slideNumber < 10 ? `0${slideNumber}` : slideNumber}
        </div>
      </div>
    </div>
  );
}
