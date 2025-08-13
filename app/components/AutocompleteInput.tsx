'use client';

import { useState, useEffect, useRef } from 'react';

interface Airport {
    id: string;
    name: string;
    iataCode: string;
    address: {
        cityName: string;
        countryName: string;
    };
    subType: string;
}

interface AutocompleteInputProps {
    name: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    label: string;
    required?: boolean;
}

export default function AutocompleteInput({
    name,
    value,
    onChange,
    placeholder,
    label,
    required = false
}: AutocompleteInputProps) {
    const [suggestions, setSuggestions] = useState<Airport[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const searchAirports = async () => {
            if (value.length < 2) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(`/api/airports?keyword=${encodeURIComponent(value)}`);
                if (response.ok) {
                    const data = await response.json();
                    setSuggestions(data.data || []);
                    setShowSuggestions(true);
                } else {
                    console.error('Airport search failed:', response.status);
                    setSuggestions([]);
                    setShowSuggestions(false);
                }
            } catch (error) {
                console.error('Airport search error:', error);
                setSuggestions([]);
                setShowSuggestions(false);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(searchAirports, 300);
        return () => clearTimeout(debounceTimer);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                inputRef.current &&
                suggestionsRef.current &&
                !inputRef.current.contains(event.target as Node) &&
                !suggestionsRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSuggestionClick = (airport: Airport) => {
        const displayValue = `${airport.name} (${airport.iataCode})`;
        onChange(airport.iataCode);
        setShowSuggestions(false);
        if (inputRef.current) {
            inputRef.current.value = displayValue;
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    name={name}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    required={required}
                    autoComplete="off"
                />
                <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>

            {showSuggestions && (
                <div
                    ref={suggestionsRef}
                    className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto backdrop-blur-sm"
                >
                    {loading && (
                        <div className="px-3 py-2 text-gray-500 text-sm">
                            Searching...
                        </div>
                    )}

                    {!loading && suggestions.length === 0 && value.length >= 2 && (
                        <div className="px-3 py-2 text-gray-500 text-sm">
                            No airports found
                        </div>
                    )}

                    {!loading && suggestions.map((airport) => (
                        <div
                            key={airport.id}
                            onClick={() => handleSuggestionClick(airport)}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-900">
                                        {airport.name}
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center space-x-2">
                                        <span>{airport.address.cityName}, {airport.address.countryName}</span>
                                        <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium">{airport.iataCode}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}