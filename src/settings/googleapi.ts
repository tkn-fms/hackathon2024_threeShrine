const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${googleApiKey}`;

class AllTextExtractor {
  // private apiUrl: string;

  // constructor(googleApiKey: string) {
  //   this.apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${googleApiKey}`;
  // }
  public async extractTextFromImages(base64Images: string[]): Promise<string[]> {
    console.log('Goole Vision API start');
    const requests = base64Images.map(encodedImage => ({
        image: { content: encodedImage.split(',')[1] },
        features: [{ type: "TEXT_DETECTION" }]
    }));

    const body = { requests };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();

        return data.responses.map((response: any, index: number) => {
            return response.textAnnotations && response.textAnnotations.length > 0
                ? response.textAnnotations[0].description
                : `No text found in image ${index + 1}`;
        });
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
  }
}

export { AllTextExtractor };
