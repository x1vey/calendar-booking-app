import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { calendarId, provider } = await request.json(); // provider: 'stripe' | 'paypal' | 'razorpay'

    if (!calendarId || !provider) {
      return NextResponse.json({ error: 'Calendar ID and provider are required' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Get calendar pricing details
    const { data: calendar, error: calError } = await supabase
      .from('calendars')
      .select('price, currency, user_id, require_payment')
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

    if (setError || !settings) {
      return NextResponse.json({ error: 'Provider settings not configured by the owner' }, { status: 400 });
    }

    // 3. Create Intent/Session based on the provider
    if (provider === 'stripe') {
      if (!settings.stripe_secret_key) {
        return NextResponse.json({ error: 'Stripe is not configured' }, { status: 400 });
      }
      
      // TODO: Use official stripe sdk here
      // const stripe = require('stripe')(settings.stripe_secret_key);
      // const paymentIntent = await stripe.paymentIntents.create({
      //   amount: Math.round(calendar.price * 100), // cents
      //   currency: calendar.currency.toLowerCase(),
      // });
      
      return NextResponse.json({ 
        provider: 'stripe',
        clientSecret: 'pi_mock_secret_12345', // Replace with paymentIntent.client_secret
        amount: calendar.price,
        currency: calendar.currency
      });
      
    } else if (provider === 'paypal') {
      if (!settings.paypal_client_id || !settings.paypal_secret) {
        return NextResponse.json({ error: 'PayPal is not configured' }, { status: 400 });
      }

      // TODO: Call PayPal REST API to create an order
      
      return NextResponse.json({
        provider: 'paypal',
        orderId: 'mock_paypal_order_12345',
        clientId: settings.paypal_client_id,
        amount: calendar.price,
        currency: calendar.currency
      });

    } else if (provider === 'razorpay') {
      if (!settings.razorpay_key_id || !settings.razorpay_key_secret) {
        return NextResponse.json({ error: 'Razorpay is not configured' }, { status: 400 });
      }

      // TODO: Use Razorpay SDK to create an order
      
      return NextResponse.json({
        provider: 'razorpay',
        orderId: 'mock_razorpay_order_12345',
        keyId: settings.razorpay_key_id,
        amount: calendar.price,
        currency: calendar.currency
      });
    }

    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });

  } catch (error: any) {
    console.error('Payment intent error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
