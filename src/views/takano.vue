<template>
  <!--Google Vision APIを使った画像からのテキスト抽出-->
  <v-container>
    <v-file-input
      label="Choose an image..." @change="onFileChange" accept="image/*" filled multiple
      prepend-icon="mdi-camera">
    </v-file-input>
    <template v-if="imageUrls.length > 0">
      <v-row justify="center" align="center">
        <v-col
          v-for="(imageUrl, index) in imageUrls"
          :key="index"
          cols="12" sm="6" md="4" lg="3"
        >
          <v-img :src="imageUrl" class="mb-2" />
          <div>{{ images[index].name }}</div>
        </v-col>
      </v-row>
    </template>
    <template v-if="MenuList.length > 0">
      <v-card class="mx-auto mt-5" >{{ MenuList }}</v-card>
      <v-card class="mx-auto mt-5">
        <v-card-text v-if="!loading">{{ AllDrinkMenuList }}</v-card-text>
        <v-skeleton-loader v-else :loading="true" type="list-item-three-line"></v-skeleton-loader>
      </v-card>
    </template>
  </v-container>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { AllTextExtractor } from '@/settings/googleapi';
  import { DrinkNameExtractor } from '@/settings/openaiapi_drink';

  import { useRouter } from 'vue-router';
  import { useDrinkStore } from '@/store/drink';

  //変数
  const images = ref<File[]>([]); // アップロードされた画像データ
  const imageUrls = ref<string[]>([]);
  const encodedImages = ref<string[]>([]); // Base64エンコードされた画像データ

  const allTextExtractorInstance = new AllTextExtractor();
  const MenuList = ref<string[]>([]); // 画像から抽出したテキストデータ

  const drinkNameExtractorInstance = new DrinkNameExtractor();
  const loading = ref<boolean>(true);
  const AllDrinkMenuList = ref<string[]>([]);

  const drinkStore = useDrinkStore();

  //関数
  const onFileChange = async (event: Event) => {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      images.value = Array.from(files);
      imageUrls.value = images.value.map(file => URL.createObjectURL(file)); // 画像のURLを生成し、表示用の配列に追加
      encodedImages.value = []; // ここで配列をクリア

      const encodePromises = images.value.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            // FileReaderのresultを確認
            if (e.target?.result) {
              resolve(e.target.result);
            }
          };
          reader.readAsDataURL(file); //ファイルを読み込んでBase64形式のデータURLを返す *then扱い（？）
        });
      });

      // 全ての画像がエンコードされた後に、結果をセットします
      const encodedResults = await Promise.all(encodePromises); //全ての処理の完了確認
      encodedImages.value = encodedResults as string[];
      MenuList.value = await allTextExtractorInstance.extractTextFromImages(encodedImages.value); // エンコードされた画像をAPIに渡す

      // MenuListの各要素に対してextractDrinkNamesを非同期に呼び出す
      const drinkNamesPromises = MenuList.value.map(text => drinkNameExtractorInstance.extractDrinkNames(text));
      const drinkNamesResults = await Promise.all(drinkNamesPromises);

      //出力完了
      loading.value = false;

      let allDrinks: string[] = [];

      // 各テキストをループして、カンマで分割し、allDrinks配列に追加
      drinkNamesResults.forEach(drinksText => {
        const drinksArray = drinksText.split(',');
        allDrinks = allDrinks.concat(drinksArray);
      });
      AllDrinkMenuList.value = allDrinks;
      drinkStore.setDrink(AllDrinkMenuList.value);
    }
  };
</script>