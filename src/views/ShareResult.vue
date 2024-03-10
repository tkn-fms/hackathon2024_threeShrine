<template>
  <!--結果共有画面-->
  <v-app>
    <v-main class="mb-12" style="color: #424242;">
      <v-container>
        <v-card v-for="(person, index) in recommendData" :key="index" class="mx-auto" variant="flat">
          <template v-slot:title>
            <div v-if="person.drink" class="font-weight-bold"> {{ person.drink }} </div>
            <v-skeleton-loader v-else :loading="true" type="text"></v-skeleton-loader>
          </template>
          <template v-slot:prepend>
            <v-avatar size="64">
              <v-img :src="faceImageData[index]"></v-img>
            </v-avatar>
          </template>
          <v-card-text v-if="person.reason">{{ person.reason }}</v-card-text>
          <v-skeleton-loader v-else :loading="true" type="list-item-three-line"></v-skeleton-loader>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Recommend } from '@/settings/recommend';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const db = getFirestore();
const route = useRoute();
const resultId = route.params.uuid; // UUIDはルートパラメータから取得
const recommendData = ref<Recommend[]>([]);
const faceImageData = ref<string[]>([]);

onMounted(async () => {
  if (resultId) {
    // FireBase DBからrecommend_resultsを取ってくる
    const docRef = doc(db, "recommend_results2", resultId.toString());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const recommend_results = docSnap.data();
      recommendData.value = recommend_results.recommend;
      // console.log(recommendData.value);
    } else {
      console.log("No such document! - recommend_results2");
    }

    //FireBase DBからfaceImage_resultsを取ってくる
    const docRef2 = doc(db, "faceImage_results2", resultId.toString());
    const docSnap2 = await getDoc(docRef2);
    if (docSnap2.exists()) {
      const faceImage_results = docSnap2.data();
      faceImageData.value = faceImage_results.image;
      // console.log(faceImageData.value);
    } else {
      console.log("No such document! - faceImage_results2");
    }
  }
});

</script>