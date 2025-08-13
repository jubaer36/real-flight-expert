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
    const [expandedItem, setExpandedItem] = useState<string | null>(null);
    const [displayValue, setDisplayValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Sync displayValue when value prop changes (e.g., form reset)
    useEffect(() => {
        if (!value) {
            setDisplayValue('');
        }
    }, [value]);

    useEffect(() => {
        const searchAirports = async () => {
            if (displayValue.length < 2) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(`/api/airports?keyword=${encodeURIComponent(displayValue)}`);
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
    }, [displayValue]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                inputRef.current &&
                suggestionsRef.current &&
                !inputRef.current.contains(event.target as Node) &&
                !suggestionsRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
                setExpandedItem(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSuggestionClick = (airport: Airport) => {
        const newDisplayValue = `${airport.address.cityName} (${airport.iataCode})`;
        setDisplayValue(newDisplayValue);
        onChange(airport.iataCode);
        setShowSuggestions(false);
        setExpandedItem(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setDisplayValue(newValue);
        
        // If user is typing and it looks like just an IATA code (3 letters), use it directly
        if (newValue.length === 3 && /^[A-Z]{3}$/i.test(newValue)) {
            onChange(newValue.toUpperCase());
        } else {
            // Otherwise, clear the value since it's not a valid IATA code yet
            onChange('');
        }
        setExpandedItem(null);
    };

    const toggleExpanded = (airportId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedItem(expandedItem === airportId ? null : airportId);
    };

    return (
        <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    name={name}
                    value={displayValue}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-base"
                    required={required}
                    autoComplete="off"
                />
                <svg className="absolute left-3 top-4 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <div className="px-3 py-2 text-gray-500 text-xs flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent"></div>
                            <span>Searching...</span>
                        </div>
                    )}

                    {!loading && suggestions.length === 0 && value.length >= 2 && (
                        <div className="px-3 py-2 text-gray-500 text-xs">
                            No locations found
                        </div>
                    )}

                    {!loading && suggestions.map((airport) => (
                        <div
                            key={airport.id}
                            className="border-b border-gray-100 last:border-b-0"
                        >
                            <div
                                onClick={() => handleSuggestionClick(airport)}
                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer transition-colors duration-150 flex items-center justify-between"
                            >
                                <div className="flex items-center space-x-2 flex-1">
                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-xs font-bold">{airport.iataCode}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900 text-sm">
                                            {airport.address.cityName}
                                        </div>
                                        {expandedItem === airport.id && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                <div>{airport.name}</div>
                                                <div className="text-xs text-gray-400 mt-0.5">
                                                    {airport.address.countryName}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => toggleExpanded(airport.id, e)}
                                    className="ml-1 p-1 hover:bg-gray-200 rounded-full transition-colors duration-150"
                                >
                                    <svg
                                        className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${expandedItem === airport.id ? 'rotate-180' : ''
                                            }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}