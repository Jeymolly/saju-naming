import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { firstName, lastName, birthDate, birthTime, gender, vibe, isFree } = body;

    let systemPrompt = '';

    if (isFree) {
      systemPrompt = `You are an expert in traditional Korean Saju (Yin-Yang and Five Elements astrology).
Your task is to calculate the user's Saju based on their birth date and time, and provide ONLY their 5 elements count and a short teaser.
The target audience is English-speaking adults or parents. The output must be in JSON format.

User Details:
- Name: ${firstName || 'Not provided'} ${lastName}
- Birth Date: ${birthDate}
- Birth Time: ${birthTime}
- Gender: ${gender}

Respond ONLY with a JSON object in the exact following structure, with no markdown formatting or backticks:
{
  "sajuAnalysis": {
    "wood": <number 0-4>,
    "fire": <number 0-4>,
    "earth": <number 0-4>,
    "metal": <number 0-4>,
    "water": <number 0-4>,
    "description": "A 2-3 sentence summary of their Saju elements. Gently point out which element is missing or excessive as an 'area of hidden potential' or a 'subtle imbalance.' Instead of being scary, warmly and positively explain that giving them a perfectly balanced Talisman Name will smooth out life's obstacles, protect them, and attract abundant good fortune and success."
  }
}`;
    } else {
      systemPrompt = `You are an expert in traditional Korean Saju (Yin-Yang and Five Elements astrology) and a professional Korean naming master. 
Your task is to analyze the user's birth date and time, calculate their Saju, and recommend 3 beautiful Korean names that balance their destiny. This is for an adult seeking a Talisman name for good fortune, or a parent seeking a baby name.
The target audience is English-speaking individuals. The output must be in JSON format.

User Details:
- Intended English Name / First Name: ${firstName || 'Not provided'}
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
    "description": "A 1-2 sentence high-level summary of their Saju.",
    "details": {
      "personality": "Detailed insight on Personality & Inner Self (max 5 lines).",
      "career": "Detailed insight on Academics, Career & Success (max 5 lines).",
      "wealth": "Detailed insight on Financial Capability & Wealth (max 5 lines).",
      "lifeRhythm": "Detailed insight on Life's Natural Rhythm (Ups & Downs) (max 5 lines).",
      "parents": "Detailed insight on Relationship with Family/Parents (max 5 lines)."
    },
    "destinyGuide": "A future-oriented fortune tip or life advice based on their Saju elements."
  },
  "lifeGraph": [
    { "stage": "Youth (0-20)", "score": <number 1-100> },
    { "stage": "Early Adult (21-40)", "score": <number 1-100> },
    { "stage": "Prime (41-60)", "score": <number 1-100> },
    { "stage": "Elderly (60+)", "score": <number 1-100> }
  ],
  "names": [
    {
      "pronunciation": "E.g., Seo-Ah",
      "hangul": "서아",
      "hanja": "E.g., 瑞 (Auspicious) 雅 (Elegant)",
      "meaning": "Meaning explanation in English...",
      "compensationStory": "Storytelling on how this specific name balances their Saju deficiencies and brings fortune to their destiny...",
      "maximizedAbilities": "Specific abilities or traits this name will maximize (e.g., Enhances leadership and resilience)."
    }
  ]
}
Make sure exactly 3 names are returned.`;
    }

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
