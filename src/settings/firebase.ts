import { ref } from 'vue';
import { db, storage } from '../main';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { ref as storageRef, uploadString, getDownloadURL} from 'firebase/storage';
import { useUUIDStore } from '@/store/uuid';
import { Recommend } from '@/settings/recommend';
import { useVisitCounterStore } from '@/store/resultvisit';

const uuid = ref<string>("");
const resultImageUrl = ref<string[]>([]);

class SendRecommendResult {
  static async addData(resultRecommend: Recommend[], resultImage: string[]){
    const uuidStore = useUUIDStore();
    const visitStore = useVisitCounterStore();

    // FireBase DBにテキストデータをアップロード
    if (resultRecommend) {
      if (visitStore.visits == 0){ //最初の1回ならaddDoc
        try {
          const docRef = await addDoc(collection(db, 'recommend_results2'), {
            recommend: resultRecommend
          });
          uuidStore.setUUID(docRef.id);
          uuid.value = docRef.id;
          console.log("Document written to DB - resommend_results");
        } catch (e) {
          console.error("Error adding document - resommend_results: ", e);
        }
      }else{ //リトライならsetDoc
        try {
          await setDoc(doc(db, 'recommend_results2', uuid.value), {
            recommend: resultRecommend
          });
          console.log("Document written to DB - imageUrl");
        } catch (e) {
          console.error("Error adding document - imageUrl: ", e);
        }
      }
    }

    // FireBase Storageに画像データをアップロード
    if (resultImage && resultImage.length > 0) {
      try {
        const uploadPromises = resultImage.map(async (preview, index) => {
          const fileName = `${uuid.value}_${index}.png`;
          const strRef = storageRef(storage, `${uuid.value}/${fileName}`);
          const snapshot = await uploadString(strRef, preview, "data_url");
          return getDownloadURL(snapshot.ref);
        });

        resultImageUrl.value = await Promise.all(uploadPromises);
        console.log("Images upload to Storage - faceImages");
      } catch (error) {
        console.error("Error adding document - faceImages: ", error); // エラーをキャッチして表示
      }
    }

    // FireBase DBにテキストデータをアップロード
    if (resultImageUrl.value) {
      try {
        await setDoc(doc(db, "faceImage_results2", uuid.value), {
          image: resultImageUrl.value
        });
        console.log("Document written to DB - imageUrl");
      } catch (e) {
        console.error("Error adding document - imageUrl: ", e);
      }
    }
  };
}

export { SendRecommendResult };