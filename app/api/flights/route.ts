import { NextRequest, NextResponse } from 'next/server';
import { getAmadeusToken } from '../../lib/amadeus';

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

        // Get access token from shared service
        const accessToken = await getAmadeusToken();

        // Validate input parameters
        if (!origin || !destination || !departureDate) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        // Search for flights using correct parameters
        const flightSearchUrl = new URL('https://test.api.amadeus.com/v2/shopping/flight-offers');
        flightSearchUrl.searchParams.append('originLocationCode', origin.toUpperCase());
        flightSearchUrl.searchParams.append('destinationLocationCode', destination.toUpperCase());
        flightSearchUrl.searchParams.append('departureDate', departureDate);
        if (returnDate) {
            flightSearchUrl.searchParams.append('returnDate', returnDate);
        }
        flightSearchUrl.searchParams.append('adults', passengers.toString());
        flightSearchUrl.searchParams.append('children', '0');
        flightSearchUrl.searchParams.append('infants', '0');
        flightSearchUrl.searchParams.append('travelClass', 'ECONOMY');
        flightSearchUrl.searchParams.append('nonStop', 'false');
        flightSearchUrl.searchParams.append('currencyCode', 'USD');
        flightSearchUrl.searchParams.append('max', '10');

        const flightResponse = await fetch(flightSearchUrl.toString(), {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!flightResponse.ok) {
            const errorText = await flightResponse.text();
            console.error('Flight API error:', flightResponse.status, errorText);

            if (flightResponse.status === 400) {
                return NextResponse.json(
                    { error: 'Invalid search parameters. Please check your airport codes and dates.' },
                    { status: 400 }
                );
            }

            throw new Error(`Flight API returned ${flightResponse.status}`);
        }

        const flightData = await flightResponse.json();

        // Ensure we return data in expected format
        return NextResponse.json({
            data: flightData.data || [],
            meta: flightData.meta || {},
            dictionaries: flightData.dictionaries || {}
        });

    } catch (error) {
        console.error('Flight search error:', error);
        return NextResponse.json(
            { error: 'Failed to search flights' },
            { status: 500 }
        );
    }
}