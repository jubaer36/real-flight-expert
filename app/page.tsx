'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [travelClass, setTravelClass] = useState('economy');
  const [passengerBreakdown, setPassengerBreakdown] = useState({
    adults: 1,
    children: 0,
    infants: 0
  });

  const [flights, setFlights] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookedFlight, setBookedFlight] = useState<FlightOffer | null>(null);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);

  const passengerDropdownRef = useRef<HTMLDivElement>(null);

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

  const handleBookFlight = async (flight: FlightOffer) => {
    setBookingLoading(flight.id);

    // Simulate booking process
    setTimeout(() => {
      setBookedFlight(flight);
      setBookingLoading(null);
      setFlights([]); // Clear search results
    }, 2000);
  };

  const handleNewSearch = () => {
    setBookedFlight(null);
    setSearchData({
      origin: '',
      destination: '',
      departureDate: '',
      returnDate: '',
      passengers: 1
    });
    setTravelClass('economy');
    setPassengerBreakdown({
      adults: 1,
      children: 0,
      infants: 0
    });
  };

  // Sync passenger breakdown with search data
  useEffect(() => {
    const totalPassengers = passengerBreakdown.adults + passengerBreakdown.children + passengerBreakdown.infants;
    setSearchData(prev => ({ ...prev, passengers: totalPassengers }));
  }, [passengerBreakdown]);

  // Close passenger dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (passengerDropdownRef.current && !passengerDropdownRef.current.contains(event.target as Node)) {
        setShowPassengerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 px-4 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src="/realflightexpertlogo.png"
              alt="Real Flight Expert Logo"
              className="w-12 h-12 object-contain"
            />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Real Flight Expert
            </h1>
          </div>
          <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Powered by Amadeus</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 sm:p-8 mb-8 backdrop-blur-sm">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Trip Type, Class, and Passengers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {/* Trip Type Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Trip Type</label>
                <div className="relative">
                  <select
                    value={tripType}
                    onChange={(e) => setTripType(e.target.value)}
                    className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-base appearance-none"
                  >
                    <option value="roundtrip">Round trip</option>
                    <option value="oneway">One way</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Class Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Class</label>
                <div className="relative">
                  <select
                    value={travelClass}
                    onChange={(e) => setTravelClass(e.target.value)}
                    className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-base appearance-none"
                  >
                    <option value="economy">Economy</option>
                    <option value="premium_economy">Premium Economy</option>
                    <option value="business">Business</option>
                    <option value="first">First</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Passengers */}
              <div className="relative" ref={passengerDropdownRef}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Passengers</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                    className={`w-full bg-gray-50 border-2 border-gray-200 rounded-xl transition-all duration-200 h-[56px] flex items-center px-4 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-700 font-medium text-sm">
                          {passengerBreakdown.adults + passengerBreakdown.children + passengerBreakdown.infants} passenger{(passengerBreakdown.adults + passengerBreakdown.children + passengerBreakdown.infants) > 1 ? 's' : ''}
                        </span>
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 `}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Passenger Dropdown */}
                  {showPassengerDropdown && (
                    <div className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl backdrop-blur-sm">
                      <div className="p-4 space-y-4">
                        {/* Adults */}
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 text-sm">Adults</div>
                              <div className="text-xs text-gray-500">Age 12+</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => setPassengerBreakdown(prev => ({ ...prev, adults: Math.max(1, prev.adults - 1) }))}
                              disabled={passengerBreakdown.adults <= 1}
                              className="w-7 h-7 rounded-full bg-gray-100 border border-gray-300 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center focus:outline-none"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="w-6 text-center font-medium text-gray-900">
                              {passengerBreakdown.adults}
                            </span>
                            <button
                              type="button"
                              onClick={() => setPassengerBreakdown(prev => ({ ...prev, adults: Math.min(9, prev.adults + 1) }))}
                              disabled={passengerBreakdown.adults >= 9}
                              className="w-7 h-7 rounded-full bg-gray-100 border border-gray-300 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center focus:outline-none"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Children */}
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a1.5 1.5 0 011.5 1.5V12a1.5 1.5 0 01-1.5 1.5H9m0-4.5V9a1.5 1.5 0 011.5-1.5H12a1.5 1.5 0 011.5 1.5v1.5m-6 0V12a1.5 1.5 0 001.5 1.5H9" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 text-sm">Children</div>
                              <div className="text-xs text-gray-500">Age 2-11</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => setPassengerBreakdown(prev => ({ ...prev, children: Math.max(0, prev.children - 1) }))}
                              disabled={passengerBreakdown.children <= 0}
                              className="w-7 h-7 rounded-full bg-gray-100 border border-gray-300 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center focus:outline-none"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="w-6 text-center font-medium text-gray-900">
                              {passengerBreakdown.children}
                            </span>
                            <button
                              type="button"
                              onClick={() => setPassengerBreakdown(prev => ({ ...prev, children: Math.min(8, prev.children + 1) }))}
                              disabled={passengerBreakdown.children >= 8}
                              className="w-7 h-7 rounded-full bg-gray-100 border border-gray-300 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center focus:outline-none"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Infants */}
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 text-sm">Infants</div>
                              <div className="text-xs text-gray-500">Under 2</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => setPassengerBreakdown(prev => ({ ...prev, infants: Math.max(0, prev.infants - 1) }))}
                              disabled={passengerBreakdown.infants <= 0}
                              className="w-7 h-7 rounded-full bg-gray-100 border border-gray-300 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center focus:outline-none"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="w-6 text-center font-medium text-gray-900">
                              {passengerBreakdown.infants}
                            </span>
                            <button
                              type="button"
                              onClick={() => setPassengerBreakdown(prev => ({ ...prev, infants: Math.min(passengerBreakdown.adults, prev.infants + 1) }))}
                              disabled={passengerBreakdown.infants >= passengerBreakdown.adults}
                              className="w-7 h-7 rounded-full bg-gray-100 border border-gray-300 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center focus:outline-none"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="border-t border-gray-100 pt-3 mt-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              Total: {passengerBreakdown.adults + passengerBreakdown.children + passengerBreakdown.infants} passenger{(passengerBreakdown.adults + passengerBreakdown.children + passengerBreakdown.infants) > 1 ? 's' : ''}
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowPassengerDropdown(false)}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Search Fields */}
            <div className={`grid grid-cols-1 gap-4 ${tripType === 'roundtrip' ? 'sm:grid-cols-2 lg:grid-cols-5' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Departure</label>
                <div className="relative">
                  <input
                    type="date"
                    name="departureDate"
                    value={searchData.departureDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-base"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Return Date - Only show for round trip */}
              {tripType === 'roundtrip' && (
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Return</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="returnDate"
                      value={searchData.returnDate}
                      onChange={handleInputChange}
                      min={searchData.departureDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-base"
                      required={tripType === 'roundtrip'}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}


            </div>

            {/* Search Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-12 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 transform hover:scale-105 hover:shadow-xl disabled:transform-none disabled:shadow-none flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Search Flights</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {loading && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-lg">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Searching for flights...</h3>
            <p className="text-gray-600">Finding the best deals for your journey</p>
            <div className="mt-6 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-red-800">Search Error</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {flights.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {flights.length} flight{flights.length > 1 ? 's' : ''} found
              </h2>
              <div className="text-sm text-gray-500">
                Best prices available
              </div>
            </div>
            {flights.map((flight, index) => (
              <div key={flight.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    {flight.itineraries[0].segments.map((segment, segmentIndex) => {
                      const departure = formatDateTime(segment.departure.at);
                      const arrival = formatDateTime(segment.arrival.at);

                      return (
                        <div key={segmentIndex} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center space-x-6 flex-1">
                            {/* Airline Logo Placeholder */}
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-sm">{segment.carrierCode}</span>
                            </div>

                            {/* Flight Details */}
                            <div className="flex items-center space-x-8 flex-1">
                              <div className="text-center">
                                <div className="text-xl font-bold text-gray-900">{departure.time}</div>
                                <div className="text-sm text-gray-500">{departure.date}</div>
                                <div className="text-sm font-semibold text-blue-600">{segment.departure.iataCode}</div>
                              </div>


                              <div className="flex flex-col items-center px-4 flex-1">
                                <div className="text-xs text-gray-500 mb-1">{segment.carrierCode} {segment.number}</div>
                                <div className="w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
                                  <svg className="absolute -right-1 -top-2 w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                  </svg>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{formatDuration(segment.duration)}</div>
                              </div>

                              <div className="text-center">
                                <div className="text-xl font-bold text-gray-900">{arrival.time}</div>
                                <div className="text-sm text-gray-500">{arrival.date}</div>
                                <div className="text-sm font-semibold text-blue-600">{segment.arrival.iataCode}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Total duration:</span> {formatDuration(flight.itineraries[0].duration)}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Best price</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 lg:mt-0 lg:ml-8 text-center lg:text-right">
                    <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                      {flight.price.currency} {flight.price.total}
                    </div>
                    <div className="text-sm text-gray-500 mb-4">per person</div>
                    <button
                      onClick={() => handleBookFlight(flight)}
                      disabled={bookingLoading === flight.id}
                      className="w-full lg:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:transform-none disabled:shadow-none flex items-center justify-center space-x-2"
                    >
                      {bookingLoading === flight.id ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Booking...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Select Flight</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking Confirmation */}
        {bookedFlight && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-green-800">Flight Booked Successfully!</h3>
                <p className="text-green-700">Your booking confirmation number is: <span className="font-mono font-bold">FL{bookedFlight.id.slice(-6).toUpperCase()}</span></p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-green-200 p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-3">Flight Details</h4>

              {bookedFlight.itineraries[0].segments.map((segment, index) => {
                const departure = formatDateTime(segment.departure.at);
                const arrival = formatDateTime(segment.arrival.at);

                return (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="font-medium text-gray-900">{departure.time}</div>
                        <div className="text-sm text-gray-500">{departure.date}</div>
                        <div className="text-sm font-medium text-gray-700">{segment.departure.iataCode}</div>
                      </div>

                      <div className="flex flex-col items-center px-4">
                        <div className="text-xs text-gray-500 mb-1">{segment.carrierCode} {segment.number}</div>
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        <div className="text-xs text-gray-500 mt-1">{formatDuration(segment.duration)}</div>
                      </div>

                      <div className="text-center">
                        <div className="font-medium text-gray-900">{arrival.time}</div>
                        <div className="text-sm text-gray-500">{arrival.date}</div>
                        <div className="text-sm font-medium text-gray-700">{segment.arrival.iataCode}</div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600">Total Duration</div>
                  <div className="font-medium">{formatDuration(bookedFlight.itineraries[0].duration)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Total Price</div>
                  <div className="text-2xl font-bold text-green-600">
                    {bookedFlight.price.currency} {bookedFlight.price.total}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleNewSearch}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Book Another Flight
              </button>
              <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                View Booking Details
              </button>
            </div>
          </div>
        )}

        {!loading && !error && flights.length === 0 && !bookedFlight && (
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200 p-12 text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to explore the world?</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Enter your travel details above to discover amazing flight deals and start your next adventure
            </p>
            <div className="flex justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Best prices</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Instant booking</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secure</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
