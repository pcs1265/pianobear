import { createRouter, createWebHistory } from 'vue-router';

import Main from '@/views/Main.vue';
import LogMain from '@/views/LogMain.vue';

import Login from '@/views/LogMain/Login.vue';
import PwReset from '@/views/LogMain/PwReset.vue';
import Regist from '@/views/LogMain/Regist.vue';

import MyInfo from '@/views/Main/MyInfo/MyInfo.vue';
import Friends from '@/views/Main/Friends/Friends.vue';
import PianoSheetView from '@/views/Main/PianoSheet/PianoSheetView.vue';
import CommunityView from '@/views/Main/Community/CommunityView.vue';

import PianoSheetList from '@/views/Main/PianoSheet/PianoSheetList.vue';
import PianoSheetDetail from '@/views/Main/PianoSheet/PianoSheetDetail.vue';
import PianoSheetUpload from '@/views/Main/PianoSheet/PianoSheetUpload.vue';
import PianoPractice from '@/views/Main/PianoSheet/PianoPractice.vue';
import PianoChallenge from '@/views/Main/PianoSheet/PianoChallenge.vue';

import Community from '@/views/Main/Community/Community.vue';
import Communiting from '@/views/Main/Community/Communiting.vue';
import CommunityJoin from '@/views/Main/Community/CommunityJoin.vue';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "logmain",
      component: LogMain,
      children: [
        {
          path: "",
          name: "login",
          component: Login
        },
        {
          path: "regist",
          name: "regist",
          component: Regist
        },
        {
          path: "pwReset",
          name: "pwReset",
          component: PwReset
        }
      ]
    },
    {
      path: "/main",
      name: "main",
      component: Main,
      children: [
        {
          path: "",
          name: "myInfo",
          component: MyInfo
        },
        {
          path: "friends",
          name: "friends",
          component: Friends
        },
        {
          path: "piano-sheet",
          name: "pianoSheetView",
          component: PianoSheetView,
          children: [
            {
              path: "",
              name: "pianoSheetList",
              component: PianoSheetList,
            },
            {
              path: ":id",
              name: "pianoDetail",
              component: PianoSheetDetail,
            },
            {
              path: ":id/practice",
              name: "pianoPractice",
              component: PianoPractice,
            },
            {
              path: ":id/challenge",
              name: "pianoChallenge",
              component: PianoChallenge,
            },
            {
              path: "upload",
              name: "pianoUpload",
              component: PianoSheetUpload,
            }
          ]
        },
        {
          path: "community",
          name: "communityView",
          component: CommunityView,
          children: [
            {
              path: "",
              name: "community",
              component: Community,
            },
            {
              path: ":id",
              name: "communityJoin",
              component: CommunityJoin,
            },
            {
              path: "joining/:id",
              name: "communiting",
              component: Communiting,
            },
          ]
        }
      ]
    }
  ]
})

export default router