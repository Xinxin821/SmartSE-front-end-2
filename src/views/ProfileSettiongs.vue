<template>
  <div class="profile-settings">
    <h1>个人设置</h1>
    <form @submit.prevent="saveProfile">
      <div class="form-group">
        <label>昵称<span class="required">*</span></label>
        <input v-model="profile.nickname" required>
      </div>
      <div class="form-group">
        <label>头像</label>
        <input type="file" @change="onFileChange" accept="image/*">
        <img v-if="profile.avatarUrl" :src="profile.avatarUrl" alt="头像" class="avatar-preview">
      </div>
<!--      <div class="form-group">-->
<!--        <label>性别<span class="required">*</span></label>-->
<!--        <select v-model="profile.gender" required>-->
<!--          <option value="">请选择性别</option>-->
<!--          <option value="male">男</option>-->
<!--          <option value="female">女</option>-->
<!--        </select>-->
<!--      </div>-->
      <div class="form-group">
        <label>简介</label>
        <textarea v-model="profile.bio"></textarea>
      </div>
      <div class="form-group">
        <label>学校<span class="required">*</span></label>
        <input v-model="profile.school" required>
      </div>
      <div class="form-group">
        <label>专业<span class="required">*</span></label>
        <input v-model="profile.major" required>
      </div>
      <button type="submit">保存</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      profile: {
        nickname: '',
        avatarUrl: '',
        // gender: '',
        bio: '',//简介
        school: '',
        major: '',
        avatarFile: null, // 用于存储选择的文件
        userId: localStorage.getItem("userId") // 添加userId
      },
      selectedFile: null  // 用于存储实际上传的文件
    };
  },
  async created() {
    const userId = this.$route.query.userId || localStorage.getItem("userId");
    console.log(userId);
    if (userId) {
      try {
        const response = await axios.get(`http://localhost:8080/api/user/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          }
        });

        if (response.data.code === 200 && response.data.data) {
          this.profile = response.data.data;
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
        if (error.response && error.response.status === 401) {
          this.$router.push('/Login');
        }
      }
    }
  },
  methods: {
// 在ProfileSettings.vue的onFileChange方法中添加压缩逻辑
    async onFileChange(event) {
      const file = event.target.files[0];
      if (!file) return;

      // 检查文件大小（示例限制2MB）
      if (file.size > 2 * 1024 * 1024) {
        this.$message.error("头像大小不能超过2MB");
        return;
      }

      try {
        // 使用canvas压缩图片
        const compressedFile = await this.compressImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          this.profile.avatarUrl = e.target.result;
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("图片处理失败:", error);
      }
    },

// 图片压缩方法
    compressImage(file, maxWidth = 200, quality = 0.8) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = maxWidth / img.width;
            canvas.width = maxWidth;
            canvas.height = img.height * scale;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(
                (blob) => resolve(new File([blob], file.name, { type: 'image/jpeg' })),
                'image/jpeg',
                quality
            );
          };
        };
      });
    },
    async saveProfile() {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("userToken");

        // 确保只发送必要的字段，不要包含id和createdAt/updatedAt
        const profileData = {
          userId: userId,  // 确保包含userId
          nickname: this.profile.nickname,
          avatarUrl: this.profile.avatarUrl,
          bio: this.profile.bio,
          school: this.profile.school,
          major: this.profile.major,
          gender: this.profile.gender
        };
        //测试用
        console.log("当前userId:", userId);
        console.log("准备发送的数据:", profileData);

        const response = await axios.put(
            `http://localhost:8080/api/user/profile`,
            profileData,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            }
        );

        if (response.data.code === 200) {
          localStorage.setItem("userInfo", JSON.stringify(response.data.data));
          this.$router.push("/Function");
        } else {
          console.error("保存失败:", response.data.message);
          alert("保存失败: " + response.data.message);
        }
      } catch (error) {
        console.error("保存出错:", error);
        alert("保存出错: " + (error.response?.data?.message || error.message));

        // 检查是否是userId不匹配导致的错误
        if (error.response?.data?.message?.includes("userId")) {
          this.logout(); // 强制退出登录
        }
      }
    }
  }
};
</script>

<style scoped>
.profile-settings {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group label .required {
  color: red;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

.avatar-preview {
  max-width: 100px;
  max-height: 100px;
  margin-top: 10px;
}

button {
  padding: 10px 15px;
  background-color: #4361ee;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #3f37c9;
}
</style>