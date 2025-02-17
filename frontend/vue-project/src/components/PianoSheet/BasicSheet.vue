<template>
  <div class="container">
    <div>
      <img
        src="@/assets/images/prev.png"
        alt="이전"
        class="prev"
        @click="downCount"
        :class="{ disabled: !canGoBack }"
      />
      <!-- <button class="prev" @click="downCount" :class="{ disabled: !canGoBack }"></button> -->
    </div>
    <div class="page">
      <div v-for="pageIndex in 2" :key="pageIndex" class="line">
        <div :class="`bookshelf${pageIndex}`">
          <div class="shelf">
            <router-link
              v-for="(book, index) in currentList.filter(
                (_, i) => bookCount + pageIndex - 1 <= i / 5 && i / 5 < bookCount + pageIndex
              )"
              :key="index"
              :to="`/main/piano-sheet/${book.id}`"
              class="router"
              :style="{ gridColumn: (index % 5) + 1 }"
            >
              <div class="book">
                <!-- 이미지가 있을 때 -->
                <img
                  v-if="book.musicImg"
                  :src="getMusicImageUrl(book.id) + '/download-music-img'"
                  alt="Book Image"
                />
                <!-- 이미지가 없을 때 -->
                <img v-else src="@/assets/images/blur.png" alt="Default Book Image" />
              </div>
            </router-link>
          </div>
        </div>
        <div :class="`support${pageIndex}`">
          <div class="support">
            <div
              v-for="(book, index) in currentList.filter(
                (_, i) => bookCount + pageIndex - 1 <= i / 5 && i / 5 < bookCount + pageIndex
              )"
              :key="index"
              class="title"
            >
              {{ book.title }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <img
        src="@/assets/images/next.png"
        alt="다음"
        class="next"
        @click="upCount"
        :class="{ disabled: !canGoForward }"
      />
      <!-- <button class="next" @click="upCount" :class="{ disabled: !canGoForward }"></button> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { usePianoSheetStore, type BasicSheet } from "@/stores/pianosheet";

const store = usePianoSheetStore();
const bookCount = ref<number>(0);
const pageCount = ref<number>(0);
const currentSortOption = ref<number>(0);

const basicFavoriteList = computed(() => store.basicFavoriteList);
const basicPracticeList = computed(() => store.basicPracticeList);

const currentList = computed(() => {
  let list: BasicSheet[] = [];

  switch (currentSortOption.value) {
    case 0:
      list = basicFavoriteList.value;
      break;
    case 1:
      list = basicPracticeList.value;
      break;
    default:
      list = [];
  }

  // 검색어가 입력된 경우 해당 검색어를 포함하는 아이템만 필터링
  if (store.searchText) {
    return list.filter((item) => item.title.includes(store.searchText));
  }

  return list;
});

// 최대 페이지 수 계산
const maxPageCount = computed<number>(() => Math.ceil(currentList.value.length / 10) - 1);

// 이전 버튼 활성화 여부
const canGoBack = computed<boolean>(() => bookCount.value > 0);

// 다음 버튼 활성화 여부
const canGoForward = computed<boolean>(() => pageCount.value < maxPageCount.value);

const downCount = (): void => {
  if (canGoBack.value) {
    bookCount.value -= 2;
    pageCount.value -= 1;
  }
};

const upCount = (): void => {
  if (canGoForward.value) {
    bookCount.value += 2;
    pageCount.value += 1;
  }
};

// props로 전달받은 sortOption
const props = defineProps<{ sortOption: number }>();

watch(
  () => props.sortOption,
  (newSortOption) => {
    currentSortOption.value = newSortOption;
  }
);

const getMusicImageUrl = (bookId: number) => {
  return `${import.meta.env.VITE_API_BASE_URL}/music/${bookId}`;
};
</script>

<style scoped>
.bookshelf1 {
  background-color: #d2b48c;
}

.bookshelf2 {
  background-color: #e8c8a0;
}

.shelf {
  display: grid;
  grid-template-columns: repeat(5, 1fr); /* 5개의 열을 생성 */
  gap: 2vw; /* 책 사이의 간격 */
  padding-left: 2vw;
  padding-top: 5vh;
  width: 70vw;
  height: 28vh;
}

.support {
  display: grid;
  grid-template-columns: repeat(5, 1fr); /* 5개의 열을 생성 */
  gap: 2vw; /* 타이틀 사이의 간격 */
  padding-left: 2vw;
}

.book {
  width: 10vw;
  transition: all 0.3s linear; /* 악보 천천히 커지게 하는 효과 */
}

.title {
  width: 10vw;
  display: flex;
  justify-content: center;
}

.book:hover {
  transform: scale(1.05); /* 악보 키우는 효과 */
}

.support1 {
  background-color: #e8c8a0;
  padding-top: 0.5vh;
  height: 4vh;
}

.support2 {
  background-color: #d2b48c;
  padding-top: 0.5vh;
  height: 4vh;
}

.router {
  text-decoration: none;
  color: black;
}

.book img {
  width: 18vw;
  height: 23vh;
}

.line {
  margin-bottom: 4vh;
  box-shadow: 0.1vw 0.4vh 0.8vh gray;
}

/* .prev,
.next {
  border-bottom: 3vh solid transparent;
  border-top: 3vh solid transparent;
  margin: 0 3vw;
} */

.prev {
  /* border-left: 2vw solid transparent;
  border-right: 2vw solid #a48253; */
  margin-right: 20px;
  transition: all 0.1s linear;
}

.next {
  /* border-left: 2vw solid #a48253;
  border-right: 2vw solid transparent; */
  margin-left: 25px;
  transition: all 0.1s linear;
}

.prev:hover {
  transform: scale(1.4);
}

.next:hover {
  transform: scale(1.4);
}

.prev.disabled,
.next.disabled {
  visibility: hidden;
}
</style>
