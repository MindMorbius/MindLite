export async function GET() {
  try {
    const res = await fetch(
      'https://api.github.com/repos/MindMorbius/MindLite'
    );
    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 