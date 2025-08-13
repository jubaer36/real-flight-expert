# Flight Search App

A modern flight search application built with Next.js and integrated with the Amadeus Flight Offers API.

## Features

- Clean, Google Flights-inspired UI
- Real-time flight search using Amadeus API
- Responsive design for mobile and desktop
- Flight details including airline, duration, and pricing
- Simple and intuitive user interface

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your Amadeus API credentials:
   ```
   AMADEUS_API_KEY=your_api_key_here
   AMADEUS_API_SECRET=your_api_secret_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Integration

This app uses the Amadeus Flight Offers Search API to fetch real flight data. You'll need to:

1. Sign up for a free account at [Amadeus for Developers](https://developers.amadeus.com/)
2. Create a new app to get your API key and secret
3. Add these credentials to your `.env.local` file

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Amadeus API** - Flight data

## Usage

1. Enter your departure and destination cities (use airport codes like NYC, LON, etc.)
2. Select your departure date
3. Choose number of passengers
4. Click "Search flights" to see available options
5. Browse results with flight details and pricing

## Screenshots

![Flight Search Interface](screenshot.png)

*Clean, responsive interface inspired by Google Flights*