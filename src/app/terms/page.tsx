import React from 'react';
import Link from 'next/link';
import { LandingNav } from '@/components/landing/LandingComponents';
import '@/app/landing.css';

export default function TermsAndConditions() {
  return (
    <div className="landing-body min-h-screen bg-white">
      <LandingNav />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-black grotesque-heading mb-12 tracking-tight">Terms of Service</h1>
          
          <div className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">1. Acceptance of Terms</h2>
              <p>
                By accessing or using callme, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">2. Use of Service</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account. You agree to use the service only for lawful purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">3. User Conduct</h2>
              <p>
                You agree not to use the service to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Violate any local, state, or international law.</li>
                <li>Harrass, abuse, or harm another person.</li>
                <li>Interfere with or disrupt the service or servers.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">4. Limitation of Liability</h2>
              <p>
                callme shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or the inability to use the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">5. Modifications to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Your continued use of the service after such modifications will constitute your acknowledgment of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">6. Termination</h2>
              <p>
                We reserve the right to terminate or suspend your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users of the service.
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
