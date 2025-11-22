"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
// Note: 'embla-carousel-react' library install karni hogi

// Carousel slides ka data (Aapke screenshots ke mutabiq)
const slides = [
  {
    image: '/carousel-1.png', // Aapke '251963.png' ka path
    title: 'Sab Kuch Ek Board Par',
    description: 'Apne sare, munafay, aur business ki sehat par real-time mein nazar rakhein.',
  },
  {
    image: '/carousel-2.png', // Aapke '251962.png' ka path
    title: 'Apna Poora Stock Manage Karein',
    description: 'Har item ka hisab rakhein aur low-stock alerts se nuqsan se bachein.',
  },
  {
    image: '/carousel-3.png', // Aapke '251964.png' ka path
    title: 'Waqt Par Payment Hasil Karein',
    description: 'Automatic payment reminders bhej kar apne customers se tezi se paise wasool karein.',
  },
];

export default function OnboardingPage() {
  // Embla hook setup (yeh carousel ko initialize karta hai)
  // 'loop: true' ka matlab hai aakhri slide ke baad pehli aa jayegi
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [currentIndex, setCurrentIndex] = useState(0);

  // Yeh function embla ko sunta hai aur current slide update karta hai
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Yeh manual dots navigation ke liye hai
  const scrollTo = useCallback((index) => {
    emblaApi && emblaApi.scrollTo(index);
  }, [emblaApi]);

  // Jab embla initialize ho, 'select' event ko suno
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    return () => emblaApi.off('select', onSelect); // Cleanup
  }, [emblaApi, onSelect]);

  // --- Auto-play Logic ---
  useEffect(() => {
    if (!emblaApi) return;
    
    // Har 5 second (5000ms) baad agli slide pe jao
    const timer = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    // Jab component unmount ho, timer clear karo
    return () => clearInterval(timer);
  }, [emblaApi]);


  return (
    <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto shadow-2xl overflow-hidden">
      {/* 1. Header */}
      <header className="flex justify-between items-center p-5">
        <div className="relative h-8 w-36">
          <Image
            src="/logo-full.png" // Aapka '221348.png'
            alt="Karobar Solution Logo"
            layout="fill"
            objectFit="contain"
          />
        </div>
        <Link href="/login" legacyBehavior>
          <a className="text-sm font-medium text-text-medium hover:text-brand">
            Skip
          </a>
        </Link>
      </header>

      {/* 2. Carousel Content (Embla setup) */}
      <div className="flex-1" ref={emblaRef}>
        <div className="flex">
          {/* Har slide ko embla ke 'slide' container mein daalein */}
          {slides.map((slide, index) => (
            <div className="relative flex-[0_0_100%] flex flex-col items-center justify-center text-center p-8" key={index}>
              <div className="relative w-full max-w-xs h-64 mb-10">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  layout="fill"
                  objectFit="contain"
                  priority={index === 0} // Pehli image ko fast load karein
                />
              </div>
              <h2 className="text-2xl font-semibold text-text-dark mb-4">
                {slide.title}
              </h2>
              <p className="text-base text-text-medium max-w-sm">
                {slide.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Footer (Pagination & Button) */}
      <footer className="p-8">
        {/* Pagination Dots */}
        <div className="flex justify-center space-x-2 mb-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)} // Click par slide change karein
              className={`h-2 w-2 rounded-full transition-all ${
                currentIndex === index ? 'w-4 bg-brand' : 'bg-border-light'
              }`}
            ></button>
          ))}
        </div>
        
        {/* Action Button (Brand Red) */}
        <Link href="/login" legacyBehavior>
          <a className="block w-full text-center py-4 px-6 bg-brand text-white text-base font-medium rounded-xl shadow-lg hover:opacity-90 transition-opacity">
            Login / Sign Up
          </a>
        </Link>
      </footer>
    </div>
  );
}


