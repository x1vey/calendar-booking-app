import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ placeId: string }> }
) {
  const { placeId } = await params;
  
  if (!placeId) {
    return NextResponse.json({ error: 'Place ID is required' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Google Places API Key not configured' }, { status: 500 });
  }

  try {
    const url = `https://places.googleapis.com/v1/places/${placeId}?fields=displayName,reviews,rating,userRatingCount&key=${apiKey}`;
    
    const res = await fetch(url);
    if (!res.ok) {
      const errorData = await res.json();
      console.error('Google Places API Error:', errorData);
      throw new Error('Failed to fetch from Google Places API');
    }

    const data = await res.json();
    
    // Format the response to be cleaner for the frontend
    const payload = {
      placeName: data.displayName?.text || 'Google Reviews',
      rating: data.rating || 0,
      totalRatings: data.userRatingCount || 0,
      reviews: (data.reviews || []).map((r: any) => ({
        authorName: r.authorAttribution?.displayName || 'Google User',
        authorPhoto: r.authorAttribution?.photoUri || '',
        relativePublishTimeDescription: r.relativePublishTimeDescription || '',
        rating: r.rating || 5,
        text: r.text?.text || '',
      })).slice(0, 5) // Send max 5 reviews 
    };

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to retrieve reviews' }, { status: 500 });
  }
}
