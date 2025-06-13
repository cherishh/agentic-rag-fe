export async function GET() {
  const status = await fetch('https://mindful-dream-production.up.railway.app/status', {
    cache: 'no-cache',
  });
  const data = await status.json();
  console.log(data);

  return Response.json(data);
}
