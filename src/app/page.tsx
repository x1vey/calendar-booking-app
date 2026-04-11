import React from 'react';
import { LandingNav, LandingHero, TimelineShowcase, FeatureGrid } from '@/components/landing/LandingComponents';
import '@/app/landing.css';

export default function Home() {
  return (
    <div className="landing-body min-h-screen">
      {/* Meta/Head simulation via Next.js metadata is handled in Layout, but we ensure styles */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=Inter:wght@400;500;600;700&display=swap" 
        rel="stylesheet" 
      />
      
      <LandingNav />
      
      <main>
        <LandingHero graphicUrl="/callme-hero.png" />
        
        <TimelineShowcase />
        
        <FeatureGrid />
        
        {/* Final CTA Section */}
        <section className="py-24 border-t border-slate-100 bg-white relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none"></div>
          <div className="container mx-auto px-6 text-center animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-medium mb-8 serif-heading tracking-tight">
              Reclaim your focus. <br />
              <span className="text-slate-400">Claim your schedule.</span>
            </h2>
            <p className="text-lg text-slate-500 mb-12 max-w-xl mx-auto">
              Join the most organized professionals who trust callme to handle their time. Simple, secure, and automated.
            </p>
            <div className="flex justify-center">
              <a href="/login" className="btn-planner-primary rounded-none px-12 py-4">
                Get Started with callme
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-slate-100 bg-slate-50/50">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400 font-medium">
          <div className="serif-heading text-lg text-slate-900 mb-4 md:mb-0">callme</div>
          <div className="flex space-x-8 mb-4 md:mb-0">
            <a href="#" className="hover:text-slate-600">Privacy</a>
            <a href="#" className="hover:text-slate-600">Terms</a>
            <a href="#" className="hover:text-slate-600">Security</a>
          </div>
          <div>© {new Date().getFullYear()} callme. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
