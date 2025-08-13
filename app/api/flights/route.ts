import { NextRequest, NextResponse } from 'next/server';

interface FlightSearchParams {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    passengers: number;
}

export async function POST(request: NextRequest) {
    try {
        const { origin, destination, departureDate, returnDate, passengers }: FlightSearchParams = await request.json();

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

        // Search for flights
        const flightSearchUrl = new URL('https://test.api.amadeus.com/v2/shopping/flight-offers');
        flightSearchUrl.searchParams.append('originLocationCode', origin);
        flightSearchUrl.searchParams.append('destinationLocationCode', destination);
        flightSearchUrl.searchParams.append('departureDate', departureDate);
        if (returnDate) {
            flightSearchUrl.searchParams.append('returnDate', returnDate);
        }
        flightSearchUrl.searchParams.append('adults', passengers.toString());
        flightSearchUrl.searchParams.append('max', '10');

        const flightResponse = await fetch(flightSearchUrl.toString(), {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!flightResponse.ok) {
            throw new Error('Failed to search flights');
        }

        const flightData = await flightResponse.json();
        return NextResponse.json(flightData);

    } catch (error) {
        console.error('Flight search error:', error);
        return NextResponse.json(
            { error: 'Failed to search flights' },
            { status: 500 }
        );
    }
}