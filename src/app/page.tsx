import React from 'react';
import Link from 'next/link';
import { 
  LandingNav, 
  LandingHero, 
  BentoFeatures, 
  FutureShowcase, 
  PricingSection 
} from '@/components/landing/LandingComponents';
import '@/app/landing.css';

export default function Home() {
  return (
    <div className="landing-body min-h-screen">
      {/* Fonts */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" 
        rel="stylesheet" 
      />
      
      <LandingNav />
      
      <main>
        <LandingHero />
        
        <BentoFeatures />
        
        <FutureShowcase />
        
        <PricingSection />
        
        {/* Final CTA Section */}
        <section className="py-60 bg-white relative overflow-hidden">
          <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="text-6xl md:text-9xl font-black grotesque-heading mb-16 tracking-tighter">
              TIME TO <br />
              <span className="text-blue-600">GO PRO.</span>
            </h2>
            <div className="flex justify-center">
              <Link href="/login" className="btn-pill btn-pill-primary px-16 py-8 text-2xl">
                Claim Your link
              </Link>
            </div>
            <p className="mt-12 text-slate-400 font-bold uppercase tracking-widest text-[11px]">Free during early beta. limited slots remaining.</p>
          </div>
        </section>
      </main>

      <footer className="py-32 bg-white border-t border-slate-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-400 font-bold">
            <div className="grotesque-heading text-3xl text-slate-900 mb-12 md:mb-0">callme</div>
            <div className="flex space-x-12 mb-12 md:md-0">
              <Link href="/privacy" className="hover:text-blue-600 transition-colors uppercase tracking-widest text-[11px]">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-blue-600 transition-colors uppercase tracking-widest text-[11px]">Terms of Service</Link>
              <a href="mailto:hello@callme.com" className="hover:text-blue-600 transition-colors uppercase tracking-widest text-[11px]">Contact</a>
            </div>
            <div className="uppercase tracking-widest text-[11px]">© {new Date().getFullYear()} callme. Master your time.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}


