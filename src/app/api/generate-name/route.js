import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { firstName, lastName, birthDate, birthTime, gender, vibe } = body;

    const systemPrompt = `You are an expert in traditional Korean Saju (Yin-Yang and Five Elements astrology) and a professional baby namer. 
Your task is to analyze the user's provided birth date and time, calculate their Saju, and recommend 3 beautiful Korean names that balance their destiny.
The target audience is English-speaking parents. The output must be in JSON format.

User Details:
- Intended English Name: ${firstName || 'Not provided'}
- Family Last Name: ${lastName}
- Birth Date: ${birthDate}
- Birth Time: ${birthTime}
- Gender: ${gender}
- Preferred Vibe: ${vibe}

Respond ONLY with a JSON object in the exact following structure, with no markdown formatting or backticks:
{
  "sajuAnalysis": {
    "wood": <number 0-4>,
    "fire": <number 0-4>,
    "earth": <number 0-4>,
    "metal": <number 0-4>,
    "water": <number 0-4>,
    "description": "A 2-3 sentence English description of their Saju based on the birth data. Mention their dominant element, what they lack, and how the Korean name will balance it to harmonize with their English name."
  },
  "names": [
    {
      "pronunciation": "E.g., Seo-Ah",
      "hangul": "서아",
      "hanja": "E.g., 瑞 (Auspicious) 雅 (Elegant)",
      "meaning": "Meaning explanation in English...",
      "career": "Ideal career path explanation...",
      "location": "Ideal living location explanation...",
      "compatibility": "Romantic compatibility explanation..."
    }
  ]
}
Make sure exactly 3 names are returned.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that strictly outputs JSON." },
        { role: "user", content: systemPrompt }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return NextResponse.json(result);

  } catch (error) {
    console.error("OpenAI API Error:", error);
    return NextResponse.json({ error: 'Failed to generate names' }, { status: 500 });
  }
}
