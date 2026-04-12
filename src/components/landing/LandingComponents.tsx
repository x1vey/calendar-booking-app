import React from 'react';
import Link from 'next/link';

// Simple SVG Icons to replace "ugly" emojis
const IconSync = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
);
const IconGlobe = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
);
const IconShield = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);
const IconPalette = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.6 1.5-1.5 0-.4-.1-.7-.4-1-.3-.3-.5-.8-.5-1.3 0-1 1-1.5 1.5-1.5h1.9c3 0 5-2 5-5 0-5.2-4.5-9-10-9z"/></svg>
);

export function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-3xl font-black tracking-tighter grotesque-heading">callme</span>
        </Link>
        <div className="hidden lg:flex items-center space-x-12">
          <Link href="#features" className="text-[13px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">Features</Link>
          <Link href="#future" className="text-[13px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">The Future</Link>
          <Link href="#pricing" className="text-[13px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">Pricing</Link>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="/login" className="text-[13px] font-black uppercase tracking-widest text-slate-900">Sign In</Link>
          <Link href="/login" className="btn-pill btn-pill-primary text-sm">Get Started</Link>
        </div>
      </div>
    </nav>
  );
}

export function LandingHero() {
  return (
    <section className="pt-52 pb-32 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-black uppercase tracking-widest text-blue-600 mb-10">
          The scheduling standard for 2026
        </div>
        <h1 className="text-7xl md:text-[140px] leading-[0.85] mb-12 grotesque-heading max-w-6xl mx-auto">
          BOOKING <br />
          <span className="text-blue-600">EVOLVED.</span>
        </h1>
        <p className="text-2xl md:text-3xl text-slate-500 mb-16 max-w-2xl mx-auto font-medium leading-tight text-center">
          A high-fidelity tool for professionals who value time over noise. 
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <Link href="/login" className="btn-pill btn-pill-primary px-12 py-6 text-xl">Start for Free</Link>
          <Link href="#features" className="btn-pill btn-pill-outline px-12 py-6 text-xl">See the Engine</Link>
        </div>
      </div>
      
      {/* High-Fidelity CSS Mockup with Actual Labels */}
      <div className="mt-32 relative max-w-5xl mx-auto px-6">
        <div className="floating-ui max-h-[520px] aspect-[16/9] bg-white rounded-[40px] shadow-[0_100px_200px_-50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden flex flex-col">
           <div className="ui-mock-header px-6 bg-slate-50/50">
              <div className="flex space-x-2 mr-8">
                <div className="ui-mock-dot bg-red-400"></div>
                <div className="ui-mock-dot bg-amber-400"></div>
                <div className="ui-mock-dot bg-emerald-400"></div>
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">callme.com/dashboard/calendar</div>
           </div>
           <div className="flex flex-1 overflow-hidden">
              <div className="ui-mock-side w-56 p-6 space-y-6 border-r border-slate-50">
                 <div className="h-10 w-full bg-blue-600 rounded-xl mb-8 flex items-center px-4">
                    <div className="h-1.5 w-12 bg-white/30 rounded"></div>
                 </div>
                 <div className="space-y-4">
                    {['Overview', 'Events', 'Workflows', 'Settings'].map(t => (
                      <div key={t} className="flex items-center space-x-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                         <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t}</div>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="ui-mock-content bg-slate-50/30 flex-1 p-8">
                 <div className="bg-white rounded-[32px] p-8 shadow-2xl shadow-blue-500/5 border border-slate-100 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                      <div className="text-sm font-black grotesque-heading tracking-tight">March 2026</div>
                      <div className="flex space-x-2">
                         <div className="px-3 py-1 bg-slate-50 text-[10px] font-bold rounded-lg border border-slate-100">Week</div>
                         <div className="px-3 py-1 bg-blue-600 text-[10px] font-bold text-white rounded-lg">Month</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5 flex-1 overflow-hidden">
                       {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
                         <div key={d} className="text-[9px] font-black text-slate-300 text-center mb-2">{d}</div>
                       ))}
                       {Array.from({length: 35}).map((_, i) => (
                         <div key={i} className={`rounded-xl border ${i === 11 ? 'border-blue-600 bg-blue-50/50 shadow-inner' : 'border-slate-50'} p-1.5 relative overflow-hidden flex flex-col items-center justify-center`}>
                            <div className={`text-[9px] font-bold ${i === 11 ? 'text-blue-600' : 'text-slate-200'}`}>{i + 1}</div>
                            {i === 11 && (
                              <div className="mt-1 w-full px-1">
                                <div className="h-1.5 w-full bg-blue-600 rounded-[2px] shadow-sm"></div>
                              </div>
                            )}
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-400/5 blur-[120px] pointer-events-none -z-10"></div>
      </div>
    </section>
  );
}

export function BentoFeatures() {
  return (
    <section id="features" className="py-44">
      <div className="container mx-auto px-6">
        <div className="mb-24 max-w-3xl">
          <h2 className="text-5xl md:text-7xl font-black grotesque-heading mb-8">BUILT FOR <br /> PERFORMANCE.</h2>
          <p className="text-2xl text-slate-500 font-medium leading-tight">We've stripped away the clutter to give you the most efficient booking experience on the planet.</p>
        </div>
        
        <div className="bento-grid">
          {/* Card 1: Multi-Calendar Sync - LONG */}
          <div className="bento-card col-span-8 group hover:border-blue-200">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="md:w-1/2 relative z-10">
                <div className="icon-box"><IconSync /></div>
                <h3 className="text-4xl font-black grotesque-heading mb-6">Atomic Multi-Sync</h3>
                <p className="text-xl text-slate-500 font-medium leading-relaxed">
                  Synchronize availability across Google, Outlook, and iCloud simultaneously. Mathematically avoid any double bookings.
                </p>
              </div>
              <div className="md:w-1/2 w-full aspect-square bg-slate-50 rounded-3xl border border-slate-100 p-8 flex items-center justify-center relative overflow-hidden backdrop-blur-sm">
                 {['Outlook', 'Google', 'iCloud'].map((id, i) => (
                   <div key={id} className="absolute w-[85%] aspect-square bg-white border border-slate-100 rounded-3xl shadow-[0_50px_100px_rgba(0,0,0,0.06)]" style={{ transform: `translate(${i*30}px, ${-i*30}px)`, zIndex: i }}>
                      <div className="p-4 border-b border-slate-50 flex justify-between items-center">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">{id}</div>
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className={`h-12 w-full rounded-2xl ${i === 2 ? 'bg-blue-600 shadow-xl shadow-blue-500/30' : 'bg-slate-50'} flex items-center px-4`}>
                           <div className={`h-1.5 w-24 rounded-full ${i === 2 ? 'bg-white/20' : 'bg-slate-100'}`}></div>
                        </div>
                        <div className="h-6 w-3/4 bg-slate-50 rounded-xl"></div>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>
          
          {/* Card 2: Global Time Intelligence - SMALL */}
          <div className="bento-card col-span-4 bg-blue-700 text-white border-0 !bg-blue-700">
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex-1">
                <div className="icon-box bg-white/20 text-white"><IconGlobe /></div>
                <h3 className="text-3xl font-black grotesque-heading mb-6 tracking-tight">Global Time <br />Intelligence</h3>
                <p className="text-lg opacity-90 font-medium leading-relaxed mb-6">
                  Every global offset, automatically synced.
                </p>
              </div>
              <div className="space-y-3 mt-auto">
                 {[
                   {city: 'London', time: '10:00 AM'},
                   {city: 'New York', time: '5:00 AM'},
                   {city: 'Tokyo', time: '6:00 PM'}
                 ].map(t => (
                   <div key={t.city} className="flex justify-between items-center px-4 py-3 bg-white/10 rounded-2xl border border-white/10">
                      <span className="text-[10px] font-black tracking-widest uppercase">{t.city}</span>
                      <span className="text-[10px] font-black tracking-widest uppercase opacity-70">{t.time}</span>
                   </div>
                 ))}
              </div>
            </div>
          </div>
          
          {/* Card 3: Strict Account Isolation - SMALL */}
          <div className="bento-card col-span-4 border-2 border-slate-50 flex flex-col">
            <div className="flex-1">
              <div className="icon-box"><IconShield /></div>
              <h3 className="text-3xl font-black grotesque-heading mb-6">Strict Account Isolation</h3>
              <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10">
                Zero leakage between business and personal data.
              </p>
            </div>
            <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-4 mt-auto">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal</span>
                  <div className="w-10 h-5 bg-white border border-slate-200 rounded-full flex items-center px-1 shadow-sm"><div className="w-3 h-3 bg-slate-200 rounded-full"></div></div>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Enterprise</span>
                  <div className="w-10 h-5 bg-blue-600 rounded-full flex items-center justify-end px-1 shadow-md shadow-blue-500/20"><div className="w-3 h-3 bg-white rounded-full"></div></div>
               </div>
            </div>
          </div>

          
          {/* Card 4: Pro Branding - LONG */}
          <div className="bento-card col-span-8 group">
            <div className="flex flex-col md:flex-row gap-12 items-center h-full">
               <div className="md:w-1/2">
                <div className="icon-box"><IconPalette /></div>
                <h3 className="text-4xl font-black grotesque-heading mb-6">High-Fidelity Branding</h3>
                <p className="text-xl text-slate-500 font-medium leading-relaxed">
                  Your link, your brand. Custom domains, personalized colors, and a clean interface.
                </p>
               </div>
               <div className="md:w-1/2 w-full h-full min-h-[300px] bg-slate-50 rounded-3xl border border-slate-100 p-12 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 text-[10px] font-black uppercase tracking-widest text-slate-200">Theme Config</div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Primary Accent</div>
                    <div className="h-6 w-12 bg-blue-100 rounded-full flex items-center justify-end px-1 border border-blue-200"><div className="w-4 h-4 bg-blue-600 rounded-full"></div></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-14 w-full bg-white rounded-2xl shadow-sm border border-slate-50 flex items-center px-6">
                        <div className="h-1.5 w-32 bg-slate-100 rounded-full"></div>
                    </div>
                    <div className="h-14 w-full bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 border border-blue-600 flex items-center px-6">
                        <div className="h-1.5 w-48 bg-white/40 rounded-full"></div>
                    </div>
                  </div>
                  <div className="mt-10 flex space-x-4">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-10 w-10 rounded-2xl ${i === 1 ? 'bg-blue-600 shadow-xl ring-4 ring-blue-100' : i === 2 ? 'bg-slate-900' : i === 3 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FutureShowcase() {
  const futureItems = [
    {
      title: "AI Meeting Transcripts",
      desc: "Forget manual notes. Our integrated AI records your sessions and automatically sends high-fidelity transcripts and action items to every participant the moment the call ends.",
      img: "/feature_transcripts.png",
      badge: "Summer 2026"
    },
    {
      title: "Boutique & Barber Shop Suite",
      desc: "A dedicated operating system for service industries. Handle slot bookings, capacity management, and automatic invoicing for high-end boutique stores and barbershops.",
      img: "/feature_boutique.png",
      badge: "In Development"
    },
    {
      title: "Group Calls & Webinars",
      desc: "Scale your reach. Manage hundreds of participants with ease, integrated waitlists, and instant file sharing during group sessions.",
      img: "/feature_groupcalls.png",
      badge: "Q3 2026"
    }
  ];

  return (
    <section id="future" className="py-44 bg-black text-white rounded-[60px] mx-6">
      <div className="container mx-auto px-6">
        <div className="mb-32 text-center">
          <div className="upcoming-badge mb-8 inline-block">The Roadmap</div>
          <h2 className="text-6xl md:text-[100px] font-black grotesque-heading mb-12">WHAT'S NEXT.</h2>
          <p className="text-2xl text-slate-400 max-w-3xl mx-auto font-medium leading-tight">
            We aren't just building a calendar. We're building the future of how people coordinate value.
          </p>
        </div>

        <div className="space-y-44">
          {futureItems.map((item, i) => (
            <div key={i} className={`flex flex-col lg:flex-row gap-20 items-center ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
              <div className="lg:w-1/2">
                <div className="bg-blue-600/20 text-blue-400 text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full inline-block mb-8 border border-blue-400/20">
                  {item.badge}
                </div>
                <h3 className="text-5xl md:text-7xl font-black grotesque-heading mb-8">{item.title}</h3>
                <p className="text-2xl text-slate-400 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="lg:w-1/2 w-full aspect-video bg-white/5 rounded-[40px] border border-white/10 overflow-hidden relative group">
                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="py-44">
      <div className="container mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-black grotesque-heading mb-8">PRICING.</h2>
          <p className="text-2xl text-slate-500 font-medium">Simple, honest, and early.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bento-card border-2 border-blue-600">
             <div className="upcoming-badge mb-6 inline-block">Early Adopter</div>
             <div className="text-6xl font-black mb-10">$0<span className="text-xl text-slate-400">/mo</span></div>
             <p className="text-xl text-slate-900 font-black mb-8">Free focus for life.</p>
             <ul className="space-y-6 mb-12 text-slate-500 font-bold text-sm uppercase tracking-widest">
                <li>Unlimited Single Links</li>
                <li>Google Calendar Sync</li>
                <li>Email Notifications</li>
             </ul>
             <Link href="/login" className="btn-pill btn-pill-primary w-full py-6">Join the Beta</Link>
          </div>
          
          <div className="bento-card bg-slate-100 opacity-60">
             <div className="upcoming-badge mb-6 inline-block">Coming Soon</div>
             <div className="text-6xl font-black mb-10">TBA</div>
             <p className="text-xl text-slate-400 font-black mb-8">Professional Grade.</p>
             <ul className="space-y-6 mb-12 text-slate-400 font-bold text-sm uppercase tracking-widest">
                <li>AI Meeting Transcripts</li>
                <li>Webinar Capacity</li>
                <li>Custom Domains</li>
                <li>Boutique Invoicing</li>
             </ul>
             <button disabled className="btn-pill btn-pill-outline w-full py-6 cursor-not-allowed">Stay Notified</button>
          </div>
        </div>
      </div>
    </section>
  );
}




