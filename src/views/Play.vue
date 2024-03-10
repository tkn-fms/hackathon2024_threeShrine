<template>
  <v-app>
    <v-main class="my-12" style="color: #424242; user-select: none;">
      <v-overlay v-model="isTransition" class="d-flex justify-center align-center">
        <v-img src="@/assets/ZKZg.gif" width="64"></v-img>
      </v-overlay>
      <v-container v-if="isLoading" class="fill-height">
        <Loading />
      </v-container>

      <v-container v-else>
        <v-container class="mb-6">
          <h3 class="mb-3 my-fonts">1. 集合写真を選択してください</h3>
          <v-file-input label="Choose an image" variant="outlined" prepend-icon="mdi-image" accept="image/*"
            @update:model-value="handleGroupPhotoChange">
          </v-file-input>
          <v-row v-if="GroupPhotoData" justify="center" align="center">
            <v-col cols="12" sm="6" md="8" lg="8">
              <v-img :src="GroupPhotoData" rounded />
            </v-col>
          </v-row>
        </v-container>
        <v-container class="mb-6">
          <h3 class="mb-3 my-fonts">2. メニュー画像を選択してください</h3>
          <v-file-input label="Choose images" variant="outlined" prepend-icon="mdi-image-multiple" accept="image/*"
            multiple @update:model-value="handleMenuImageChange" />
          <v-row v-if="MenuImageData.length > 0" justify="center" align="center">
            <v-col v-for="(image, index) in MenuImageData" :key="index" cols="12" sm="6" md="8" lg="8">
              <v-img :src="image" rounded />
            </v-col>
          </v-row>
        </v-container>
        <v-container>
          <v-btn class="text-capitalize" color="blue" variant="flat" block rounded="xl" size="x-large"
            :disabled="!GroupPhotoData || !MenuImageData.length" @click="uploadImage">
            アップロード
            <template v-slot:prepend>
              <v-icon icon="mdi-cloud-upload"></v-icon>
            </template>
          </v-btn>
        </v-container>
      </v-container>
    </v-main>
    <v-footer></v-footer>
  </v-app>
</template>

<script setup lang="ts">
import Loading from '@/components/Loading.vue';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { usePeopleStore } from '@/store/people';
import { MyOpenai } from '@/settings/openai';
import { MyFaceapi } from '@/settings/faceapi';
import { Person } from '@/settings/person';

import { AllTextExtractor } from '@/settings/googleapi';
import { DrinkNameExtractor } from '@/settings/openaiapi_drink';
import { useDrinkStore } from '@/store/drink';
import { PROMPT_TEMPLATE } from '@/settings/prompt';

import { SendRecommendResult } from '@/settings/firebase';
import { Recommend } from '@/settings/recommend';

import { useVisitCounterStore } from '@/store/resultvisit';
const counter = useVisitCounterStore();

onMounted(() => {
  // 一番上までスクロール
  scrollTo(0, 0);
  counter.reset();
});

const router = useRouter();
const peopleStore = usePeopleStore();
const drinkStore = useDrinkStore();

const GroupPhotoData = ref<string | null>(null);
const MenuImageData = ref<string[]>([]);
const isLoading = ref(false);
const isTransition = ref(false);

const allTextExtractorInstance = new AllTextExtractor();
const drinkNameExtractorInstance = new DrinkNameExtractor();
const AllMenuTextData = ref<string[]>([]); // 画像から抽出したテキストデータ
const AllDrinkMenuList = ref<string[]>([]); //全ドリンクメニューのデータ

const resultRecommend = ref<Recommend[]>([]);
const resultImage = ref<string[]>([]);

// ファイル選択のハンドラ
const handleGroupPhotoChange = (files: File[]) => {
  // ユーザーがファイルを選択しているかどうかを確認
  if (files.length === 0) {
    GroupPhotoData.value = null;
    return;
  }
  const file = files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) {
      // 読み込んだデータをimageDataに設定
      GroupPhotoData.value = e.target.result as string;
    }
  };
  reader.readAsDataURL(file);
};

const handleMenuImageChange = (files: File[]) => {
  // ユーザーがファイルを選択しているかどうかを確認
  if (files.length === 0) {
    MenuImageData.value = [];
    return;
  }
  const imageFiles = Array.from(files);
  imageFiles.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        // 読み込んだデータをimageDataに設定
        MenuImageData.value.push(e.target.result as string);
        //detectAllFaces(imageData.value);
      }
    };
    reader.readAsDataURL(file);
  });
};

//アップロードボタン押されると
const uploadImage = async () => {
  isTransition.value = true;

  // 顔認識の実行
  const faceResult: { facesList: string[]; markedImage: string; } = await new Promise((resolve) => {
    setTimeout(async () => {
      // 1秒後に顔認識を実行
      const faceResult = await MyFaceapi.detectAll(GroupPhotoData.value || "");
      // 顔認識の結果をPromiseの解決値として返す
      resolve(faceResult);
    }, 1000);
  });
  if (faceResult.facesList.length === 0) {
    isTransition.value = false;
    isLoading.value = false;
    alert('集合写真から顔が検出されませんでした');
    return;
  }
  const people: Person[] = faceResult.facesList.map((face, index) => { return { id: index, image: face } });

  isTransition.value = false;
  isLoading.value = true;
  scrollTo(0, 0);

  //メニュー画像からのテキスト抽出の実行
  AllMenuTextData.value = await allTextExtractorInstance.extractTextFromImages(MenuImageData.value); // エンコードされた画像をAPIに渡す
  // MenuListの各要素に対してextractDrinkNamesを非同期に呼び出す
  const drinkNamesPromises = AllMenuTextData.value.map(text => drinkNameExtractorInstance.extractDrinkNames(text));
  const drinkNamesResults = await Promise.all(drinkNamesPromises);
  // 各テキストをループして，カンマで分割し，allDrinks配列に追加
  drinkNamesResults.forEach(drinksText => {
    const drinksArray = drinksText.split(',');
    AllDrinkMenuList.value = AllDrinkMenuList.value.concat(drinksArray);
  });
  drinkStore.setDrink(AllDrinkMenuList.value);

  // chatGPTの実行
  Promise.all(people.map(async (person) => {
    return MyOpenai.ask({ prompt: PROMPT_TEMPLATE, texts: AllDrinkMenuList.value, images: [person.image], max_tokens: 150 })
      .then(description => {
        // 出力形式に【飲み物】と【理由】が含まれているかどうかを確認
        if (description.includes('【飲み物】') && description.includes('【理由】')) {
          // 出力形式を【飲み物】と【理由】に分割
          const drink = description.split('【飲み物】')[1].split('【理由】')[0].trim();
          const reason = description.split('【理由】')[1].trim();
          person.drink = drink;
          person.reason = reason;
        } else {
          person.drink = 'Error';
          person.reason = description;
        }
      });
  })).then(async () => {
    peopleStore.setPeople(people);
    peopleStore.setMarkedImage(faceResult.markedImage);

    // Firebaseに追加するためのデータ分割
    resultRecommend.value = people.map(({ image, ...rest }) => rest);
    resultImage.value = people.map(({ image }) => image);

    // Firebaseに追加し、完了したらページ遷移
    await SendRecommendResult.addData(resultRecommend.value, resultImage.value);
    router.push({ name: 'Result' });
  });
}
</script>

<style scoped>
.my-fonts {
  font-family: 'Potta One', sans-serif;
}
</style>
