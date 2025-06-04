export async function POST(request: Request) {
  const { query, dataset, options } = await request.json();
  const res = await fetch('http://34.142.222.222:3000/query', {
    method: 'POST',
    body: JSON.stringify({ query, dataset, options }),
  });
  const data = await res.json();
  console.log(data);

  return Response.json(data);
}
