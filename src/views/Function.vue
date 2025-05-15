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
              :key="history.sessionId"
              class="chat-history-item"
              :class="{ 'active': activeHistoryIndex === index }"
            >
              <div class="history-content" @click="setActiveHistory(index)">
                <div class="history-title">{{ history.title }}</div>
                <div class="history-time">{{ history.time }}</div>
              </div>
              <div class="history-actions">
                <button class="action-btn" @click.stop="handleRename(history)" title="重命名">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn" @click.stop="handleDelete(history)" title="删除">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <div v-if="chatHistories.length === 0" class="no-history">
              <i class="fas fa-comments"></i>
              <p>暂无对话历史</p>
              <button class="create-chat-btn" @click="newChat">
                <i class="fas fa-plus"></i>
                创建新会话
              </button>
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

      <!-- 欢迎页面 - 当没有会话时显示 -->
      <div v-if="chatHistories.length === 0" class="welcome-page">
        <div class="welcome-content">
          <div class="welcome-header">
            <div class="logo-container">
              <i class="fas fa-robot"></i>
              <div class="logo-text">
                <h1>SmartSE</h1>
                <p>智能软件工程助手</p>
              </div>
            </div>
            <p class="welcome-description">
              基于大语言模型的智能助手，为您的软件工程学习提供全方位支持
            </p>
          </div>

         

          <div class="action-section">
            <button class="start-chat-btn" @click="newChat">
              <i class="fas fa-plus"></i>
              开始新对话
            </button>
            <p class="action-hint">或者从左侧菜单选择其他功能</p>
          </div>
        </div>
      </div>

      <!-- 聊天内容区域 - 只在有会话时显示 -->
      <div v-else class="chat-container" id="chatContainer">
        <!-- 动态渲染消息 -->
        <div
        //冲突解决处1
          v-for="(message, index) in messages"
          :key="index"
          class="message"
          :class="[
            message.type === 'user' ? 'user-message' :
            message.type === 'system' ? 'system-message' : 'bot-message',
            { 'is-new': message.isNew },
            { 'loading': message.isLoading }
          ]"
        >
          <div 
            class="message-content"
            :class="{ 'loading': message.isLoading }"
          >
          
            {{ message.content }}
          </div>
          <div class="message-info">
            <span>{{ message.type === 'user' ? '您' : message.type === 'system' ? '系统' : '助手' }} · {{ message.time }}</span>
            <span v-if="message.agent" class="agent-tag">{{ message.agent }}</span>
          </div>
        </div>
      </div>

      <!-- 输入框部分 - 只在有会话时显示 -->
      <div v-if="chatHistories.length > 0" class="input-fixed-container" id="inputContainer" ref="inputContainer">
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
    </div>

    <!-- 重命名对话框 -->
    <div v-if="showRenameDialog" class="dialog-overlay">
      <div class="rename-dialog" @click.stop>
        <div class="dialog-header">
          <h3>重命名会话</h3>
          <button class="dialog-close" @click="cancelRename">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="dialog-content">
          <div class="input-group">
            <label for="sessionTitle">会话名称</label>
            <input 
              id="sessionTitle"
              v-model="newSessionTitle" 
              type="text" 
              placeholder="请输入新的会话名称"
              @keyup.enter="confirmRename"
              @keyup.esc="cancelRename"
              ref="sessionTitleInput"
            >
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="cancelRename">取消</button>
          <button class="btn-confirm" @click="confirmRename">确定</button>
        </div>
      </div>
    </div>

    <!-- 删除对话框 -->
    <div v-if="showDeleteDialog" class="dialog-overlay">
      <div class="delete-dialog" @click.stop>
        <div class="dialog-header">
          <h3>确认删除</h3>
          <button class="dialog-close" @click="cancelDelete">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="dialog-content">
          <p>确定要删除这个会话吗？此操作不可恢复。</p>
        </div>
        <div class="dialog-footer">
          <button class="btn-cancel" @click="cancelDelete">取消</button>
          <button class="btn-confirm" @click="confirmDelete">确定</button>
        </div>
      </div>
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
import { ElMessage } from 'element-plus';

