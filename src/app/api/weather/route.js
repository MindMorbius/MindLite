export async function GET() {
  try {
    const res = await fetch('https://uapis.cn/api/weather?name=北京市');
    const data = await res.json();
    if (data.code !== 200) throw new Error('天气获取失败');
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 