import * as faceapi from 'face-api.js';
const MODEL_URL = "./face-api/weights";

class MyFaceapi {
  // モデル読み込み済みフラグ
  static isLoaded: boolean = false;
  // モデルの読み込み
  static loadModels = async () => {
    await Promise.all([
      faceapi.loadSsdMobilenetv1Model(MODEL_URL),
      faceapi.loadFaceLandmarkModel(MODEL_URL),
      faceapi.loadFaceRecognitionModel(MODEL_URL)
    ]);
    this.isLoaded = true;
  };
  // 顔認識の実行
  static detectAll = async (image: string) => {
    if (!this.isLoaded) await this.loadModels();
    // 顔認識の実行と認識結果の取得
    const _img = await createImageData(image);
    const img = await resizeImage(_img, 1024, 1024 * _img.height / _img.width);
    const facesData = await faceapi.detectAllFaces(img).withFaceLandmarks();
    // 顔領域の切り抜き
    let facesList: string[] = [];
    facesData.forEach(data => {
      const box = data.detection.box;
      const size = Math.max(box.width, box.height) * 2;
      const x = box.x + box.width / 2 - size / 2;
      const y = box.y + box.height / 2 - size / 2;
      const croppedFace = cropImage(img, x, y, size, size);
      facesList.push(croppedFace);
    });
    // canvasを設定
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    // 認識結果の描画
    facesData.forEach(data => {
      const box = data.detection.box;
      context.strokeStyle = "red";
      context.lineWidth = 4;
      context.strokeRect(box.x, box.y, box.width, box.height);
    });
    return { facesList: facesList, markedImage: canvas.toDataURL() };
  };
}

// 画像のリサイズ
const resizeImage = async (img: HTMLImageElement, width: number, height: number) => {
  // canvasを設定
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  // canvasのサイズを設定
  canvas.width = width;
  canvas.height = height;
  // 画像データをcanvasに描画
  context.drawImage(img, 0, 0, width, height);
  // canvasから画像データをHTMLImageElementで取得
  const resizedImg = new Image();
  resizedImg.src = canvas.toDataURL();
  return resizedImg;
};

// string から ImageData を生成
const createImageData = async (base64: string) => {
  const img = new Image();
  img.src = base64;
  return img;
};

// 指定した領域の画像データを取得
const cropImage = (img: HTMLImageElement, x: number, y: number, w: number, h: number) => {
  // canvasを設定
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  // canvasのサイズを設定
  canvas.width = w;
  canvas.height = h;
  // 画像データをcanvasに描画
  context.drawImage(img, x, y, w, h, 0, 0, w, h);
  // canvasから画像データをBase64形式で取得
  return canvas.toDataURL();
};

export { MyFaceapi };
