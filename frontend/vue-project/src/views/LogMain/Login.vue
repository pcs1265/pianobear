<template>
    <div class="login-container">
        <div class="login-box">
            <md-elevation></md-elevation>
            <div class="flex flex-row items-center justify-center w-full"><img src="@/assets/logo.png" class="w-50" /></div>
            <div class="login-text">로그인</div>
            <md-outlined-text-field label="아이디" type="text" class="login-input id" :value="userId" @input="setUserId"
                @keyup.enter="Login"></md-outlined-text-field>
            <md-outlined-text-field label="비밀번호" type="password" class="login-input" :value="userPassword"
                @input="setUserPassword" @keyup.enter="Login"></md-outlined-text-field>
            <v-btn class="login-button" @click="Login" :loading="isLoading" :disabled="isLoading">로그인</v-btn>
            <div class="regist-pwReset-box">
                <v-btn class="secondary-button" @click="router.push({ name: 'regist' })">
                    회원가입
                </v-btn>
                <v-btn class="secondary-button" @click="router.push({ name: 'pwReset' })">
                    비밀번호 재설정
                </v-btn>
            </div>
            <!-- <div class="social-login-buttons">
                <a class="social-button" @click="kakaoLogin()">
                    <img src="@/assets/images/카카오로그인 이미지.png" alt="카카오로그인 버튼">
                </a>
                <a class="social-button" @click="googleLogin()">
                    <img src="@/assets/images/구글로그인 이미지.png" alt="구글로그인 버튼">
                </a>
            </div> -->
        </div>
    </div>
</template>


<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();

function kakaoLogin() {
    // Implement kakaoLogin functionality here
}

function googleLogin() {
    // Implement googleLogin functionality here
}

const userStore = useUserStore();

const userId = ref('');
const userPassword = ref('');
const isLoading = ref(false); // 로딩 상태 변수 추가

const setUserId = (e) => {
    userId.value = e.target.value;
};

const setUserPassword = (e) => {
    userPassword.value = e.target.value;
};

async function Login() {
    isLoading.value = true; // 로그인 시작 시 로딩 상태로 설정
    try {
        const res = await userStore.LoginUser(userId.value, userPassword.value);
        if (res.status === 200) {
            console.log("로그인에 성공했습니다.");

            userStore.isLoggedIn = true;
            sessionStorage.setItem("accessToken", res.data.accessToken);
            localStorage.setItem("refreshToken", res.data.refreshToken);
            userStore.SetAccessToken(res.data.accessToken);
            userStore.SetRefreshToken(res.data.refreshToken);
            userStore.GetUserInfo()
                .then(() => {
                    console.log(userStore.user);
                })
                .catch((error) => {
                    console.error(error);
                });
            router.push("/main");
            console.log(userStore.isLoggedIn);
        } else if (res.status === 403) {
            console.log("이메일인증이 되지 않은 사용자입니다.");
            alert("메일인증이 되지 않은 사용자입니다.");
        } else {
            console.log("로그인에 실패했습니다.");
            alert("로그인에 실패했습니다.");
        }
    } catch (error) {
        console.log("아이디 또는 비밀번호가 일치하지 않습니다.");
        alert("아이디 또는 비밀번호가 일치하지 않습니다.");
    } finally {
        isLoading.value = false; // 로그인 프로세스 완료 후 로딩 상태 해제
    }
}
</script>



<style scoped>
@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    animation: fadeIn 0.5s ease-in-out;
}

.login-box {
    background: #FFF9E0;
    position: relative;
    padding: 60px 40px;
    border-radius: 30px;
    text-align: center;
    max-width: 600px;
    width: 100%;
}

.login-text {
    padding: 10px;
    color: #947650;
    font-size: 24px;
    font-weight: 500;
}

.login-input {
    width: calc(100% - 40px);
    margin: 10px 0;
    color: #F5E5D1;
    background-color: #FBFCFE;
    border-radius: 10px;
    font-size: 16px;
}

.id {
    margin-top: 50px;
}

.regist-pwReset-box {
    display: flex;
    justify-content: space-between;
    margin: 20px 0;
}

.secondary-button {
    flex: 1;
    padding: 10px;
    margin: 0 20px;
    background-color: #F5E5D1;
    color: #947650;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
    text-align: center;
}

.login-button {
    width: 90%;
    padding: 10px;
    margin-top: 20px;
    background-color: #D9F6D9;
    color: #947650;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.secondary-button a {
    text-decoration: none;
    color: #947650;
    display: block;
    width: 100%;
}

.social-login-buttons {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.social-button {
    display: inline-block;
    margin: 0 10px;
    cursor: pointer;
}

.social-button img {
    border-radius: 4px;
    transition: transform 0.3s;
}
</style>