<template>
  <div class="function-container">
    <!-- 移动端菜单切换按钮 -->
    <button class="mobile-menu-toggle" id="mobileMenuToggle" @click="toggleMobileMenu">
      <i class="fas fa-bars"></i>
    </button>

    <!-- 侧边栏 -->
    <div class="sidebar" :class="{ 'collapsed': isSidebarCollapsed, 'active': isMobileMenuOpen }" id="sidebar">
      <div class="logo">
        <h1>SmartSE</h1>
        <span>软件工程课程智能助手</span>
        <button class="toggle-sidebar" id="toggleSidebar" @click="toggleSidebar">
          <i class="fas" :class="isSidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
        </button>
      </div>

      <div class="menu">
        <div class="menu-section">
          <h3>导航</h3>
          <div
              class="menu-item"
              :class="{ 'active': activeMenu === 'chat' }"
              data-menu="chat"
              @click="setActiveMenu('chat')"
          >
            <i class="fas fa-comments"></i>
            <span>智能对话</span>
          </div>
          <div
              class="menu-item"
              :class="{ 'active': activeMenu === 'knowledge' }"
              data-menu="knowledge"
              @click="setActiveMenu('knowledge')"
          >
            <i class="fas fa-project-diagram"></i>
            <span>知识图谱</span>
          </div>
          <div
              class="menu-item"
              :class="{ 'active': activeMenu === 'exercise' }"
              data-menu="exercise"
              @click="setActiveMenu('exercise')"
          >
            <i class="fas fa-tasks"></i>
            <span>习题解析</span>
          </div>
          <div
              class="menu-item"
              :class="{ 'active': activeMenu === 'resource' }"
              data-menu="resource"
              @click="setActiveMenu('resource')"
          >
            <i class="fas fa-book"></i>
            <span>课程资源</span>
          </div>
        </div>

        <div class="menu-section">
          <h3>对话历史</h3>
          <div class="chat-history">
            <div
                v-for="(history, index) in chatHistories"
                :key="index"
                class="chat-history-item"
                :class="{ 'active': activeHistoryIndex === index }"
                @click="setActiveHistory(index)"
            >
              <span>{{ history }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="user-profile" id="userProfileButton" @click="toggleUserCard">
        <div class="user-avatar">
          <span>Xin</span>
        </div>
        <div class="user-info">
          <div class="user-name">Word麻鸭.</div>
          <div class="user-status">在线</div>
        </div>
      </div>

      <!-- 用户信息卡片 (默认隐藏) -->
      <!-- 修改用户卡片部分 -->
      <div class="user-card" id="userCard" v-show="showUserCard">
        <div class="user-card-header">
          <div class="user-card-avatar">
            <span>{{ userInfo && userInfo.nickname ? userInfo.nickname.substring(0, 1) : 'X' }}</span>
          </div>
          <div class="user-card-info">
            <h3>{{ userInfo?.nickname || '用户' }}</h3>
            <p v-if="userInfo">{{ userInfo.bio }} · {{ userInfo.school }} {{ userInfo.major }}</p>
          </div>
          <button class="user-card-close" id="closeUserCard" @click="closeUserCard">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="user-card-content">
          <div class="user-stats">
            <div class="stat-item">
              <div class="stat-value">0</div>
              <div class="stat-label">对话次数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">0</div>
              <div class="stat-label">学习天数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">0</div>
              <div class="stat-label">已完成习题</div>
            </div>
          </div>
          <div class="user-menu">
            <a href="#" class="user-menu-item" @click.prevent="goToProfileSettings">
              <i class="fas fa-user-cog"></i>
              <span>个人设置</span>
            </a>
            <a href="#" class="user-menu-item">
              <i class="fas fa-chart-pie"></i>
              <span>学习统计</span>
            </a>
            <a href="#" class="user-menu-item">
              <i class="fas fa-bookmark"></i>
              <span>学习收藏</span>
            </a>
            <a href="#" class="user-menu-item">
              <i class="fas fa-history"></i>
              <span>全部对话历史</span>
            </a>
            <a href="#" class="user-menu-item" @click="logout">
              <i class="fas fa-sign-out-alt"></i>
              <span>退出登录</span>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 透明顶部边框 -->
      <div class="header">
        <div class="current-topic">{{ currentTopic }}</div>
        <div class="tools">
          <button class="tool-button primary" id="newChatButton" @click="newChat">
            <i class="fas fa-plus"></i>
            <span>创建新会话</span>
          </button>
        </div>
      </div>

      <!-- 聊天内容区域 -->
      <div class="chat-container" id="chatContainer">
        <!-- 动态渲染消息 -->
        <div
            v-for="(message, index) in messages"
            :key="index"
            class="message"
            :class="[
              message.type === 'user' ? 'user-message' :
              message.type === 'system' ? 'system-message' : 'bot-message',
              { 'is-new': message.isNew }
            ]"
        >
          <div class="message-content">
            {{ message.content }}
          </div>
          <div class="message-info">
            <span>{{ message.type === 'user' ? '您' : message.type === 'system' ? '系统' : '助手' }} · {{ message.time }}</span>
            <span v-if="message.agent" class="agent-tag">{{ message.agent }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 可拖动输入框 -->
    <div class="input-fixed-container" id="inputContainer" ref="inputContainer">
      <div class="input-tools">
        <button class="input-tool" title="上传文件" @click="uploadFile">
          <i class="fas fa-paperclip"></i>
        </button>
        <button class="input-tool" title="上传图片" @click="uploadImage">
          <i class="fas fa-image"></i>
        </button>
        <button class="input-tool" title="上传代码" @click="uploadCode">
          <i class="fas fa-code"></i>
        </button>
        <button class="input-tool" title="录音" @click="startRecording">
          <i class="fas fa-microphone"></i>
        </button>
      </div>

      <textarea
          placeholder="请输入您的问题或指令..."
          v-model="inputMessage"
          @keyup.enter="sendMessage"
      ></textarea>

      <button class="input-submit" @click="sendMessage">发送</button>
    </div>
    <!-- 个人信息编辑模态框 -->
    <div class="modal-overlay" v-if="showProfileModal" @click.self="closeProfileModal">
      <div class="profile-modal">
        <div class="modal-header">
          <h3>个人设置</h3>
          <button class="modal-close" @click="closeProfileModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-content">
          <div class="avatar-upload">
            <div class="avatar-preview" :style="{ backgroundImage: `url(${tempAvatarUrl || userInfo?.avatarUrl || defaultAvatar})` }">
              <input type="file" ref="avatarInput" accept="image/*" @change="handleAvatarUpload" style="display: none;">
              <button class="avatar-edit-btn" @click="triggerAvatarUpload">
                <i class="fas fa-camera"></i>
              </button>
            </div>
            <p class="avatar-hint">点击头像可上传新图片</p>
          </div>

          <div class="form-group">
            <label for="nickname">昵称</label>
            <input type="text" id="nickname" v-model="tempUserInfo.nickname" placeholder="请输入您的昵称">
          </div>

          <div class="form-group">
            <label for="bio">个人简介</label>
            <textarea id="bio" v-model="tempUserInfo.bio" placeholder="这个人好懒，什么也不写(￢︿̫̿￢☆)"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="school">学校</label>
              <input type="text" id="school" v-model="tempUserInfo.school" placeholder="请输入您的学校">
            </div>

            <div class="form-group">
              <label for="major">专业</label>
              <input type="text" id="major" v-model="tempUserInfo.major" placeholder="请输入您的专业">
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="closeProfileModal">取消</button>
          <button class="btn-save" @click="saveProfile">保存更改</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'FunctionPage',
  props: ['userId'],
  data() {
    return {
      isSidebarCollapsed: false,
      isMobileMenuOpen: false,
      showUserCard: false,
      activeMenu: 'chat',
      activeHistoryIndex: 0,
      currentTopic: '软件需求规格说明书',
      inputMessage: '',
      showProfileModal: false,
      tempUserInfo: {
        nickname: '',
        bio: '',
        school: '',
        major: '',
        avatarUrl: null
      },
      messages: [
        {
          type: 'bot',
          content: '欢迎使用SmartSE软件工程课程智能助手！我可以帮助您解答软件工程相关问题，提供课程支持。请问您需要了解什么内容？',
          time: this.getCurrentTime(),
          agent: '通用助手'
        },
        {
          type: 'user',
          content: '请解释一下软件需求规格说明书的主要结构和内容。',
          time: this.getCurrentTime(),
        },
        {
          type: 'bot',
          content: '软件需求规格说明书(SRS)是软件开发过程中非常重要的文档，它详细描述了软件系统的功能、性能和约束条件。一个典型的SRS包含以下主要部分：\n\n1. 前言：包括文档的目的、范围、术语定义、参考文献等。\n2. 总体描述：提供产品的概述、功能、用户特征、约束条件等。\n3. 功能需求：详细描述系统的具体功能要求，通常按照不同功能模块进行组织。\n4. 非功能需求：包括性能、安全性、可用性、可维护性等方面的要求。\n5. 接口需求：描述系统与外部系统、用户的交互接口。\n6. 用例描述：通过用例来描述系统的行为和功能。\n\n您想了解其中任何特定部分的更多详情吗？',
          time: this.getCurrentTime(),
          agent: '概念解释智能体'
        },
        {
          type: 'user',
          content: '功能需求部分通常包含哪些具体内容？',
          time: this.getCurrentTime(),
        },
        {
          type: 'bot',
          content: '功能需求部分是SRS中最核心的内容之一，详细描述系统应该做什么。通常包含以下具体内容：\n\n1. 功能列表：列出系统需要实现的所有功能，并可能按照优先级（如必须实现、重要功能、锦上添花）进行分类。\n\n2. 功能描述：对每个功能进行详细描述，包括：\n   - 功能ID和名称\n   - 功能的详细描述\n   - 输入和输出\n   - 前置条件和后置条件\n   - 功能的优先级\n\n3. 用户操作流程：描述用户如何与系统交互来实现特定功能的步骤。\n\n4. 业务规则：与功能相关的业务规则和约束条件。\n\n5. 异常处理：当出现错误或异常情况时系统应该如何响应。\n\n在您提供的需求文档中，功能需求部分按照不同模块（用户认证与管理、核心问答功能、检索增强功能、多智能体系统、习题解析功能）进行了组织，并使用了三级星号来表示不同优先级，这是一种非常清晰的组织方式。',
          time: this.getCurrentTime(),
          agent: '概念解释智能体'
        }
      ],
      chatHistories: [
        '软件需求规格说明书的结构',
        '敏捷开发与瀑布模型的区别',
        'UML类图如何表示继承关系',
        '软件测试的主要方法',
        '代码重构的最佳实践'
      ],
      isDragging: false,
      startY: 0,
      startHeight: 0,
      userInfo: null,
      tempAvatarUrl: null,
      avatarFile: null,
      defaultAvatar: null,
      isUpdating: false
    }
  },
  mounted() {
    this.setupDragHandlers();
    this.setupClickOutsideHandlers();
    this.scrollToBottom();
    this.loadUserInfo(); // 只调用一次
    this.loadChatHistories();
  },
  methods: {
    getInitial(name) {
      return name.charAt(0).toUpperCase();
    },
    async loadUserInfo() {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          this.$router.push("/Login");
          return;
        }

        // 1. 尝试从API获取用户信息
        const response = await axios.get(`http://localhost:8080/api/user/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          }
        });

        if (response.data.code === 200) {
          const userData = response.data.data;

          // 2. 判断是否是新用户（检查关键字段是否为空）
          const isNewUser = !userData.nickname ||
              !userData.school ||
              !userData.major ||
              !userData.bio;

          // 3. 处理用户数据
          this.userInfo = {
            id: userData.id,
            userId: userData.userId,
            nickname: userData.nickname ||"",
            avatarUrl: userData.avatarUrl || this.defaultAvatar,
            bio: userData.bio ||"",
            school: userData.school || "",
            major: userData.major || "",
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt
          };

          // 4. 更新本地存储和UI
          localStorage.setItem("userInfo", JSON.stringify(this.userInfo));
          this.updateUserCard();

          // 如果是新用户，提示完善信息
          if (isNewUser) {
            this.$message.warning("请完善您的个人信息");
            this.goToProfileSettings(); // 自动打开个人设置模态框
          }
        }
      } catch (error) {
        console.error("获取用户信息出错:", error);
        this.setDefaultUserInfo();
      }
    },
    setDefaultUserInfo() {
      // 从localStorage获取基本信息
      const userInfoStr = localStorage.getItem("userInfo");
      const cached = userInfoStr ? JSON.parse(userInfoStr) : {};

      this.userInfo = {
        nickname: cached.username || "新用户", // 使用用户名作为默认昵称
        bio: "",
        school: "",
        major: "",
        avatarUrl: null,
        ...cached // 保留已存在的属性
      };

      this.updateUserCard();
    },
    updateUserCard() {
      if (!this.userInfo) return;

      // 使用requestAnimationFrame确保DOM更新时机
      requestAnimationFrame(() => {
        // 头像更新（改用更可靠的属性设置方式）
        const avatarElements = document.querySelectorAll('[class*="avatar"]');
        avatarElements.forEach(el => {
          if (this.userInfo.avatarUrl) {
            // 完全替换img的src属性（如果使用img标签）
            if (el.tagName === 'IMG') {
              el.src = `${this.userInfo.avatarUrl.split('?')[0]}?t=${Date.now()}`;
            }
            // 处理背景图方式
            else {
              el.style.backgroundImage = `url('${this.userInfo.avatarUrl}')`;
              el.style.backgroundSize = 'cover';
              el.style.backgroundPosition = 'center';
              el.innerHTML = ''; // 清空可能存在的文字
            }
          } else {
            // 处理默认头像逻辑
            el.style.backgroundImage = 'none';
            const initial = this.userInfo.nickname?.charAt(0) ||
                this.userInfo.username?.charAt(0) || 'U';
            el.textContent = initial.toUpperCase();
          }
        });

        // 用户名更新（更健壮的选择器）
        const nameSelectors = [
          '.user-name',
          '.user-card-info h3',
          '[data-user-name]'
        ].join(',');

        document.querySelectorAll(nameSelectors).forEach(el => {
          el.textContent = this.userInfo.nickname || this.userInfo.username || '用户';
        });

        // 其他信息更新
        const bioSelectors = [
          '.user-bio',
          '.user-card-info p',
          '[data-user-bio]'
        ].join(',');

        document.querySelectorAll(bioSelectors).forEach(el => {
          el.textContent = [
            this.userInfo.bio || '',
            this.userInfo.school || '',
            this.userInfo.major || ''
          ].filter(Boolean).join(' · ');
        });
      });
    },
    async loadChatHistories() {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("userToken");

        const response = await axios.post('http://localhost:8080/api/chat/sessions', {
          userId: parseInt(userId),
          page: 1,
          size: 10
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.code === 200) {
          this.chatHistories = response.data.data || [];
        }
      } catch (error) {
        this.$message.error("加载会话历史失败: " + (error.response?.data?.message || error.message));
      }
    },
    async loadSessionDetails(sessionId) {
      try {
        const userId = localStorage.getItem("userId");
        const response = await axios.post('http://localhost:8080/api/chat/history', {
          userId: userId,
          sessionId: sessionId,
          page: 1,
          size: 50
        });

        if (response.data.code === 200 && response.data.data) {
          this.messages = response.data.data.map(item => ({
            type: item.senderType === 'user' ? 'user' : 'bot',
            content: item.content,
            time: new Date(item.createdAt).toLocaleTimeString(),
            agent: item.agent || '通用助手'
          }));
        }
      } catch (error) {
        console.error("获取会话详情失败:", error);
      }
    },
    goToProfileSettings() {
      this.showProfileModal = true;
      // 复制当前用户信息到临时对象
      this.tempUserInfo = {
        nickname: this.userInfo?.nickname || '',
        bio: this.userInfo?.bio || '',
        school: this.userInfo?.school || '',
        major: this.userInfo?.major || '',
        avatarUrl: this.userInfo?.avatarUrl || null
      };
      this.tempAvatarUrl = this.userInfo?.avatarUrl || null;
      this.avatarFile = null;
    },
    closeProfileModal() {
      this.showProfileModal = false;
    },

    triggerAvatarUpload() {
      this.$refs.avatarInput.click();
    },

// 修改handleAvatarUpload方法，添加压缩逻辑
    async handleAvatarUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      // 验证文件类型和大小
      if (!file.type.match('image.*')) {
        this.$message.error('请选择有效的图片文件');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        this.$message.error('图片大小不能超过2MB');
        return;
      }

      // 压缩图片
      try {
        const compressedFile = await this.compressImage(file);
        this.avatarFile = compressedFile;

        // 创建预览
        const reader = new FileReader();
        reader.onload = (e) => {
          this.tempAvatarUrl = e.target.result;
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('图片压缩失败:', error);
        this.$message.error('图片处理失败');
      }
    },

// 图片压缩方法
    compressImage(file, maxWidth = 800, quality = 0.7) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = Math.min(maxWidth / img.width, 1);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(
                (blob) => resolve(blob),
                file.type,
                quality
            );
          };
        };
        reader.readAsDataURL(file);
      });
    },

    async saveProfile() {
      if (this.isUpdating) return;
      this.isUpdating = true;

      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          this.$router.push("/Login");
          return;
        }

        // 准备更新数据
        const updateData = {
          userId: userId,
          nickname: this.tempUserInfo.nickname,
          bio: this.tempUserInfo.bio,
          school: this.tempUserInfo.school,
          major: this.tempUserInfo.major
        };

        // 如果有新头像文件，将base64编码的字符串传给后端
        if (this.avatarFile) {
          const base64Avatar = await this.readFileAsBase64(this.avatarFile);
          updateData.avatarBase64 = base64Avatar;
          // 确保不发送avatarUrl
          delete updateData.avatarUrl;
        } else if (this.tempUserInfo.avatarUrl) {
          updateData.avatarUrl = this.tempUserInfo.avatarUrl;
          // 确保不发送avatarBase64
          delete updateData.avatarBase64;
        }

        // 直接更新用户信息
        const updateResponse = await axios.put(
            'http://localhost:8080/api/user/profile',
            updateData,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
                'Content-Type': 'application/json'
              }
            }
        );

        if (updateResponse.data.code === 200) {
          this.$message.success('个人信息更新成功');

          this.userInfo = JSON.parse(JSON.stringify({
            ...this.userInfo,
            ...updateResponse.data.data,
            avatarUrl: updateResponse.data.data.avatarUrl
                ? `${updateResponse.data.data.avatarUrl}?t=${Date.now()}`
                : null
          }));

          localStorage.setItem("userInfo", JSON.stringify(this.userInfo));

          // 下一帧再更新 DOM（确保 Vue 已完成渲染）
          this.$nextTick(() => {
            this.updateUserCard();
            this.$forceUpdate(); // 核弹级保障（慎用）
          });

          this.closeProfileModal();
        } else {
          this.$message.error(updateResponse.data.message || '更新失败');
        }
      } catch (error) {
        console.error('保存个人信息出错:', error);
        this.$message.error('保存失败: ' + (error.response?.data?.message || error.message));
      } finally {
        this.isUpdating = false;
      }

    },
    // 新增方法：将文件读取为base64
    readFileAsBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    },
    // 修改退出登录功能
    logout() {
      localStorage.removeItem('userToken')
      localStorage.removeItem('userId');
      localStorage.removeItem('userInfo')
      this.userInfo = null;
      this.$router.push('/')
    },
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    },
    toggleUserCard(event) {
      event.stopPropagation();
      this.showUserCard = !this.showUserCard;
    },
    closeUserCard(event) {
      event.stopPropagation();
      this.showUserCard = false;
    },
    setActiveMenu(menu) {
      this.activeMenu = menu;
      this.currentTopic = this.getMenuTitle(menu);
      if (window.innerWidth <= 768) {
        this.isMobileMenuOpen = false;
      }
    },
    getMenuTitle(menu) {
      const titles = {
        chat: '智能对话',
        knowledge: '知识图谱',
        exercise: '习题解析',
        resource: '课程资源'
      };
      return titles[menu] || '新会话';
    },
    setActiveHistory(index) {
      this.activeHistoryIndex = index;
      this.currentTopic = this.chatHistories[index].title;
      this.loadSessionDetails(this.chatHistories[index].sessionId);

      if (window.innerWidth <= 768) {
        this.isMobileMenuOpen = false;
      }
    },
    newChat() {
      // 先清空消息数组
      this.messages = [];

      // 添加加载状态
      this.messages.push({
        type: 'system',
        content: '正在创建新会话...',
        time: this.getCurrentTime()
      });

      // 模拟异步加载效果
      setTimeout(() => {
        // 移除加载状态
        this.messages = [];

        // 添加欢迎消息，带有动画效果
        this.messages.push({
          type: 'bot',
          content: '欢迎使用SmartSE软件工程课程智能助手！这是一个全新的会话。请问您需要了解什么内容？',
          time: this.getCurrentTime(),
          agent: '通用助手',
          isNew: true  // 标记为新消息，用于特殊样式
        });

        this.currentTopic = '新会话';
        this.activeHistoryIndex = -1;
        this.scrollToBottom();

        // 生成新的会话ID (实际应从API获取)
        const newSessionId = Date.now(); // 临时方案，实际应从API获取
        const newHistoryTitle = `新会话 ${this.getCurrentTime()}`;
        this.chatHistories.unshift(newHistoryTitle);
        this.chatHistories.unshift({
          title: newHistoryTitle,
          sessionId: newSessionId
        });
        this.activeHistoryIndex = 0;

      }, 800); // 800毫秒的延迟模拟加载过程
    },
    async sendMessage() {
      if (this.inputMessage.trim() === '') return;

      // 保存用户消息内容
      const userMessageContent = this.inputMessage;

      // 清空输入框
      this.inputMessage = '';

      // 添加用户消息
      const userMessage = {
        type: 'user',
        content: userMessageContent,
        time: this.getCurrentTime()
      };
      this.messages.push(userMessage);

      // 添加加载中的系统消息
      const loadingMessage = {
        type: 'system',
        content: '正在思考中...',
        time: this.getCurrentTime()
      };
      this.messages.push(loadingMessage);
      this.scrollToBottom();

      try {
        const userId = localStorage.getItem("userId");
        const sessionId = this.activeHistoryIndex >= 0
            ? this.chatHistories[this.activeHistoryIndex].sessionId
            : null;

        // 修改为GET请求，参数通过URL传递
        const response = await axios.get('http://localhost:8080/api/chat/stream_chat', {
          params: {  // 使用params将参数转为查询字符串
            message: userMessageContent,
            userId: userId,
            sessionId: sessionId
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
          }
        });

        // 移除加载消息
        this.messages = this.messages.filter(msg => msg.content !== '正在思考中...');

        if (response.data?.code === 200 && response.data?.data?.answer) {
          // 添加AI回复
          this.messages.push({
            type: 'bot',
            content: response.data.data.answer,
            time: this.getCurrentTime(),
            agent: '通用助手'
          });
        } else {
          console.error("接口返回数据异常:", response.data);
          this.$message.error("获取回答失败: " + (response.data?.message || '未知错误'));
        }
      } catch (error) {
        console.error("完整的错误详情:", error.response?.data);
        alert("提问失败: " + (error.response?.data?.message || error.message));

        // 移除加载消息并显示错误消息
        this.messages = this.messages.filter(msg => msg.content !== '正在思考中...');
        this.messages.push({
          type: 'system',
          content: '请求失败: ' + (error.response?.data?.message || error.message),
          time: this.getCurrentTime()
        });
      } finally {
        this.scrollToBottom();
      }
    },
    getCurrentTime() {
      const now = new Date();
      return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    },
    uploadFile() {
      // 文件上传逻辑
      console.log('上传文件');
    },
    uploadImage() {
      // 图片上传逻辑
      console.log('上传图片');
    },
    uploadCode() {
      // 代码上传逻辑
      console.log('上传代码');
    },
    startRecording() {
      // 录音逻辑
      console.log('开始录音');
    },
    setupDragHandlers() {
      const inputContainer = this.$refs.inputContainer;
      const chatContainer = this.$refs.chatContainer;

      if (!inputContainer) return;

      // 创建拖动条元素
      const dragHandle = document.createElement('div');
      dragHandle.style.height = '10px';
      dragHandle.style.width = '100%';
      dragHandle.style.position = 'absolute';
      dragHandle.style.top = '0';
      dragHandle.style.cursor = 'ns-resize';
      dragHandle.style.zIndex = '10';
      inputContainer.prepend(dragHandle);

      // 拖动开始
      dragHandle.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.startY = e.clientY;
        this.startHeight = parseInt(window.getComputedStyle(inputContainer).height, 10);
        e.preventDefault();
      });

      // 拖动过程
      document.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;

        const deltaY = this.startY - e.clientY;
        const newHeight = this.startHeight + deltaY;

        // 限制最小和最大高度
        if (newHeight > 80 && newHeight < 300) {
          inputContainer.style.height = newHeight + 'px';
          if (chatContainer) {
            chatContainer.style.marginBottom = (newHeight + 20) + 'px';
          }
        }
      });

      // 拖动结束
      document.addEventListener('mouseup', () => {
        this.isDragging = false;
      });

      // 触摸设备支持
      dragHandle.addEventListener('touchstart', (e) => {
        this.isDragging = true;
        this.startY = e.touches[0].clientY;
        this.startHeight = parseInt(window.getComputedStyle(inputContainer).height, 10);
        e.preventDefault();
      });

      document.addEventListener('touchmove', (e) => {
        if (!this.isDragging) return;

        const deltaY = this.startY - e.touches[0].clientY;
        const newHeight = this.startHeight + deltaY;

        if (newHeight > 80 && newHeight < 300) {
          inputContainer.style.height = newHeight + 'px';
          if (chatContainer) {
            chatContainer.style.marginBottom = (newHeight + 20) + 'px';
          }
        }
      });

      document.addEventListener('touchend', () => {
        this.isDragging = false;
      });
    },
    setupClickOutsideHandlers() {
      // 点击用户卡片外部关闭卡片
      document.addEventListener('click', (e) => {
        const userCard = document.getElementById('userCard');
        const userProfileButton = document.getElementById('userProfileButton');

        if (this.showUserCard &&
            userCard &&
            !userCard.contains(e.target) &&
            userProfileButton &&
            !userProfileButton.contains(e.target)) {
          this.showUserCard = false;
        }

        // 移动端点击侧边栏外部关闭菜单
        if (window.innerWidth <= 768 &&
            this.isMobileMenuOpen &&
            document.getElementById('sidebar') &&
            !document.getElementById('sidebar').contains(e.target) &&
            e.target !== document.getElementById('mobileMenuToggle')) {
          this.isMobileMenuOpen = false;
        }
      });
    },
    scrollToBottom() {
      const chatContainer = this.$refs.chatContainer;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }
}
</script>

<style>
:root {
  --primary-color: #4361ee;
  --secondary-color: #3f37c9;
  --accent-color: #4895ef;
  --light-color: #f8f9fa;
  --dark-color: #212529;
  --mid-gray: #6c757d;
  --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
  background-color: var(--light-color);
  color: var(--dark-color);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow-x: hidden;
}

/* 侧边栏样式 */
.sidebar {
  width: 280px;
  background-color: white;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: fixed;
  transition: width 0.3s ease;
  z-index: 10;
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar.collapsed .logo h1,
.sidebar.collapsed .logo span,
.sidebar.collapsed .menu-item span,
.sidebar.collapsed .user-info,
.sidebar.collapsed .menu-section h3,
.sidebar.collapsed .chat-history,
.sidebar.collapsed .chat-history-item span {
  display: none;
}

.sidebar.collapsed .menu-item {
  justify-content: center;
  padding: 12px;
}

.sidebar.collapsed .menu-item i {
  margin-right: 0;
  font-size: 20px;
}

.sidebar.collapsed .user-profile {
  justify-content: center;
  padding: 15px 0;
}

.sidebar.collapsed .user-avatar {
  margin-right: 0;
  width: 40px;
  height: 40px;
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid var(--light-color);
  position: relative;
}

.logo h1 {
  font-size: 24px;
  color: var(--primary-color);
  transition: opacity 0.3s ease;
}

.logo span {
  font-size: 14px;
  color: var(--mid-gray);
  transition: opacity 0.3s ease;
}

.toggle-sidebar {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--mid-gray);
  font-size: 16px;
}

.menu {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.menu-section {
  margin-bottom: 20px;
}

.menu-section h3 {
  padding: 10px 20px;
  font-size: 14px;
  color: var(--mid-gray);
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: opacity 0.3s ease;
}

.menu-item {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

.menu-item:hover {
  background-color: rgba(67, 97, 238, 0.1);
}

.menu-item.active {
  background-color: rgba(67, 97, 238, 0.1);
  border-left: 4px solid var(--primary-color);
  color: var(--primary-color);
}

.menu-item.active i {
  color: var(--primary-color);
}

.menu-item i {
  margin-right: 12px;
  font-size: 18px;
  color: var(--mid-gray);
}

.menu-item span {
  font-size: 16px;
  transition: opacity 0.3s ease;
}

.chat-history {
  max-height: 300px;
  overflow-y: auto;
}

.chat-history-item {
  padding: 10px 20px;
  font-size: 14px;
  border-left: 4px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.2s;
}

.chat-history-item:hover {
  background-color: rgba(67, 97, 238, 0.1);
}

.chat-history-item.active {
  border-left-color: var(--primary-color);
  background-color: rgba(67, 97, 238, 0.1);
  color: var(--primary-color);
}

.user-profile {
  padding: 15px 20px;
  display: flex;
  align-items: center;
  border-top: 1px solid var(--light-color);
  cursor: pointer;
  position: relative;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 12px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: bold;
}

.user-status {
  font-size: 12px;
  color: var(--mid-gray);
}

/* 用户信息卡片样式 */
.user-card {
  position: absolute;
  bottom: 80px;
  left: 20px;
  width: 280px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  z-index: 100;
  animation: slide-up 0.3s ease-out;
}

@keyframes slide-up {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.user-card-header {
  padding: 15px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--light-color);
  position: relative;
}

.user-card-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 12px;
  font-size: 18px;
}

.user-card-info h3 {
  margin: 0;
  font-size: 18px;
}

.user-card-info p {
  margin: 5px 0 0;
  font-size: 14px;
  color: var(--mid-gray);
}

.user-card-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--mid-gray);
  font-size: 16px;
}

.user-card-content {
  padding: 15px;
}

.user-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  width: 30%;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--primary-color);
}

.stat-label {
  font-size: 12px;
  color: var(--mid-gray);
}

.user-menu {
  display: flex;
  flex-direction: column;
}

.user-menu-item {
  padding: 10px 15px;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--dark-color);
  border-radius: 5px;
  transition: all 0.2s;
}

.user-menu-item:hover {
  background-color: var(--light-color);
}

.user-menu-item i {
  margin-right: 10px;
  width: 20px;
  text-align: center;
  color: var(--primary-color);
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-left: 280px;
  transition: margin-left 0.3s ease;
  padding-top: 70px;
}

.sidebar.collapsed ~ .main-content {
  margin-left: 70px;
}

.sidebar.collapsed ~ .main-content .header {
  left: 70px; /* 侧边栏折叠时的位置 */
}

/* 透明顶部边框 */
.header {
  padding: 15px 20px;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;/* 提高z-index确保在最上层 */
  position:  fixed;
  top: 0;
  left: 280px; /* 与侧边栏宽度一致 */
  right: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: left 0.3s ease; /* 添加过渡效果 */
}

.current-topic {
  font-size: 16px;
  font-weight: 500;
  color: var(--dark-color);
  text-align: center;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tools {
  display: flex;
  gap: 10px;
  position: absolute;
  right: 20px;
}

.tool-button {
  padding: 8px 12px;
  background-color: var(--light-color);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.tool-button.primary {
  background-color: var(--primary-color);
  color: white;
}

.tool-button:hover {
  background-color: var(--primary-color);
  color: white;
}

/* 聊天内容区域 - 居中显示 */
.chat-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  margin-bottom: 180px; /* 初始为输入框留出空间 */
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 0; /* 移除原有的顶部内边距 */
}

.message {
  margin-bottom: 20px;
  max-width: 70%; /* 使消息框更窄，更居中 */
  width: 100%;
  animation: fade-in 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
}

@keyframes fade-in {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}

.user-message {
  align-items: flex-end;
}

.bot-message {
  align-items: flex-start;
}

.message-content {
  padding: 15px;
  border-radius: 10px;
  box-shadow: var(--shadow);
  position: relative;
  max-width: 80%;
}

.user-message .message-content {
  background-color: var(--primary-color);
  color: white;
  border-bottom-right-radius: 0;
}

.bot-message .message-content {
  background-color: white;
  border-bottom-left-radius: 0;
}

.message-info {
  font-size: 12px;
  margin-top: 5px;
  color: var(--mid-gray);
  display: flex;
  align-items: center;
}

.agent-tag {
  background-color: var(--accent-color);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  margin-left: 5px;
}

.source-link {
  color: var(--primary-color);
  text-decoration: underline;
  cursor: pointer;
  margin-left: 8px;
}

/* 可拖动输入框样式 */
.input-fixed-container {
  position: fixed;
  bottom: 0;
  left: 280px;
  right: 0;
  padding: 15px 20px;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: left 0.3s ease;
  z-index: 5;
  resize: vertical;
  overflow: auto;
  min-height: 120px;
  max-height: 300px;
  cursor: ns-resize;
}

.input-fixed-container::before {
  content: "";
  position: absolute;
  top: 5px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 4px;
  background-color: var(--mid-gray);
  border-radius: 2px;
  opacity: 0.3;
}

.sidebar.collapsed ~ .main-content .input-fixed-container {
  left: 70px;
}

.input-tools {
  display: flex;
  margin-bottom: 8px;
  gap: 10px;
}

.input-tool {
  padding: 6px;
  border-radius: 4px;
  background-color: var(--light-color);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.input-tool:hover {
  background-color: var(--primary-color);
  color: white;
}

.input-fixed-container textarea {
  padding: 10px 15px;
  border-radius: 10px;
  border: 1px solid var(--light-color);
  resize: none;
  flex: 1;
  min-height: 60px;
  font-size: 14px;
  margin-bottom: 8px;
}

.input-fixed-container textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.input-submit {
  padding: 8px 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  align-self: flex-end;
  transition: all 0.2s;
}

.input-submit:hover {
  background-color: var(--secondary-color);
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .sidebar {
    width: 70px;
    overflow: hidden;
  }

  .logo h1, .logo span, .menu-item span, .user-info {
    display: none;
  }

  .menu-item {
    justify-content: center;
    padding: 12px;
  }

  .menu-item i {
    margin-right: 0;
    font-size: 20px;
  }

  .chat-history {
    display: none;
  }

  .user-profile {
    justify-content: center;
  }

  .user-avatar {
    margin-right: 0;
  }

  .main-content {
    margin-left: 70px;
  }

  .input-fixed-container {
    left: 70px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    position: fixed;
    height: 100%;
    z-index: 100;
  }

  .sidebar.active {
    transform: translateX(0);
    width: 280px;
  }

  .sidebar.active .logo h1,
  .sidebar.active .logo span,
  .sidebar.active .menu-item span,
  .sidebar.active .user-info,
  .sidebar.active .menu-section h3,
  .sidebar.active .chat-history,
  .sidebar.active .chat-history-item span {
    display: block;
  }

  .sidebar.active .menu-item {
    justify-content: flex-start;
    padding: 12px 20px;
  }

  .sidebar.active .menu-item i {
    margin-right: 12px;
    font-size: 18px;
  }

  .sidebar.active .user-profile {
    justify-content: flex-start;
    padding: 15px 20px;
  }

  .sidebar.active .user-avatar {
    margin-right: 12px;
  }

  .main-content {
    padding-top: 60px;
  }

  .input-fixed-container {
    left: 0;
  }

  .mobile-menu-toggle {
    display: block;
  }

  .message {
    max-width: 90%;
  }

  .header {
    left:  0;
  }

  .current-topic {
    font-size: 14px;
    margin: 0 40px;
  }

  .tools {
    right: 10px;
  }
}

.mobile-menu-toggle {
  display: none;
  position: fixed;
  top: 15px;
  left: 15px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 18px;
  z-index: 101;
  cursor: pointer;
}
/* 新消息动画效果 */
@keyframes pop-in {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.message.is-new {
  animation: pop-in 0.4s ease-out;
}

/* 系统加载消息样式 */
.message.system-message .message-content {
  background-color: #f0f0f0;
  color: #666;
  font-style: italic;
}

/* 过渡效果 */
.message {
  transition: all 0.3s ease;
}
/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  animation: fade-in 0.3s ease-out;
}

.profile-modal {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: slide-up 0.3s ease-out;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid var(--light-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 18px;
  color: var(--dark-color);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: var(--mid-gray);
  font-size: 18px;
  cursor: pointer;
  transition: color 0.2s;
}

.modal-close:hover {
  color: var(--primary-color);
}

.modal-content {
  padding: 20px;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: var(--primary-color);
  background-size: cover;
  background-position: center;
  position: relative;
  margin-bottom: 10px;
  border: 3px solid white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.avatar-edit-btn {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.avatar-edit-btn:hover {
  background-color: var(--secondary-color);
  transform: scale(1.1);
}

.avatar-hint {
  font-size: 12px;
  color: var(--mid-gray);
  margin: 0;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--dark-color);
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid var(--light-color);
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-row .form-group {
  flex: 1;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid var(--light-color);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel,
.btn-save {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background-color: var(--light-color);
  color: var(--mid-gray);
  border: none;
}

.btn-cancel:hover {
  background-color: #e9ecef;
}

.btn-save {
  background-color: var(--primary-color);
  color: white;
  border: none;
}

.btn-save:hover {
  background-color: var(--secondary-color);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .profile-modal {
    width: 95%;
  }

  .form-row {
    flex-direction: column;
    gap: 15px;
  }
}
</style>