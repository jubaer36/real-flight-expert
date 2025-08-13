'use client';

import { useState } from 'react';
import AutocompleteInput from './components/AutocompleteInput';

interface FlightOffer {
  id: string;
  price: {
    total: string;
    currency: string;
  };
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: {
        iataCode: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        at: string;
      };
      carrierCode: string;
      number: string;
      duration: string;
    }>;
  }>;
}

export default function FlightSearch() {
  const [searchData, setSearchData] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: 1
  });
  
  const [tripType, setTripType] = useState('roundtrip');
  
  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    });
  };

  const handleLocationChange = (field: 'origin' | 'destination', value: string) => {
    setSearchData({
      ...searchData,
      [field]: value
    });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFlights([]);

    try {
      const response = await fetch('/api/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchData),
      });

      if (!response.ok) {
        throw new Error('Failed to search flights');
      }

      const data = await response.json();
      setFlights(data.data || []);
    } catch (err) {
      setError('Failed to search flights. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    if (!match) return duration;
    
    const hours = match[1] ? match[1].replace('H', 'h ') : '';
    const minutes = match[2] ? match[2].replace('M', 'm') : '';
    return `${hours}${minutes}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center">
          <h1 className="text-2xl font-semibold text-blue-600">✈️ Flights</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Trip Type */}
            <div className="flex gap-4 mb-6">
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="tripType" 
                  value="roundtrip" 
                  checked={tripType === 'roundtrip'}
                  onChange={(e) => setTripType(e.target.value)}
                  className="mr-2" 
                />
                Round trip
              </label>
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="tripType" 
                  value="oneway" 
                  checked={tripType === 'oneway'}
                  onChange={(e) => setTripType(e.target.value)}
                  className="mr-2" 
                />
                One way
              </label>
            </div>

            {/* Search Fields */}
            <div className={`grid grid-cols-1 gap-4 ${tripType === 'roundtrip' ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}>
              {/* Origin */}
              <AutocompleteInput
                name="origin"
                value={searchData.origin}
                onChange={(value) => handleLocationChange('origin', value)}
                placeholder="Origin city or airport"
                label="From"
                required
              />

              {/* Destination */}
              <AutocompleteInput
                name="destination"
                value={searchData.destination}
                onChange={(value) => handleLocationChange('destination', value)}
                placeholder="Destination city or airport"
                label="To"
                required
              />

              {/* Departure Date */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Departure</label>
                <input
                  type="date"
                  name="departureDate"
                  value={searchData.departureDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Return Date - Only show for round trip */}
              {tripType === 'roundtrip' && (
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Return</label>
                  <input
                    type="date"
                    name="returnDate"
                    value={searchData.returnDate}
                    onChange={handleInputChange}
                    min={searchData.departureDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={tripType === 'roundtrip'}
                  />
                </div>
              )}

              {/* Passengers */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
                <select
                  name="passengers"
                  value={searchData.passengers}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1,2,3,4,5,6].map(num => (
                    <option key={num} value={num}>{num} passenger{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Search flights
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching for flights...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {flights.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {flights.length} flight{flights.length > 1 ? 's' : ''} found
            </h2>
            {flights.map((flight) => (
              <div key={flight.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    {flight.itineraries[0].segments.map((segment, index) => (
                      <div key={index} className="flex items-center space-x-4 mb-2">
                        <div className="text-sm text-gray-600">
                          {segment.carrierCode} {segment.number}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{formatTime(segment.departure.at)}</span>
                          <span className="text-gray-500">{segment.departure.iataCode}</span>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                          <span className="text-gray-500">{segment.arrival.iataCode}</span>
                          <span className="font-medium">{formatTime(segment.arrival.at)}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDuration(segment.duration)}
                        </div>
                      </div>
                    ))}
                    <div className="text-sm text-gray-500 mt-2">
                      Total duration: {formatDuration(flight.itineraries[0].duration)}
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6 text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {flight.price.currency} {flight.price.total}
                    </div>
                    <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                      Select
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && flights.length === 0 && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Search for flights</h3>
              <p className="text-gray-500">Enter your travel details above to find the best flight options</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
