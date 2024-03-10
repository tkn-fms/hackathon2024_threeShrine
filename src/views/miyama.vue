<template>
  <v-container>
    <v-file-input label="Choose an image..." @change="handleFile" accept="image/*" filled
      prepend-icon="mdi-camera"></v-file-input>
    <v-img v-if="imageData" :src="imageData" />
    <v-card v-for="(person, index) in people" :key="index" class="mx-auto mt-3">
      <template v-slot:title>
        <div v-if="person.drink"> {{ person.drink }} </div>
        <v-skeleton-loader v-else :loading="true" type="text"></v-skeleton-loader>
      </template>
      <template v-slot:prepend>
        <v-avatar size="64">
          <v-img :src="person.image"></v-img>
        </v-avatar>
      </template>
      <v-card-text v-if="person.reason">{{ person.reason }}</v-card-text>
      <v-skeleton-loader v-else :loading="true" type="list-item-three-line"></v-skeleton-loader>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { MyOpenai } from '@/settings/openai';
import { MyFaceapi } from '@/settings/faceapi';

interface Person {
  image: string;
  drink?: string;
  reason?: string;
}

const imageData = ref<string | null>(null);   // アップロードされた画像データ
const people = ref<Person[]>([]);             // 切り抜かれた顔の画像データ

onMounted(async () => {
  await MyFaceapi.loadModels();
  // MyOpenai.ask({ prompt: 'Hello!', max_tokens: 1 });
});

// こんな感じのリストがある前提で
const drinks = [
  'オレンジジュース',
  '紀州産 南高梅酒',
  'こだわり酒場の生レモンサワー',
  'プレーンタコハイ',
  'オールフリー',
  '梅干し追加',
  'ソフトドリンク',
  'ノンアルコールビールテイスト飲料',
  'コカ・コーラ',
  '金魚タコハイ',
  'カルピスジュース',
  'ハイボール',
  'グレープフルーツサワー',
  '紅茶',
  'シャンディガフ',
  'ふつうのレモンサワー',
  'ジャスミンハイ',
  'サワー・酎ハイ',
  'カルロ ロッシ（赤・白）',
  'コーラサワー',
  'ジンジャーサワー',
  'レモン追加',
  '緑茶ハイ',
  '紅茶ハイ',
  'ピーチウーロン',
  '日本酒',
  'カシスオレンジ',
  'ウーロン茶',
  '緑茶',
  'グレープフルーツジュース',
  '超炭酸ハイボール',
  'ビームハイボール',
  '梅酒',
  'タコハイ',
  '大吟醸〜香り華やか〜',
  'カクテル',
  'ビール',
  'コーラハイボール',
  'ピーチグレープ',
  'カルピスサワー',
  'カシスグレフル',
  'ピーチティー',
  'カシスウーロン',
  'ウーロンハイ',
  '焼酎',
  'ピーチフィズ',
  'ジャスミン茶',
  '温州みかんソーダ',
  'アロエおろしサワー',
  'ぶんたんサワー',
  'ワイン',
  '温州みかんサワー',
  'ジャパニーズジン',
  '翆ジンハイボール',
  '梅タコハイ',
  'ハイボールオプション',
  '角ハイボール',
  'カシスソーダ',
  '神泡のザ・プレミアム・モルツ',
  'ジンジャエール',
  'ガリタコハイ',
  'ファジーネーブル',
  'ジンジャーハイボール'
];

const PROMPT_TEMPLATE = `
画像に映っている人物の表情に基づいておすすめの飲み物を考えてください。
おすすめの飲み物は${drinks}から1つ選んでください。

# 制約条件
・入力された画像1枚1枚に対して、以下の形式で出力してください。
・出力形式は厳格に守り、それ以外のことは記述しないでください。
・【理由】は100文字程度で記述してください。

# 出力形式
【飲み物】
モヒート
【理由】
彼の広がる笑顔からは、エネルギーと陽気さが溢れています。そんな彼には、レモンやライムが効いた爽快なモヒートを提案します。
`;

// ファイル選択のハンドラ
const handleFile = (event: Event) => {
  const input = event.target as HTMLInputElement;
  // ユーザーがファイルを選択しているかどうかを確認
  if (!input.files?.length) return;
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = async (e) => {
    if (!e.target?.result) return;
    // 読み込んだデータをimageDataに設定
    imageData.value = e.target.result as string;
    // 顔認識の実行
    if (!MyFaceapi.isLoaded) await MyFaceapi.loadModels();
    const result = await MyFaceapi.detectAll(imageData.value);
    people.value = result.facesList.map(face => { return { image: face, } });
    imageData.value = result.markedImage;
    // chat GPT による画像説明の実行
    // 全員まとめてver --> 人数多いときつそう、出力が遅い、飲み物はいい感じに分散？
    // MyOpenai.ask({ prompt: PROMPT_TEMPLATE, images: people.value.map(person => person.image), max_tokens: 1000 })
    //   .then(response => {
    //     const peopleData = response.split('【飲み物】');
    //     peopleData.forEach((data, index) => {
    //       if (index === 0) return;
    //       const drink = data.split('【理由】')[0];
    //       const reason = data.split('【理由】')[1];
    //       people.value[index - 1].drink = drink;
    //       people.value[index - 1].reason = reason;
    //     });
    //   });
    // 1人ずつver --> 人数多くても大丈夫、出力が早い、飲み物が偏る？
    people.value.forEach((person, index) => {
      MyOpenai.ask({ prompt: PROMPT_TEMPLATE, images: [person.image], max_tokens: 100 })
        .then(description => {
          // 出力形式を【飲み物】と【理由】に分割して、people.valueを更新
          const drink = description.split('【飲み物】')[1].split('【理由】')[0];
          const reason = description.split('【理由】')[1];
          person.drink = drink;
          person.reason = reason;
        });
    });
  };
  reader.readAsDataURL(file);
};
</script>
