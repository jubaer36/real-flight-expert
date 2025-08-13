import { NextRequest, NextResponse } from 'next/server';

// Fallback airport data for common searches
const fallbackAirports = [
  { id: 'DAC', name: 'Hazrat Shahjalal International Airport', iataCode: 'DAC', address: { cityName: 'Dhaka', countryName: 'Bangladesh' }, subType: 'AIRPORT' },
  { id: 'DEL', name: 'Indira Gandhi International Airport', iataCode: 'DEL', address: { cityName: 'New Delhi', countryName: 'India' }, subType: 'AIRPORT' },
  { id: 'JFK', name: 'John F Kennedy International Airport', iataCode: 'JFK', address: { cityName: 'New York', countryName: 'United States' }, subType: 'AIRPORT' },
  { id: 'LHR', name: 'London Heathrow Airport', iataCode: 'LHR', address: { cityName: 'London', countryName: 'United Kingdom' }, subType: 'AIRPORT' },
  { id: 'CDG', name: 'Charles de Gaulle Airport', iataCode: 'CDG', address: { cityName: 'Paris', countryName: 'France' }, subType: 'AIRPORT' },
  { id: 'DXB', name: 'Dubai International Airport', iataCode: 'DXB', address: { cityName: 'Dubai', countryName: 'United Arab Emirates' }, subType: 'AIRPORT' },
  { id: 'LAX', name: 'Los Angeles International Airport', iataCode: 'LAX', address: { cityName: 'Los Angeles', countryName: 'United States' }, subType: 'AIRPORT' },
  { id: 'SIN', name: 'Singapore Changi Airport', iataCode: 'SIN', address: { cityName: 'Singapore', countryName: 'Singapore' }, subType: 'AIRPORT' },
  { id: 'BOM', name: 'Chhatrapati Shivaji International Airport', iataCode: 'BOM', address: { cityName: 'Mumbai', countryName: 'India' }, subType: 'AIRPORT' },
  { id: 'BKK', name: 'Suvarnabhumi Airport', iataCode: 'BKK', address: { cityName: 'Bangkok', countryName: 'Thailand' }, subType: 'AIRPORT' }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');

    if (!keyword || keyword.length < 2) {
      return NextResponse.json({ data: [] });
    }

    // First check fallback airports
    const fallbackResults = fallbackAirports.filter(airport => 
      airport.name.toLowerCase().includes(keyword.toLowerCase()) ||
      airport.iataCode.toLowerCase().includes(keyword.toLowerCase()) ||
      airport.address.cityName.toLowerCase().includes(keyword.toLowerCase())
    );

    if (fallbackResults.length > 0) {
      return NextResponse.json({ data: fallbackResults });
    }

    // Get access token from Amadeus
    const tokenResponse = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.AMADEUS_API_KEY!,
        client_secret: process.env.AMADEUS_API_SECRET!,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Search for airports
    const airportSearchUrl = new URL('https://test.api.amadeus.com/v1/reference-data/locations');
    airportSearchUrl.searchParams.append('keyword', keyword);
    airportSearchUrl.searchParams.append('subType', 'AIRPORT,CITY');
    airportSearchUrl.searchParams.append('page[limit]', '10');

    const airportResponse = await fetch(airportSearchUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!airportResponse.ok) {
      const errorText = await airportResponse.text();
      console.error('Airport API error:', errorText);
      // Return empty results instead of throwing error
      return NextResponse.json({ data: [] });
    }

    const airportData = await airportResponse.json();
    return NextResponse.json(airportData);

  } catch (error) {
    console.error('Airport search error:', error);
    return NextResponse.json(
      { error: 'Failed to search airports' },
      { status: 500 }
    );
  }
}