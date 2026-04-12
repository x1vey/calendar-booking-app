import React from 'react';
import Link from 'next/link';
import { LandingNav } from '@/components/landing/LandingComponents';
import '@/app/landing.css';

export default function PrivacyPolicy() {
  return (
    <div className="landing-body min-h-screen bg-white">
      <LandingNav />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-black grotesque-heading mb-12 tracking-tight">Privacy Policy</h1>
          
          <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">1. Introduction</h2>
              <p>
                At callme, we value your privacy. This policy explains how we collect, use, and protect your data when you use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">2. Information We Collect</h2>
              <p>
                We collect information you provide directly to us, such as when you create an account, synchronize your calendar, or communicate with us. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Personal identifiers (name, email address).</li>
                <li>Calendar data (events, availability) via Google Calendar API.</li>
                <li>Usage data and cookies for service improvement.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">3. How We Use Your Data</h2>
              <p>
                Your data is used solely to provide and improve the callme booking experience. We do not sell your personal data to third parties. We use it to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Facilitate meeting scheduling and synchronization.</li>
                <li>Send automated notifications and reminders.</li>
                <li>Ensure account security and prevent fraud.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">4. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">5. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at hi@hisubhadeep.com.
              </p>
            </section>
          </div>
          
          <div className="mt-20 pt-10 border-t border-slate-100">
            <Link href="/" className="text-blue-500 font-bold flex items-center gap-2 hover:gap-3 transition-all">
              <span>←</span> Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
