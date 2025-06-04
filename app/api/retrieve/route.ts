export async function POST(request: Request) {
  try {
    const { query, dataset } = await request.json();

    const res = await fetch('http://34.142.222.222:3000/retrieve', {
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
    console.log('Retrieve API response:', data);

    return Response.json(data);
  } catch (error) {
    console.error('Retrieve API error:', error);
    return Response.json(
      {
        success: false,
        error: 'Failed to fetch data from retrieve service',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
