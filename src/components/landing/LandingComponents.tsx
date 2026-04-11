import React from 'react';
import Link from 'next/link';

export function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-semibold tracking-tighter serif-heading">callme</span>
        </Link>
        <div className="flex items-center space-x-6">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Sign in
          </Link>
          <Link href="/login" className="btn-planner text-sm">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

export function LandingHero({ graphicUrl }: { graphicUrl: string }) {
  return (
    <section className="pt-32 pb-20 relative overflow-hidden">
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div className="animate-slide-up">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-500 mb-6 tracking-wide uppercase">
            Scheduling, Solving.
          </div>
          <h1 className="text-5xl lg:text-7xl font-medium leading-[1.1] mb-8 serif-heading">
            Your schedule, <br />
            <span className="text-slate-400">perfectly structured.</span>
          </h1>
          <p className="text-xl text-slate-500 mb-10 max-w-lg leading-relaxed">
            The minimal, high-end booking tool for those who value organization. From instant sync to automated email pipelines.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/login" className="btn-planner-primary rounded-none flex items-center justify-center">
              Claim your schedule
            </Link>
            <Link href="#features" className="px-6 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center">
              View Features
            </Link>
          </div>
        </div>
        <div className="relative animate-slide-up delay-1">
          <div className="absolute inset-0 grid-bg opacity-30 -m-8 pointer-events-none"></div>
          <div className="relative planner-card p-2 rounded-sm bg-white overflow-hidden rotate-1 shadow-2xl">
            <img 
              src={graphicUrl} 
              alt="callme interface" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function TimelineShowcase() {
  const steps = [
    { title: 'Booking Reserved', desc: 'Secure the slot instantly and sync to Google Calendar.' },
    { title: 'Confirmation Sent', desc: 'Automated email with Meet links and calendar files.' },
    { title: '1-Day Reminder', desc: 'Gentle nudge 24h before to ensure attendance.' },
    { title: '5-Min Alert', desc: 'Final ping with join link sent to both host and client.' },
    { title: 'Follow-up Sent', desc: 'Professional thank you note triggered after the session.' }
  ];

  return (
    <section className="py-24 bg-slate-50/50">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl font-medium mb-4 serif-heading uppercase tracking-wide">The Pipeline</h2>
          <p className="text-slate-500">A structured timeline of automation that feels like a personal assistant working behind the scenes.</p>
        </div>
        <div className="grid md:grid-cols-5 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative group animate-slide-up" style={{ animationDelay: `${0.1 * i}s` }}>
              <div className="mb-4 flex items-center">
                <div className="timeline-dot"></div>
                {i < steps.length - 1 && <div className="ml-2 flex-1 h-[1px] bg-slate-200"></div>}
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeatureGrid() {
  const features = [
    { title: 'Google Calendar Sync', desc: 'One-click oauth. Instant availability checks. No double bookings.' },
    { title: 'Custom Email Templates', desc: 'Personalize every touchpoint. Active/Disabled toggles for every stage.' },
    { title: 'Privacy First', desc: 'Strict multi-account isolation. Your data belongs only to you.' },
    { title: 'Clean Dashboard', desc: 'No clutter. Just your bookings, customers, and time.' }
  ];

  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, i) => (
          <div key={i} className="planner-card p-8 group animate-slide-up" style={{ animationDelay: `${0.2 * i}s` }}>
            <div className="w-10 h-10 border border-slate-200 flex items-center justify-center mb-6 font-mono text-slate-400 group-hover:border-slate-900 group-hover:text-slate-900 transition-colors">
              0{i + 1}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">{feature.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
