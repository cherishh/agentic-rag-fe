export async function GET() {
  const status = await fetch('http://34.142.222.222:3000/status', {
    cache: 'no-cache',
  });
  const data = await status.json();
  console.log(data);

  return Response.json(data);
}
