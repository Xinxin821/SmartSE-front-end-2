import { createApp } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus';
import App from './App.vue'
import router from './router'
import './assets/css/global.css'
import 'font-awesome/css/font-awesome.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css';


const app = createApp(App)
app.config.globalProperties.$axios = axios
// 全局注册消息组件
app.config.globalProperties.$message = ElMessage;
app.use(router)
app.mount('#app')
