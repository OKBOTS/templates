import { getStaticFile } from "./utils.js";
import OpenAI from "openai";

export default async ({ req, res, error }) => {
  if (req.method === "GET") {
    return res.send(getStaticFile("index.html"), 200, {
      "Content-Type": "text/html; charset=utf-8",
    });
  }

  const openai = new OpenAI(
    {
      apiKey: process.env.ANYSCALE_API_KEY,
      baseURL: "https://api.endpoints.anyscale.com/v1",
    },
  );

  if (!req.body.prompt && typeof req.body.prompt !== "string") {
    return res.json(
      { ok: false, error: "Missing required field `prompt`" },
      400,
    );
  }

  try {
    const response = await openai.chat.completions.create({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      max_tokens: parseInt(process.env.ANYSCALE_MAX_TOKENS ?? "512"),
      messages: [{ role: "user", content: req.body.prompt }],
      stream: false
    });
    const completion = response.choices[0].message?.content;
    return res.json({ ok: true, completion }, 200);
  } catch (err) {
    error(err);
    return res.json({ ok: false, error: "Failed to query model." }, 500);
  }
};
