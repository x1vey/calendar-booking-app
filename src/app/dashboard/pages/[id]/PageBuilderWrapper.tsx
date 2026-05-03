'use client';

import React, { useState } from 'react';
import { Calendar } from '@/lib/types';
import LandingPageBuilder from '@/components/landing-builder/LandingPageBuilder';

export default function PageBuilderWrapper({ initialCalendar }: { initialCalendar: Calendar }) {
  const [calendar, setCalendar] = useState<Calendar>(initialCalendar);

  return (
    <LandingPageBuilder 
      calendar={calendar} 
      onUpdate={(updatedCalendar) => setCalendar(updatedCalendar)} 
    />
  );
}
