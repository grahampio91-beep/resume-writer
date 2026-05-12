export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    return Response.json({ resume: data.content?.[0]?.text || "" });
  } catch (err) {
    return Response.json({ error: "Failed to generate resume" }, { status: 500 });
  }
}