export default {
  name: 'FunctionPage',
  data() {
    return {
      isSidebarCollapsed: false,
      isMobileMenuOpen: false,
      showUserCard: false,
      activeMenu: 'chat',
      activeHistoryIndex: 0,
      currentTopic: '欢迎使用SmartSE系统',
      inputMessage: '',
      //冲突解决处2
      isLoading: false,
      messages: [],
      chatHistories: [],
      userInfo: null,
      showRenameDialog: false,
      showDeleteDialog: false,
      currentRenameSession: null,
      currentDeleteSession: null,
      newSessionTitle: '',
      showProfileModal: false,
      isDragging: false,
      startY: 0,
      startHeight: 0,
      tempAvatarUrl: null,
      avatarFile: null,
      defaultAvatar: null,
      isUpdating: false
      
    }
  },
  beforeRouteEnter(to, from, next) {
    // 路由守卫，确保用户已登录
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("userToken");
    
    if (!userId || !token) {
      next('/login');
    } else {
      next(vm => {
        // 组件实例创建后执行
        vm.initializeComponent();
      });
    }
  },
  methods: {
//冲突解决处3
    showErrorMessage(message) {
      ElMessage.error(message);
    },
    
    showSuccessMessage(message) {
      ElMessage.success(message);
    },
    
    showWarningMessage(message) {
      ElMessage.warning(message);
    },

    async initializeComponent() {
      try {
        await this.loadUserInfo();
        await this.loadChatHistories();
        this.setupDragHandlers();
        this.setupClickOutsideHandlers();
        
        // 移除自动加载欢迎消息的逻辑
        this.scrollToBottom();
      } catch (error) {
        console.error('初始化失败:', error);
        this.showErrorMessage('加载数据失败，请刷新页面重试');
      }
      
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
          
          //冲突解决处4
            this.userInfo = {
              nickname: userData.nickname || "新用户",
              bio: "请完善个人信息",
              school: "",
              major: "",
              avatarUrl: userData.avatarUrl || null
            };
            // this.showWarningMessage("请完善您的个人信息");
          } else {
            this.userInfo = userData;


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

    //冲突解决处5
        if (!userId || !token) {
          this.showWarningMessage("请先登录");
          this.$router.push('/login');
          return;
        }


        const response = await axios.post('http://localhost:8080/api/chat/sessions', {
          userId: userId,
          page: 1,
          size: 10
        });

        if (response.data.code === 200) {
          console.log('Raw chat histories:', response.data.data);
          
          // 确保返回的数据是数组
          const sessions = Array.isArray(response.data.data) ? response.data.data : [];
          
          this.chatHistories = sessions.map(session => ({
            sessionId: session.sessionId || session.id,
            title: session.title || session.sessionTitle || '新会话',
            time: new Date(session.createdAt || session.createTime).toLocaleString(),
            senderType: session.senderType || 'user'
          }));

          console.log('Mapped chat histories:', this.chatHistories);
          
          // 如果有历史记录，加载第一个会话
          if (this.chatHistories.length > 0) {
            this.activeHistoryIndex = 0;
            this.currentTopic = this.chatHistories[0].title || '新会话';
            await this.loadSessionDetails(this.chatHistories[0].sessionId);
          }
        }
      } catch (error) {
        console.error('加载会话历史失败:', error);
        this.showErrorMessage("加载会话历史失败: " + (error.response?.data?.message || error.message));
      }
    },
    async loadSessionDetails(sessionId) {
      try {
        console.log('Loading session details for sessionId:', sessionId);
        
        const response = await axios.post('http://localhost:8080/api/chat/session/load', {
          sessionId: sessionId.toString() // 确保是字符串
        });

        console.log('Session details response:', response.data);

        if (response.data.code === 200) {
          const sessionData = response.data.data;
          
          if (!sessionData) {
            throw new Error('会话数据为空');
          }

          // 更新会话标题
          this.currentTopic = sessionData.sessionTitle || sessionData.title || '新会话';
          
          // 确保 chatMessages 存在且是数组
          const messages = sessionData.chatMessages || [];
          if (!Array.isArray(messages)) {
            console.warn('chatMessages is not an array:', messages);
            this.messages = [];
            return;
          }

          // 转换消息格式并过滤掉系统消息
          this.messages = messages
            .filter(msg => msg.senderType.toLowerCase() !== 'system') // 过滤掉系统消息
            .map(msg => {
              // 根据 senderType 确定消息类型
              let type;
              switch (msg.senderType.toLowerCase()) {
                case 'user':
                  type = 'user';
                  break;
                case 'assistant':
                  type = 'bot';
                  break;
                default:
                  type = 'system';
              }

              return {
                type: type,
                content: msg.content || '',
                time: new Date(msg.createdAt).toLocaleTimeString(),
                agent: type === 'bot' ? '智能助手' : undefined,
                // 添加原始数据，以备需要
                rawData: {
                  id: msg.id,
                  sessionId: msg.sessionId,
                  senderType: msg.senderType,
                  contentType: msg.contentType
                }
              };
            });

          this.scrollToBottom();
        } else {
          throw new Error(response.data.message || '加载会话失败');
        }
      } catch (error) {
        console.error("加载会话详情失败:", error);
        this.showErrorMessage("加载失败: " + (error.response?.data?.message || error.message));
        
        // 如果加载失败，显示一条系统消息
        this.messages = [{
          type: 'system',
          content: '加载会话失败，请重试或创建新会话',
          time: this.getCurrentTime()
        }];
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
      return titles[menu] || '欢迎使用SmartSE系统';
    },
//冲突解决处6
    async setActiveHistory(index) {
      try {
        if (index < 0 || index >= this.chatHistories.length) {
          console.warn('Invalid history index:', index);
          return;
        }

    /*setActiveHistory(index) {
      this.activeHistoryIndex = index;
      this.currentTopic = this.chatHistories[index].title;
      this.loadSessionDetails(this.chatHistories[index].sessionId);*/


        // 如果点击的是当前活动的会话，不需要重新加载
        if (index === this.activeHistoryIndex) {
          console.log('Already on this session, skipping reload');
          return;
        }

        const selectedHistory = this.chatHistories[index];
        if (!selectedHistory || !selectedHistory.sessionId) {
          console.warn('Invalid history data at index:', index);
          return;
        }

        console.log('Switching to session:', selectedHistory);
        
        this.activeHistoryIndex = index;
        this.currentTopic = selectedHistory.title || '新会话';

        // 显示加载中的提示
        this.messages = [{
          type: 'system',
          content: '正在加载会话历史...',
          time: this.getCurrentTime()
        }];

        await this.loadSessionDetails(selectedHistory.sessionId);

        if (window.innerWidth <= 768) {
          this.isMobileMenuOpen = false;
        }
      } catch (error) {
        console.error('切换会话失败:', error);
        this.showErrorMessage('切换会话失败: ' + error.message);
      }
    },
    async newChat() {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          this.showWarningMessage("请先登录");
          return;
        }

        this.messages = [{
          type: 'system',
          content: '正在创建新会话...',
          time: this.getCurrentTime()
        }];

//冲突解决处7
        const response = await axios.post('http://localhost:8080/api/chat/session/create', {
          userId: userId,
          sessionTitle: `新会话 ${this.getCurrentTime()}`
        });

        /*生成新的会话ID (实际应从API获取)
        const newSessionId = Date.now(); // 临时方案，实际应从API获取
        const newHistoryTitle = `新会话 ${this.getCurrentTime()}`;
        this.chatHistories.unshift(newHistoryTitle);
        this.chatHistories.unshift({
          title: newHistoryTitle,
          sessionId: newSessionId
        });
        this.activeHistoryIndex = 0;*/


        if (response.data.code === 200) {
          const sessionId = response.data.data.sessionId;
          localStorage.setItem('currentSessionId', sessionId);
          console.log('Created new session with ID:', sessionId);

          const newSession = {
            sessionId: sessionId,
            title: response.data.data.sessionTitle || `新会话 ${this.getCurrentTime()}`,
            time: this.getCurrentTime(),
            senderType: 'system'
          };

          this.chatHistories.unshift(newSession);
          this.activeHistoryIndex = 0;
          this.currentTopic = newSession.title;

          this.messages = [{
            type: 'bot',
            content: '欢迎使用SmartSE软件工程课程智能助手！这是一个全新的会话。请问您需要了解什么内容？',
            time: this.getCurrentTime(),
            agent: '通用助手',
            isNew: true
          }];

          this.scrollToBottom();
          return true; // 返回成功标志
        } else {
          throw new Error(response.data.message || '创建会话失败');
        }
      } catch (error) {
        console.error("创建新会话失败:", error);
        this.showErrorMessage("创建会话失败: " + (error.response?.data?.message || error.message));
        return false; // 返回失败标志
      }
    },
    async sendMessage() {
      if (this.inputMessage.trim() === '') return;

//冲突解决处8
      let currentSessionId = null;
      if (this.activeHistoryIndex >= 0 && this.chatHistories[this.activeHistoryIndex]) {
        currentSessionId = this.chatHistories[this.activeHistoryIndex].sessionId;
      }
      
      const userMessage = this.inputMessage;
      this.messages.push({
        type: 'user',
        content: userMessage,

      /* 保存用户消息内容
      const userMessageContent = this.inputMessage;

      // 清空输入框
      this.inputMessage = '';

      // 添加用户消息
      const userMessage = {
        type: 'user',
        content: userMessageContent,*/

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

      // 添加一个临时的"正在输入"消息
      this.messages.push({
        type: 'bot',
        content: '正在思考...',
        time: this.getCurrentTime(),
        agent: '智能助手',
        isLoading: true
      });

      this.inputMessage = ''; // 清空输入框
      this.scrollToBottom();
      
      try {
        this.isLoading = true;
        const userId = localStorage.getItem("userId");
//冲突解决处9
        
        let url = `http://localhost:8080/api/chat/stream_chat?message=${encodeURIComponent(userMessage)}&userId=${userId}`;
        
        if (currentSessionId) {
          url += `&sessionId=${currentSessionId}`;
        }

        console.log('Final request URL:', url);
        
        const response = await axios.get(url, {
          responseType: 'text'
        });

        // 移除临时的"正在输入"消息
        this.messages = this.messages.filter(msg => !msg.isLoading);

        // 添加实际的回复消息
        this.messages.push({
          type: 'bot',
          content: response.data,
          time: this.getCurrentTime(),
          agent: '智能助手'
        });
      } catch (error) {
        console.error("发送消息失败:", error);
        this.showErrorMessage("发送失败: " + (error.response?.data || error.message));
        // 移除临时的"正在输入"消息
        this.messages = this.messages.filter(msg => !msg.isLoading);
      } finally {
        this.isLoading = false;

        /*const sessionId = this.activeHistoryIndex >= 0
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
      } finally {*/

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
    },
    async renameSession(sessionId, newTitle) {
      try {
        const response = await axios.post('http://localhost:8080/api/chat/session/rename', {
          sessionId: sessionId.toString(), // 确保是字符串
          sessionTitle: newTitle
        });

        if (response.data.code === 200) {
          const sessionIndex = this.chatHistories.findIndex(s => s.sessionId === sessionId);
          if (sessionIndex !== -1) {
            this.chatHistories[sessionIndex].title = newTitle;
            if (this.activeHistoryIndex === sessionIndex) {
              this.currentTopic = newTitle;
            }
          }
          this.showSuccessMessage('重命名成功');
        } else {
          throw new Error(response.data.message || '重命名失败');
        }
      } catch (error) {
        console.error("重命名会话失败:", error);
        this.showErrorMessage("重命名失败: " + (error.response?.data?.message || error.message));
      }
    },
    async deleteSession(sessionId) {
      try {
        const response = await axios.post('http://localhost:8080/api/chat/session/delete', {
          sessionId: sessionId.toString() // 确保是字符串
        });

        if (response.data.code === 200) {
          const sessionIndex = this.chatHistories.findIndex(s => s.sessionId === sessionId);
          if (sessionIndex !== -1) {
            this.chatHistories.splice(sessionIndex, 1);
            
            if (this.activeHistoryIndex === sessionIndex) {
              if (this.chatHistories.length > 0) {
                this.setActiveHistory(0);
              } else {
                this.messages = [];
                this.currentTopic = '新会话';
                this.activeHistoryIndex = -1;
              }
            } else if (this.activeHistoryIndex > sessionIndex) {
              this.activeHistoryIndex--;
            }
          }
          this.showSuccessMessage('删除成功');
        } else {
          throw new Error(response.data.message || '删除失败');
        }
      } catch (error) {
        console.error("删除会话失败:", error);
        this.showErrorMessage("删除失败: " + (error.response?.data?.message || error.message));
      }
    },
    handleRename(history) {
      this.currentRenameSession = history;
      this.newSessionTitle = history.title;
      this.showRenameDialog = true;
      // 在下一个 tick 后聚焦输入框
      this.$nextTick(() => {
        const input = this.$refs.sessionTitleInput;
        if (input) {
          input.focus();
          input.select(); // 全选文本内容
        }
      });
    },
    async confirmRename() {
      if (!this.newSessionTitle.trim()) {
        this.showErrorMessage('会话名称不能为空');
        return;
      }

      try {
        await this.renameSession(this.currentRenameSession.sessionId, this.newSessionTitle);
        this.showRenameDialog = false;
        this.currentRenameSession = null;
        this.newSessionTitle = '';
      } catch (error) {
        console.error('重命名失败:', error);
      }
    },
    cancelRename() {
      this.showRenameDialog = false;
      this.currentRenameSession = null;
      this.newSessionTitle = '';
    },
    async handleDelete(history) {
      this.currentDeleteSession = history;
      this.showDeleteDialog = true;
    },
    async confirmDelete() {
      try {
        if (this.currentDeleteSession) {
          await this.deleteSession(this.currentDeleteSession.sessionId);
          this.showDeleteDialog = false;
          this.currentDeleteSession = null;
        }
      } catch (error) {
        console.error('删除失败:', error);
      }
    },
    cancelDelete() {
      this.showDeleteDialog = false;
      this.currentDeleteSession = null;
    },
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 4px solid transparent;
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

.history-content {
  flex: 1;
  min-width: 0; /* 确保文本可以正确截断 */
  cursor: pointer;
}

.history-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.chat-history-item:hover .history-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--mid-gray);
  transition: all 0.2s;
  border-radius: 4px;
}

.action-btn:hover {
  color: var(--primary-color);
  background-color: rgba(67, 97, 238, 0.1);
}

//冲突解决处10
.history-title {
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.history-time {
  font-size: 12px;
  color: var(--mid-gray);
}

/* 确保激活状态下的按钮也可见 */
.chat-history-item.active .history-actions {
  opacity: 1;
}

/* 重命名对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rename-dialog {
  background: white;
  width: 400px;
  max-width: 90%;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: dialog-pop 0.3s ease-out;
}

@keyframes dialog-pop {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.dialog-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--dark-color);
  font-weight: 600;
}

.dialog-close {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: var(--mid-gray);
  border-radius: 6px;
  transition: all 0.2s;
}

.dialog-close:hover {
  background-color: #f5f5f5;
  color: var(--dark-color);
}

.dialog-content {
  padding: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 14px;
  color: var(--mid-gray);
  font-weight: 500;
}

.input-group input {
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.input-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
}

.dialog-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel, .btn-confirm {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background-color: #f5f5f5;
  border: none;
  color: var(--mid-gray);
}

.btn-cancel:hover {
  background-color: #ebebeb;
  color: var(--dark-color);
}

.btn-confirm {
  background-color: var(--primary-color);
  border: none;
  color: white;
}

.btn-confirm:hover {
  background-color: var(--secondary-color);
  transform: translateY(-1px);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .rename-dialog {
    width: 90%;
    margin: 20px;
  }
  
  .dialog-header {
    padding: 15px;
  }
  
  .dialog-content {
    padding: 15px;
  }
  
  .dialog-footer {
    padding: 15px;
  }
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
  opacity: 1;
  transition: opacity 0.3s ease;
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
  transition: all 0.3s ease;
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
//冲突合并处12

/* 添加加载动画样式 */
.message-content.loading {
  position: relative;
  min-width: 60px;
}

.message-content.loading::after {
  content: "...";
  position: absolute;
  right: -12px;
  bottom: 0;
  animation: loading-dots 1.5s infinite;
}

@keyframes loading-dots {
  0%, 20% { content: "."; }
  40%, 60% { content: ".."; }
  80%, 100% { content: "..."; }
}

/* 修改消息样式以支持加载状态 */
.message {
  margin-bottom: 20px;
  max-width: 70%;
  width: 100%;
  animation: fade-in 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.message.loading {
  opacity: 0.7;
}

.no-history {
  padding: 40px 20px;
  text-align: center;
  color: var(--mid-gray);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.no-history i.fa-comments {
  font-size: 32px;
  color: var(--light-color);
}

.no-history p {
  font-size: 14px;
  margin: 0;
}

.create-chat-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.create-chat-btn:hover {
  background-color: var(--secondary-color);
  transform: translateY(-1px);
}

.create-chat-btn i {
  font-size: 12px;
}

/* 用户信息样式 */
.user-profile {
  padding: 15px 20px;
  display: flex;
  align-items: center;
  border-top: 1px solid var(--light-color);
  cursor: pointer;
  position: relative;
  background-color: white;
  transition: all 0.2s;
}

.user-profile:hover {
  background-color: rgba(67, 97, 238, 0.05);
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
  font-size: 16px;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--dark-color);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  z-index: 100;
  animation: slide-up 0.3s ease-out;
}

@keyframes slide-up {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.user-card-header {
  padding: 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--light-color);
  position: relative;
}

.user-card-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 15px;
  font-size: 24px;
}

.user-card-info {
  flex: 1;
  min-width: 0;
}

.user-card-info h3 {
  margin: 0;
  font-size: 18px;
  color: var(--dark-color);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-card-info p {
  margin: 0;
  font-size: 14px;
  color: var(--mid-gray);
  line-height: 1.4;
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
  padding: 5px;
  border-radius: 50%;
  transition: all 0.2s;
}

.user-card-close:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--dark-color);
}

.user-card-content {
  padding: 20px;
}

.user-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 10px 0;
  border-bottom: 1px solid var(--light-color);
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--mid-gray);
}

