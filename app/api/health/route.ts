import { buildApiUrl } from '@/lib/config';

export async function GET() {
  const status = await fetch(buildApiUrl('/health'), {
    cache: 'no-cache',
  });
  const data = await status.json();
  console.log(data);

  return Response.json(data);
}

// export async function POST(request: Request) {
//   const { email, content } = await request.json();
//   const fb = await db.insert(feedback).values({ email, content });
//   return Response.json(fb);
// }
