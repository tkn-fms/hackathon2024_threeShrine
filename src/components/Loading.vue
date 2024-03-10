<template>
  <div class="carouselWrapper">
    <v-container class="p-0 m-0" style="max-width: 720px;">
      <v-row class="justify-center">
        <v-progress-linear indeterminate color="#424242" class="mb-0"></v-progress-linear>
        <div style="width: 100%; aspect-ratio: 16 / 9; overflow: hidden;">
          <BCarousel ref="myCarousel" fade style="width: 100%;">
            <BCarouselSlide img-src="https://cdn.macaro-ni.jp/assets/img/shutterstock/shutterstock_225472294.jpg" />
            <BCarouselSlide
              img-src="https://otokonokakurega.com/wp-content/uploads/2019/09/314ae0732d6a2dd210cf60f178219eea.jpg.webp" />
            <BCarouselSlide
              img-src="https://kireisea.com/wp-content/uploads/2017/10/2c0c88bd55273141a13cfccf148a21b8-1000x600.jpg" />
            <BCarouselSlide
              img-src="https://web.hh-online.jp/hankyu-food/blog/images/36303f49c599c59c1174ba879463536e6731c11c.jpg" />
            <BCarouselSlide img-src="https://web.hh-online.jp/hankyu-food/blog/images/iStock-502072256.jpg" />
            <BCarouselSlide img-src="https://furunavi.jp/discovery/wp-content/uploads/2023/06/202308_cocktail_2.jpg" />
            <BCarouselSlide
              img-src="https://dri-tal.com/cms/wp-content/uploads/2018/09/277817fd57b71bbc3a00aeca7af8380f_m-1200x797.jpg" />
            <BCarouselSlide
              img-src="https://d1yigc72zo8x1s.cloudfront.net/wp-content/uploads/2018/01/cocktail-10-1024x687.jpeg" />
            <BCarouselSlide img-src="https://dersteira.at/img/efd0241b7522f60b252307598cb2c2fa.jpg" />
            <BCarouselSlide img-src="https://googirl.jp/img/14/02/1402078top.jpg" />
          </BCarousel>
        </div>
      </v-row>
      <v-row class="justify-center">
        <v-divider></v-divider>
        <v-card variant="flat" style="color: #424242;">
          <v-card-title class="d-flex flax-row justify-center font-weight-bold">酒言葉</v-card-title>
          <v-divider></v-divider>
          <v-card-text class="d-flex flax-row justify-center">
            <div v-for="(item, index) in alchoList" :key="index">
              <p class="d-flex flax-row justify-center">{{ item.name }}</p>
              <p class="d-flex flax-row justify-center"> {{ item.tip }}</p>
            </div>
          </v-card-text>
        </v-card>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Tips from '@/settings/Tips.json';
import type { BCarousel } from 'bootstrap-vue-next';
const myCarousel = ref<null | InstanceType<typeof BCarousel>>(null)

interface Tips {
  name: string,
  tip: string
}

const alchoList = ref<Tips[]>([]);
let displayIndex = ref<number>(0);

onMounted(() => {
  // 初回のデータセット
  fetchData();

  // 3.5秒ごとにデータを更新
  setInterval(() => {
    myCarousel.value?.prev();
    // さら1.75秒後に次のデータを表示
    setTimeout(() => {
      fetchData();
      displayIndex.value = (displayIndex.value + 1) % alchoList.value.length;
    }, 1750);
  }, 3500);
});

function fetchData() {
  // データの取得処理（ここではランダムなデータを生成しています）
  const newData = generateRandomData();

  // alchoListにデータを追加
  alchoList.value = [newData];
}

function generateRandomData(): Tips {
  // 実際のデータ生成ロジックに置き換える
  const randomAlcohol = Tips;
  const randomIndex = Math.floor(Math.random() * randomAlcohol.length);
  return randomAlcohol[randomIndex];
}
</script>

<style scoped>
.carouselWrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: transparent;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>

<style scoped lang="scss">
$carousel-transition-duration: 3s;
@import "./node_modules/bootstrap/scss/bootstrap.scss";
</style>
