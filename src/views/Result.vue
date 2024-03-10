<template>
  <!--結果画面-->
  <v-app>
    <v-main style="color: #424242;">
      <v-img v-if="markedImage" :src="markedImage" class="mb-2" />
      <v-container class="pa-1 ma-n2 pt-8 pb-4">
        <v-row justify="center">
          <v-col cols="auto">
            <div class="tab-gp">
              <v-btn @click="select('result')" v-bind:class="{ 'active': show == 'result' }">診断結果</v-btn>
              <v-btn @click="select('order')" v-bind:class="{ 'active': show == 'order' }">注文書</v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
      <div class="tab-content">
        <div v-if="show == 'result'" class="tab-item mt-2">
          <v-card v-for="(person, index) in people" :key="index" class="mx-auto" variant="flat">
            <template v-slot:title>
              <div v-if="person.drink" class="font-weight-bold" style="white-space: normal;"> {{ person.drink }} </div>
              <v-skeleton-loader v-else :loading="true" type="text"></v-skeleton-loader>
            </template>

            <template v-slot:prepend>
              <v-avatar size="64">
                <v-img :src="person.image"></v-img>
              </v-avatar>
            </template>

            <template v-slot:append>
              <div v-if="counter.visits <= 1">
                <v-container>
                  <v-row justify="center" class="mb-1"><span style="font-size: 12px;">リトライ？</span></v-row>
                  <v-row justify="center" class="ma-n5"><v-checkbox :value="person" v-model="selectedPeople"
                      hide-details></v-checkbox></v-row>
                </v-container>
              </div>
            </template>
            <v-card-text v-if="person.reason">{{ person.reason }}</v-card-text>
            <v-skeleton-loader v-else :loading="true" type="list-item-three-line"></v-skeleton-loader>
          </v-card>
          <v-container class="mt-2">
            <div v-if="counter.visits <= 1" class="mb-10">
              <v-btn prepend-icon="mdi-reload" class="text-capitalize" color="blue" variant="flat" block rounded="xl"
                size="x-large" :disabled="!selectedPeople.length" @click="retry">
                リトライ
              </v-btn>
            </div>
            <div class="copy-container">
              <v-row class="justify-center mt-2 mb-12">
                <v-btn prepend-icon="mdi-content-copy" class="copy_bt" :class="{ copy_bt_complete: isCopied }"
                  @click="copyLink()">
                  結果URLコピー
                </v-btn>
              </v-row>
            </div>
          </v-container>
        </div>
        <div v-else-if="show == 'order'" class="mb-12">
          <div v-for="(num, drink) in order">
            <v-container class="pa-1 mt-2">
              <div class="font-weight-bold ml-2"> {{ drink }} × {{ num }}杯</div>
            </v-container>
          </div>
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Person } from '@/settings/person';
import { usePeopleStore } from '@/store/people';
import { useUUIDStore } from '@/store/uuid';
import { useVisitCounterStore } from '@/store/resultvisit';

const router = useRouter();
const peopleStore = usePeopleStore();
const people = ref<Person[]>(peopleStore.people);
const markedImage = ref<string | null>(peopleStore.markedImage);
const selectedPeople = ref<Person[]>([]);

const counter = useVisitCounterStore();

const uuidStore = useUUIDStore();
const shareLink = ref<string>(`${window.location.origin}/share/`); //`${window.location.origin}/share/` or `${window.location.origin}/face-bar/#/share/`

const isCopied = ref(false);

//　注文書のためのカウント
const order: { [key: string]: number } = {};

onMounted(() => {
  // 一番上までスクロール
  scrollTo(0, 0);
  // resut.vueに何回来たか
  counter.increment();
  peopleStore.people.forEach((person) => {
    if (person.drink) {
      if (order[person.drink]) {
        order[person.drink]++;
      } else {
        order[person.drink] = 1;
      }
    }
  });
});

const retry = () => {
  peopleStore.setSelectedPeople(selectedPeople.value);
  router.push({ name: 'Retry' });
}

// タブ切り替え
const show = ref('result');
const select = (tab: string) => {
  show.value = tab;
};

const copyLink = () => {
  const shareURL = shareLink.value + uuidStore.uuid
  console.log(shareURL)
  navigator.clipboard.writeText(shareURL)
    .then(() => {
      // console.log("copied!", shareURL);
      isCopied.value = true;
      setTimeout(() => {
        isCopied.value = false;
      }, 3000);
    })
    .catch(e => {
      console.error(e)
    })
}
</script>

<style scoped>
.copy_bt {
  padding: 5px 10px;
  position: relative;
}

.copy_bt_complete {
  pointer-events: none;
}

.copy_bt_complete::before {
  content: 'Copied!';
  position: absolute;
  background-color: #2196F3;
  color: white;
  width: max-content;
  padding: 5px;
  opacity: 0;
  top: 30px;
  left: 0;
  right: 0;
  margin: auto;
  animation: copy_complete 3s linear .1s 1;
  text-transform: none !important;
}

.copy_bt_complete::after {
  content: '';
  position: absolute;
  background-color: #2196F3;
  width: 10px;
  height: 10px;
  left: 0;
  right: 0;
  margin: auto;
  top: 27px;
  opacity: 0;
  clip-path: polygon(50% 0, 100% 50%, 0% 50%);
  animation: copy_complete 3s linear .1s 1;
}

@keyframes copy_complete {
  20% {
    opacity: 1;
  }

  80% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}
</style>
