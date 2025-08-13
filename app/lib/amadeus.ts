// Shared Amadeus API utilities
let cachedToken: { token: string; expires: number } | null = null;

export async function getAmadeusToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && Date.now() < cachedToken.expires) {
    return cachedToken.token;
  }

  // Get new token from Amadeus
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
    const errorText = await tokenResponse.text();
    console.error('Token request failed:', tokenResponse.status, errorText);
    throw new Error('Failed to get access token');
  }

  const tokenData = await tokenResponse.json();

  // Cache the token (expires in 1799 seconds, we'll refresh 5 minutes early)
  cachedToken = {
    token: tokenData.access_token,
    expires: Date.now() + (tokenData.expires_in - 300) * 1000
  };

  return tokenData.access_token;
}