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
                }
            } catch (error) {
                console.error('Airport search error:', error);
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
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                ref={inputRef}
                type="text"
                name={name}
                onChange={handleInputChange}
                placeholder={placeholder}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={required}
                autoComplete="off"
            />

            {showSuggestions && (
                <div
                    ref={suggestionsRef}
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
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
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                            <div className="font-medium text-gray-900">
                                {airport.name} ({airport.iataCode})
                            </div>
                            <div className="text-sm text-gray-500">
                                {airport.address.cityName}, {airport.address.countryName}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}