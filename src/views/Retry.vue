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
        <v-container>
          <h3 class="mb-3 my-fonts">集合写真を選択してください</h3>
          <v-file-input label="Choose an image" variant="outlined" prepend-icon="mdi-image" accept="image/*"
            @update:model-value="handleGroupPhotoChange">
          </v-file-input>
          <v-row v-if="GroupPhotoData" justify="center" align="center">
            <v-col cols="12" sm="6" md="4" lg="3">
              <v-img :src="GroupPhotoData" rounded />
            </v-col>
          </v-row>
        </v-container>
        <v-card v-for="(person, index) in selectedPeople" :key="index" class="mx-auto" variant="flat">
          <template v-slot:title>
            <div v-if="person.drink" class="font-weight-bold" style="white-space: normal;"> {{ person.drink }} </div>
            <v-skeleton-loader v-else :loading="true" type="text"></v-skeleton-loader>
          </template>

          <template v-slot:prepend>
            <v-avatar size="64">
              <v-img :src="person.image"></v-img>
            </v-avatar>
          </template>
        </v-card>
        <v-container class="mt-8">
          <v-btn class="text-capitalize" color="blue" variant="flat" block rounded="xl" size="x-large"
            :disabled="!GroupPhotoData" @click="uploadImage">
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
import { useDrinkStore } from '@/store/drink';
import { PROMPT_TEMPLATE } from '@/settings/prompt';

import { SendRecommendResult } from '@/settings/firebase';
import { Recommend } from '@/settings/recommend';

const router = useRouter();
const peopleStore = usePeopleStore();
const drinkStore = useDrinkStore();

const selectedPeople = ref<Person[]>(peopleStore.selectedPeople);
const GroupPhotoData = ref<string | null>(null);
const isLoading = ref(false);
const isTransition = ref(false);

const resultRecommend = ref<Recommend[]>([]);
const resultImage = ref<string[]>([]);

onMounted(() => {
  // 一番上までスクロール
  scrollTo(0, 0);
});

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

  // chatGPTの実行
  Promise.all(people.map(async (person) => {
    return MyOpenai.ask({ prompt: PROMPT_TEMPLATE, texts: drinkStore.drink, images: [person.image], max_tokens: 150 })
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
    peopleStore.setMarkedImage(faceResult.markedImage);
    peopleStore.updatePeople(people);

    // Firebaseに追加するためのデータ分割
    resultRecommend.value = peopleStore.people.map(({ image, ...rest }) => rest);
    resultImage.value = peopleStore.people.map(({ image }) => image);

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
