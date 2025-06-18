import { buildApiUrl } from '@/lib/config';

export async function GET() {
  const status = await fetch(buildApiUrl('/diagnose'), {
    cache: 'no-cache',
  });
  const data = await status.json();
  console.log(data);

  return Response.json(data);
}
