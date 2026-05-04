import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { resolveCredentials } from '@/lib/resolve-credentials';
import { sendBookingEmail } from '@/lib/mail';
import Stripe from 'stripe';
import Razorpay from 'razorpay';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, sessionId, paymentId, token } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Fetch booking and calendar
    const { data: booking, error: bookError } = await supabase
      .from('bookings')
      .select('*, calendars(*)')
      .eq('id', bookingId)
      .single();

    if (bookError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.payment_status === 'paid') {
      return NextResponse.json({ success: true, alreadyPaid: true });
    }

    const calendar = booking.calendars;

    // 2. Fetch User Settings
    const { data: settings } = await supabase
      .from('user_settings')
      .select('stripe_secret_key, paypal_client_id, paypal_secret, razorpay_key_id, razorpay_key_secret')
      .eq('user_id', calendar.user_id)
      .single();

    let isPaid = false;

    // 3. Verify Payment
    if (sessionId) {
      // Stripe Verification
      const stripeKey = settings?.stripe_secret_key || process.env.STRIPE_SECRET_KEY;
      if (stripeKey) {
        const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' as any });
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === 'paid') {
          isPaid = true;
        }
      }
    } else if (paymentId) {
      // Razorpay Verification
      const keyId = settings?.razorpay_key_id || process.env.RAZORPAY_KEY_ID;
      const keySecret = settings?.razorpay_key_secret || process.env.RAZORPAY_KEY_SECRET;
      if (keyId && keySecret) {
        const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
        const payment = await razorpay.payments.fetch(paymentId);
        if (payment.status === 'captured' || payment.status === 'authorized') {
          isPaid = true;
        }
      }
    } else if (token) {
      // PayPal Verification
      const clientId = settings?.paypal_client_id || process.env.PAYPAL_CLIENT_ID;
      const secret = settings?.paypal_secret || process.env.PAYPAL_SECRET;
      if (clientId && secret) {
        const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');
        const tokenRes = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
          method: 'POST',
          headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'grant_type=client_credentials'
        });
        const tokenData = await tokenRes.json();
        
        // Capture order
        const captureRes = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${token}/capture`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        const captureData = await captureRes.json();
        if (captureData.status === 'COMPLETED') {
          isPaid = true;
        }
      }
    }

    if (!isPaid) {
      return NextResponse.json({ error: 'Payment not verified' }, { status: 400 });
    }

    // 4. Update Booking Status
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_status: 'paid',
        status: 'confirmed'
      })
      .eq('id', bookingId);

    if (updateError) throw updateError;

    // 5. Send Confirmation Emails (since they were deferred)
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/cancel/${booking.cancellation_token}`;
    const rescheduleUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reschedule/${booking.cancellation_token}`;
    
    const { smtpUser, smtpPass } = await resolveCredentials(calendar.id);
    
    try {
      await sendBookingEmail(booking, calendar, 'confirmation', cancelUrl, rescheduleUrl, { smtpUser, smtpPass });
      const alertSent = await sendBookingEmail(booking, calendar, 'user_booking_alert', cancelUrl, rescheduleUrl, { smtpUser, smtpPass });
      if (alertSent) {
        await supabase.from('bookings').update({ alert_user_sent: true }).eq('id', booking.id);
      }
    } catch (e) {
      console.error('Failed to send email after payment', e);
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('Verify error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
