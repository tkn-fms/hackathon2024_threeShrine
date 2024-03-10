// OpenAI の API を利用するための設定
import OpenAI from "openai";
const API_KEY = import.meta.env.VITE_ChatGPT_API_KEY;
const openai = new OpenAI({ apiKey: API_KEY, dangerouslyAllowBrowser: true });

class MyOpenai {
  static async ask(options: { prompt: string; texts?: string[], images?: string[]; max_tokens?: number }) {
    const { prompt, texts = [], images = [], max_tokens = 100 } = options;
    const textsJSON = texts.map(text => ({
      type: "text",
      text,
    }));
    const imagesJSON = images.map(image => ({
      type: "image_url",
      image_url: {
        "url": image,
      },
    }));
    console.log('GPT start - choice drink');
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            ...textsJSON as any,
            ...imagesJSON as any,
          ],
        },
      ],
      max_tokens: max_tokens,
    });
    const description = response.choices[0].message.content as string;
    // console.log(description);
    return description;
  }
}

export { MyOpenai };
