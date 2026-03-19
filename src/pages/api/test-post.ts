export const POST = async ({ request }) => {
  try {
    const text = await request.text();
    return new Response(JSON.stringify({ receivedText: text }));
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }));
  }
};
