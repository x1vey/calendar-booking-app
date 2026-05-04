import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import Razorpay from 'razorpay';

export async function POST(request: NextRequest) {
  try {
    const { calendarId, provider, bookerName, bookerEmail, bookingId } = await request.json(); // provider: 'stripe' | 'paypal' | 'razorpay'

    if (!calendarId || !provider || !bookingId) {
      return NextResponse.json({ error: 'Calendar ID, bookingId, and provider are required' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Get calendar pricing details
    const { data: calendar, error: calError } = await supabase
      .from('calendars')
      .select('price, currency, user_id, require_payment, name, slug')
      .eq('id', calendarId)
      .single();

    if (calError || !calendar) {
      return NextResponse.json({ error: 'Calendar not found' }, { status: 404 });
    }

    if (!calendar.require_payment) {
      return NextResponse.json({ error: 'This calendar does not require payment' }, { status: 400 });
    }

    // 2. Get user's payment keys
    const { data: settings, error: setError } = await supabase
      .from('user_settings')
      .select('stripe_secret_key, paypal_client_id, paypal_secret, razorpay_key_id, razorpay_key_secret')
      .eq('user_id', calendar.user_id)
      .single();

    // 3. Create Intent/Session based on the provider
    if (provider === 'stripe') {
      const stripeKey = settings?.stripe_secret_key || process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        return NextResponse.json({ error: 'Stripe is not configured' }, { status: 400 });
      }
      
      const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' as any });
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: calendar.currency.toLowerCase(),
            product_data: {
              name: `Booking: ${calendar.name}`,
              description: `Meeting with ${bookerName} (${bookerEmail})`
            },
            unit_amount: Math.round(calendar.price * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        metadata: { bookingId },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${calendar.slug}/confirmed?id=${bookingId}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${calendar.slug}`,
      });
      
      return NextResponse.json({ 
        provider: 'stripe',
        url: session.url
      });
      
    } else if (provider === 'paypal') {
      const clientId = settings?.paypal_client_id || process.env.PAYPAL_CLIENT_ID;
      const secret = settings?.paypal_secret || process.env.PAYPAL_SECRET;
      
      if (!clientId || !secret) {
        return NextResponse.json({ error: 'PayPal is not configured' }, { status: 400 });
      }

      // Generate PayPal Access Token
      const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');
      const tokenRes = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });
      const tokenData = await tokenRes.json();

      // Create Order
      const orderRes = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: calendar.currency.toUpperCase(),
              value: calendar.price.toFixed(2)
            },
            description: `Booking: ${calendar.name}`,
            custom_id: bookingId
          }],
          application_context: {
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${calendar.slug}/confirmed?id=${bookingId}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${calendar.slug}`
          }
        })
      });
      const orderData = await orderRes.json();
      
      const approveLink = orderData.links?.find((l: any) => l.rel === 'approve')?.href;

      return NextResponse.json({
        provider: 'paypal',
        url: approveLink,
        orderId: orderData.id
      });

    } else if (provider === 'razorpay') {
      const keyId = settings?.razorpay_key_id || process.env.RAZORPAY_KEY_ID;
      const keySecret = settings?.razorpay_key_secret || process.env.RAZORPAY_KEY_SECRET;

      if (!keyId || !keySecret) {
        return NextResponse.json({ error: 'Razorpay is not configured' }, { status: 400 });
      }

      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const order = await razorpay.orders.create({
        amount: Math.round(calendar.price * 100), // amount in paise
        currency: calendar.currency.toUpperCase(),
        receipt: `receipt_${bookingId.substring(0,20)}`,
        notes: { bookingId }
      });
      
      return NextResponse.json({
        provider: 'razorpay',
        orderId: order.id,
        keyId: keyId,
        amount: calendar.price,
        currency: calendar.currency,
        name: calendar.name
      });
    }

    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });

  } catch (error: any) {
    console.error('Payment intent error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
