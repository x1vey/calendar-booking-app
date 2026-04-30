'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Calendar } from '@/lib/types';

export default function LandingPageEditor({ calendar, onUpdate }: { calendar: Calendar, onUpdate: (c: Calendar) => void }) {
  const [formData, setFormData] = useState({
    landing_page_enabled: calendar.landing_page_enabled ?? true,
    hide_branding: calendar.hide_branding ?? false,
    heading_text: calendar.heading_text || '',
    subheading_text: calendar.subheading_text || '',
    hero_image_url: calendar.hero_image_url || '',
    theme_bg_color: calendar.theme_bg_color || '#f8fafc',
    theme_text_color: calendar.theme_text_color || '#0f172a',
    theme_heading_color: calendar.theme_heading_color || '#0f172a',
    theme_subheading_color: calendar.theme_subheading_color || '#64748b',
    cta_button_text: calendar.cta_button_text || 'Book Now',
    expectations_headline: calendar.expectations_headline || '',
    expectations_body: calendar.expectations_body || '',
    youtube_video_url: calendar.youtube_video_url || '',
    testimonial_headline: calendar.testimonial_headline || '',
    testimonial_video_url: (calendar.testimonial_videos && calendar.testimonial_videos.length > 0) ? calendar.testimonial_videos[0] : '',
    google_place_id: calendar.google_place_id || '',
    privacy_url: calendar.privacy_url || '',
    terms_url: calendar.terms_url || '',
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Map the single URL field back to the array structure for the database
    // Remove the UI-only field so Supabase doesn't error out on unknown columns
    const { testimonial_video_url, ...dbData } = formData;
    const updatePayload = {
      ...dbData,
      testimonial_videos: testimonial_video_url ? [testimonial_video_url] : []
    };

    try {
      const res = await fetch(`/api/admin/calendars/${calendar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });
      if (!res.ok) throw new Error('Failed to update landing page settings');
      onUpdate({ ...calendar, ...updatePayload });
      alert('Landing page saved!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-8">
        <form onSubmit={handleSave} className="space-y-8">
          
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
             <div className="space-y-1">
               <h3 className="text-lg font-semibold text-slate-900">Enable Landing Page</h3>
               <p className="text-sm text-slate-500">Toggle whether clients see the full landing page or just the booking form.</p>
             </div>
             <input
              type="checkbox"
              checked={formData.landing_page_enabled}
              onChange={(e) => setFormData({ ...formData, landing_page_enabled: e.target.checked })}
              className="w-6 h-6 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 cursor-pointer"
             />
          </div>

          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
             <div className="space-y-1">
               <h3 className="text-lg font-semibold text-slate-900">Hide "Powered by Call Me"</h3>
               <p className="text-sm text-slate-500">Remove the branding mark from the bottom of your booking page.</p>
             </div>
             <input
              type="checkbox"
              checked={formData.hide_branding}
              onChange={(e) => setFormData({ ...formData, hide_branding: e.target.checked })}
              className="w-6 h-6 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 cursor-pointer"
             />
          </div>

          <div className="pt-6 space-y-1">
            <h3 className="text-lg font-semibold text-slate-900">Theme & Atmosphere</h3>
            <p className="text-sm text-slate-500">Customize the visual aesthetic of your booking page.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Background</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={formData.theme_bg_color} onChange={(e) => setFormData({ ...formData, theme_bg_color: e.target.value })} className="w-8 h-8 rounded border-none cursor-pointer" />
                  <span className="text-xs font-mono">{formData.theme_bg_color}</span>
                </div>
             </div>
             <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">General Text</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={formData.theme_text_color} onChange={(e) => setFormData({ ...formData, theme_text_color: e.target.value })} className="w-8 h-8 rounded border-none cursor-pointer" />
                  <span className="text-xs font-mono">{formData.theme_text_color}</span>
                </div>
             </div>
             <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Headings</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={formData.theme_heading_color} onChange={(e) => setFormData({ ...formData, theme_heading_color: e.target.value })} className="w-8 h-8 rounded border-none cursor-pointer" />
                  <span className="text-xs font-mono">{formData.theme_heading_color}</span>
                </div>
             </div>
             <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Accents</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={formData.theme_subheading_color} onChange={(e) => setFormData({ ...formData, theme_subheading_color: e.target.value })} className="w-8 h-8 rounded border-none cursor-pointer" />
                  <span className="text-xs font-mono">{formData.theme_subheading_color}</span>
                </div>
             </div>
          </div>

          <div className="pt-6 border-t space-y-1">
            <h3 className="text-lg font-semibold text-slate-900">Hero Section</h3>
            <p className="text-sm text-slate-500">The first thing clients see when they visit your page.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Headline Text" 
              placeholder={calendar.name}
              value={formData.heading_text}
              onChange={(e) => setFormData({ ...formData, heading_text: e.target.value })}
            />
            <Input 
              label="Subheadline Text" 
              placeholder="A short description under the headline"
              value={formData.subheading_text}
              onChange={(e) => setFormData({ ...formData, subheading_text: e.target.value })}
            />
            <Input 
              label="Hero Image URL" 
              placeholder="https://images.unsplash.com/..."
              value={formData.hero_image_url}
              onChange={(e) => setFormData({ ...formData, hero_image_url: e.target.value })}
            />
            <Input 
              label="CTA Button Text" 
              placeholder="e.g. Book Now"
              value={formData.cta_button_text}
              onChange={(e) => setFormData({ ...formData, cta_button_text: e.target.value })}
            />
          </div>

          <div className="pt-6 border-t space-y-1">
            <h3 className="text-lg font-semibold text-slate-900">Expectations</h3>
            <p className="text-sm text-slate-500">A brief text section describing what to expect from the call.</p>
          </div>
          <div className="grid grid-cols-1 gap-6">
             <Input 
               label="Expectations Headline" 
               placeholder="e.g. What to expect"
               value={formData.expectations_headline}
               onChange={(e) => setFormData({ ...formData, expectations_headline: e.target.value })}
               maxLength={100}
             />
             <div className="space-y-1.5">
               <label className="text-sm font-medium text-slate-700">Expectations Body</label>
               <textarea
                 className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                 placeholder="1. We will review your goals..."
                 rows={3}
                 maxLength={500}
                 value={formData.expectations_body}
                 onChange={(e) => setFormData({ ...formData, expectations_body: e.target.value })}
               />
             </div>
          </div>

          <div className="pt-6 border-t space-y-1">
            <h3 className="text-lg font-semibold text-slate-900">Media Embeds</h3>
            <p className="text-sm text-slate-500">Embed a YouTube video or short on your booking page.</p>
          </div>

          <Input 
            label="Main YouTube Video URL (VSL)" 
            placeholder="https://youtube.com/watch?v=..."
            value={formData.youtube_video_url}
            onChange={(e) => setFormData({ ...formData, youtube_video_url: e.target.value })}
          />

          <div className="space-y-4 pt-4">
            <Input 
              label="Video Testimonial Headline" 
              placeholder="e.g. Client Results"
              value={formData.testimonial_headline}
              onChange={(e) => setFormData({ ...formData, testimonial_headline: e.target.value })}
              maxLength={100}
            />
            <Input 
              label="Video Testimonial URL (YouTube)" 
              placeholder="Paste YouTube Short or Video URL"
              value={formData.testimonial_video_url}
              onChange={(e) => setFormData({ ...formData, testimonial_video_url: e.target.value })}
            />
          </div>

          <div className="pt-6 border-t space-y-1">
            <h3 className="text-lg font-semibold text-slate-900">Social Proof & Legal</h3>
            <p className="text-sm text-slate-500">Trust signals and required links.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Google Place ID (for Native Reviews)" 
              placeholder="ChIJN1t_tDeuEmsRUte97-0ogqc"
              value={formData.google_place_id}
              onChange={(e) => setFormData({ ...formData, google_place_id: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Privacy Policy URL" 
                placeholder="https://..."
                value={formData.privacy_url}
                onChange={(e) => setFormData({ ...formData, privacy_url: e.target.value })}
              />
              <Input 
                label="Terms & Conditions URL" 
                placeholder="https://..."
                value={formData.terms_url}
                onChange={(e) => setFormData({ ...formData, terms_url: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-8 border-t flex justify-end">
            <Button type="submit" disabled={saving} className="btn-pill px-10 h-12 text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-600/30">
              {saving ? 'Saving...' : 'Save Landing Page'}
            </Button>
          </div>
        </form>
      </Card>
      
      <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
        <p className="text-xs text-blue-600 font-bold leading-relaxed">
          <span className="uppercase tracking-widest mr-2">Note:</span> 
          Visual changes will be reflected immediately on your public booking page once saved. 
          Make sure your Google Place ID is correct to see reviews.
        </p>
      </div>
    </div>
  );
}
