export async function POST(request: Request) {
  try {
    const { query, datasets } = await request.json();

    const res = await fetch('https://mindful-dream-production.up.railway.app/cross-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, datasets }),
    });

    if (!res.ok) {
      throw new Error(`Backend API error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log('Cross Query API response:', data);

    return Response.json(data);
  } catch (error) {
    console.error('Cross Query API error:', error);
    return Response.json(
      {
        success: false,
        error: 'Failed to fetch data from cross-query service',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
