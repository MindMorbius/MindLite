export async function GET() {
  try {
    const res = await fetch('https://uapis.cn/api/say');
    const text = await res.text();
    return new Response(text);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 