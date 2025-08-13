import { NextRequest, NextResponse } from 'next/server';
import { getAmadeusToken } from '../../lib/amadeus';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');

    if (!keyword || keyword.length < 2) {
      return NextResponse.json({ data: [] });
    }

    // Get access token from shared service
    const accessToken = await getAmadeusToken();

    // Search for airports using the correct endpoint
    const airportSearchUrl = new URL('https://test.api.amadeus.com/v1/reference-data/locations');
    airportSearchUrl.searchParams.append('keyword', keyword);
    airportSearchUrl.searchParams.append('subType', 'AIRPORT');
    airportSearchUrl.searchParams.append('page[limit]', '10');
    airportSearchUrl.searchParams.append('page[offset]', '0');
    airportSearchUrl.searchParams.append('sort', 'analytics.travelers.score');
    airportSearchUrl.searchParams.append('view', 'FULL');

    const airportResponse = await fetch(airportSearchUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!airportResponse.ok) {
      const errorText = await airportResponse.text();
      console.error('Airport API error:', airportResponse.status, errorText);
      
      // If it's a 400 error, it might be an invalid keyword, return empty results
      if (airportResponse.status === 400) {
        return NextResponse.json({ data: [] });
      }
      
      throw new Error(`Airport API returned ${airportResponse.status}`);
    }

    const airportData = await airportResponse.json();
    
    // Ensure we always return data in the expected format
    return NextResponse.json({
      data: airportData.data || []
    });

  } catch (error) {
    console.error('Airport search error:', error);
    return NextResponse.json(
      { error: 'Failed to search airports' },
      { status: 500 }
    );
  }
}