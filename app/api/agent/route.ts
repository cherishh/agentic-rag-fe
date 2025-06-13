export async function POST(request: Request) {
  try {
    const { query, dataset } = await request.json();

    const res = await fetch('https://mindful-dream-production.up.railway.app/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, dataset }),
    });

    if (!res.ok) {
      throw new Error(`Backend API error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log('Agent API response:', data);

    return Response.json(data);
  } catch (error) {
    console.error('Agent API error:', error);
    return Response.json(
      {
        success: false,
        error: 'Failed to fetch data from agent service',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
