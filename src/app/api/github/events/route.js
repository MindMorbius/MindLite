export async function GET() {
  try {
    const res = await fetch(
      'https://api.github.com/users/MindMorbius/events?per_page=15'
    );
    if (!res.ok) throw new Error('GitHub API 请求失败');
    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 