.user-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-menu-item {
  padding: 12px 15px;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--dark-color);
  border-radius: 8px;
  transition: all 0.2s;
}

.user-menu-item:hover {
  background-color: rgba(67, 97, 238, 0.05);
}

.user-menu-item i {
  margin-right: 12px;
  width: 20px;
  text-align: center;
  color: var(--primary-color);
  font-size: 16px;
}

/* 确保在侧边栏折叠时正确显示用户信息 */
.sidebar.collapsed .user-profile {
  padding: 15px 0;
  justify-content: center;
}

.sidebar.collapsed .user-avatar {
  margin-right: 0;
}

.sidebar.collapsed .user-info {
  display: none;
}

/* 确保在移动端正确显示用户信息 */
@media (max-width: 768px) {
  .user-card {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
    width: 90%;
    max-width: 320px;
  }
}

/* 欢迎页面样式 */
.welcome-page {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: calc(100vh - 70px);
}

.welcome-content {
  max-width: 1000px;
  width: 100%;
  padding: 40px;
}

.welcome-header {
  text-align: center;
  margin-bottom: 60px;
}

.logo-container {
  display: inline-flex;
  align-items: center;
  gap: 20px;
  padding: 20px 40px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.logo-container i {
  font-size: 48px;
  color: var(--primary-color);
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.logo-text {
  text-align: left;
}

.logo-text h1 {
  font-size: 36px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.logo-text p {
  font-size: 16px;
  color: var(--mid-gray);
  margin: 5px 0 0;
}

.welcome-description {
  font-size: 18px;
  color: var(--mid-gray);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  margin: 40px 0;
}

.feature-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-icon {
  width: 60px;
  height: 60px;
  border-radius: 15px;
  background: linear-gradient(135deg, rgba(67, 97, 238, 0.1), rgba(63, 55, 201, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-icon i {
  font-size: 24px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.feature-content {
  flex: 1;
}

.feature-content h3 {
  font-size: 20px;
  margin: 0 0 8px;
  color: var(--dark-color);
}

.feature-content p {
  font-size: 14px;
  color: var(--mid-gray);
  margin: 0;
  line-height: 1.5;
}

.feature-arrow {
  color: var(--primary-color);
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.feature-card:hover .feature-arrow {
  opacity: 1;
  transform: translateX(0);
}

.action-section {
  text-align: center;
  margin-top: 40px;
}

.start-chat-btn {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border: none;
  padding: 16px 40px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(67, 97, 238, 0.3);
}

.start-chat-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(67, 97, 238, 0.4);
}

.start-chat-btn i {
  font-size: 14px;
}

.action-hint {
  font-size: 14px;
  color: var(--mid-gray);
  margin-top: 15px;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .features-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .welcome-page {
    padding: 20px;
  }

  .welcome-content {
    padding: 20px;
  }

  .logo-container {
    padding: 15px 25px;
  }

  .logo-text h1 {
    font-size: 28px;
  }

  .welcome-description {
    font-size: 16px;
    padding: 0 20px;
  }

  .feature-card {
    padding: 20px;
  }

  .feature-icon {
    width: 50px;
    height: 50px;
  }

  .feature-content h3 {
    font-size: 18px;
  }
}

/* 删除对话框样式 */
.delete-dialog {
  background: white;
  width: 400px;
  max-width: 90%;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: dialog-pop 0.3s ease-out;
}

.delete-dialog .dialog-content {
  display: flex;
  align-items: center;
  gap: 15px;
  color: var(--dark-color);
}

.delete-dialog .dialog-content::before {
  content: "\f071";
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  font-size: 24px;
  color: #ff9800;
}

.delete-dialog .dialog-content p {
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: var(--dark-color);
}

.delete-dialog .btn-confirm {
  background-color: #dc3545;
  display: flex;
  align-items: center;
  gap: 8px;
}

.delete-dialog .btn-confirm:hover {
  background-color: #c82333;
}

.delete-dialog .btn-confirm::before {
  content: "\f2ed";
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  font-size: 14px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .delete-dialog {
    width: 90%;
    margin: 20px;

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