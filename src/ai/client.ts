export async function getAIExplanation(prompt: string): Promise<string> {
  const items = await chrome.storage.sync.get(["aiApiKey", "aiProvider"]);
  const aiApiKey = items.aiApiKey as string;
  const aiProvider = items.aiProvider as string;

  if (!aiApiKey) {
    throw new Error(
      "API Key is missing. Please set it in the APIInspector extension options.",
    );
  }

  if (aiProvider === "openai") {
    return fetchOpenAI(prompt, aiApiKey);
  } else if (aiProvider === "gemini") {
    return fetchGemini(prompt, aiApiKey);
  } else {
    throw new Error("Unsupported AI provider selected.");
  }
}

async function fetchOpenAI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(
      `OpenAI Error: ${err.error?.message || response.statusText}`,
    );
  }

  const data = (await response.json()) as any;
  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Invalid or empty response from OpenAI");
  }

  return content;
}

async function fetchGemini(prompt: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(
      `Gemini Error: ${err.error?.message || response.statusText}`,
    );
  }

  const data = (await response.json()) as any;
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error("Invalid or empty response from Gemini");
  }

  return content;
}
