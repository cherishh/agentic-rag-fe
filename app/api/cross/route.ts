export async function POST(request: Request) {
  const { query, datasets } = await request.json();
  const res = await fetch('http://34.142.222.222:3000/cross-query', {
    method: 'POST',
    body: JSON.stringify({ query, datasets }),
  });
  const data = await res.json();
  console.log(data);

  return Response.json(data);
}
