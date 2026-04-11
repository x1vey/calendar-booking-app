'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Calendar } from '@/lib/types';

interface ShareConfiguratorProps {
  calendar: Calendar;
}

export default function ShareConfigurator({ calendar }: ShareConfiguratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState('');
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');

  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}/book/${calendar.slug}` : '';
  
  const generateUrl = () => {
    if (!baseUrl) return '';
    try {
      const url = new URL(baseUrl);
      if (source) url.searchParams.set('source', source);
      if (utmSource) url.searchParams.set('utm_source', utmSource);
      if (utmMedium) url.searchParams.set('utm_medium', utmMedium);
      if (utmCampaign) url.searchParams.set('utm_campaign', utmCampaign);
      return url.toString();
    } catch (e) {
      return baseUrl;
    }
  };

  const copyToClipboard = () => {
    const url = generateUrl();
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Generate Share Link">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {['instagram', 'facebook', 'youtube', 'twitter'].map(plt => (
                <button
                  key={plt}
                  onClick={() => setSource(plt)}
                  className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-500 hover:bg-indigo-600 hover:text-white rounded-full transition-all border border-slate-200"
                >
                  {plt}
                </button>
              ))}
            </div>

            <Input 
              label="Standard Source" 
              placeholder="e.g. custom-id, email-newsletter"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
            
            <div className="pt-2 border-t border-slate-100">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">UTM Parameters (Advanced)</p>
               <div className="space-y-3">
                  <Input 
                    placeholder="utm_source" 
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                  />
                  <Input 
                    placeholder="utm_medium" 
                    value={utmMedium}
                    onChange={(e) => setUtmMedium(e.target.value)}
                  />
                  <Input 
                    placeholder="utm_campaign" 
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value)}
                  />
               </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 break-all text-xs font-mono text-slate-600">
            {generateUrl()}
          </div>

          <Button className="w-full" onClick={copyToClipboard}>
            Copy Link
          </Button>
        </div>
      </Modal>
    </>
  );
}
