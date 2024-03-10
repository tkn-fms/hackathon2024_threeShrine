import OpenAI from "openai";
const gptApiKey = import.meta.env.VITE_ChatGPT_API_KEY;
const openai = new OpenAI({ apiKey: gptApiKey, dangerouslyAllowBrowser: true });

class DrinkNameExtractor {
  // private openai: OpenAI;

  // constructor(apiKey: string) {
  //   this.openai = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true });
  // }
  public async extractDrinkNames(text: string): Promise<string> {
    try {
      console.log('GPT start - extract drinkNames');
      const response = await openai.chat.completions.create({
          model: "gpt-4-0125-preview",
          messages: [{
              role: "system",
              content: "以下は、ある居酒屋のドリンクメニューの画像から抽出したテキストです。テキストの中に含まれているドリンク名を全て挙げて、カンマ区切りで出力してください。"
          }, {
              role: "user",
              content: text
          }],
          temperature: 0.5,
          max_tokens: 700,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
      });

      const drinkResult = response ? response.choices[0].message.content : null;
      if(drinkResult){
        const drinkNames = drinkResult.trim();
        return drinkNames;
      }else{
        return "";
      }

    } catch (error) {
      console.error("Error extracting drink names:", error);
      return "";
    }
  }
}

export { DrinkNameExtractor };
