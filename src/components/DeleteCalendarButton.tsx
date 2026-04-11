'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { useRouter } from 'next/navigation';

export default function DeleteCalendarButton({ calendarId }: { calendarId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this calendar? All its bookings and settings will be permanently removed.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/calendars/${calendarId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete calendar');
      }

      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="text-rose-500 hover:text-rose-600 hover:bg-rose-50" 
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </Button>
  );
}
