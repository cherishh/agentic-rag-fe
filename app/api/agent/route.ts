export async function POST(request: Request) {
  const { query, dataset } = await request.json();
  const res = await fetch('http://34.142.222.222:3000/agent', {
    method: 'POST',
    body: JSON.stringify({ query, dataset }),
  });
  const data = await res.json();
  console.log(data);

  return Response.json(data);
}
