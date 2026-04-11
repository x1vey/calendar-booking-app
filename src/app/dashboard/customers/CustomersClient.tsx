'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function CustomersClient({ initialCustomers }: { initialCustomers: any[] }) {
  
  const handleExportCSV = () => {
    // 1. Create CSV headers
    const headers = ['Name', 'Email', 'Total Bookings', 'Latest Booking Date'];
    
    // 2. Map data to rows
    const rows = initialCustomers.map(customer => {
      const date = new Date(customer.latest_booking).toLocaleDateString();
      return [
        `"${customer.name.replace(/"/g, '""')}"`, // escape quotes
        customer.email,
        customer.total_bookings,
        date
      ].join(',');
    });

    // 3. Combine headers and rows
    const csvContent = [headers.join(','), ...rows].join('\n');

    // 4. Create Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customers</h1>
          <p className="mt-1 text-sm text-slate-500">A unified directory of everyone who has booked with you.</p>
        </div>
        <Button onClick={handleExportCSV} disabled={initialCustomers.length === 0}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Export CSV
        </Button>
      </div>

      {initialCustomers.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No customers yet</h3>
          <p className="text-slate-500 text-sm">Once you start receiving successful bookings, they will appear here.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Email Address</th>
                  <th className="px-6 py-3 text-center">Total Bookings</th>
                  <th className="px-6 py-3 text-right">Most Recent Booking</th>
                </tr>
              </thead>
              <tbody>
                {initialCustomers.map((customer, idx) => (
                  <tr key={idx} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-indigo-600">
                      <span className="bg-indigo-50 px-2.5 py-0.5 rounded-full">
                        {customer.total_bookings}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {new Date(customer.latest_booking).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
