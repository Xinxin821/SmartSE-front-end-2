<template>
  <div class="chat-content-container">
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
          <button class="start-chat-btn" @click="$emit('new-chat')">
            <i class="fas fa-plus"></i>
            开始新对话
          </button>
          <button v-if="showScrollToTop" class="scroll-to-top" @click="scrollToTop">
            <i class="fas fa-arrow-up"></i>
          </button>
          <p class="action-hint">或者从左侧菜单选择其他功能</p>
        </div>
      </div>
    </div>

    <!-- 聊天内容区域 - 只在有会话时显示 -->
    <div v-else class="chat-container" id="chatContainer" ref="chatContainer">
      <!-- 动态渲染消息 -->
      <div v-for="(message, index) in messages"
           :key="index"
           class="message"
           :class="[
          message.type === 'user' ? 'user-message' :
          message.type === 'system' ? 'system-message' : 'bot-message',
          { 'is-new': message.isNew, 'streaming': message.isStreaming }
        ]">
        <div class="message-content">
          <!-- 使用 v-html 渲染 Markdown，注意安全 -->
          <div v-if="message.renderedContent" v-html="message.renderedContent"></div>
          <!-- 纯文本回退 -->
          <div v-else>{{ message.content }}</div>
          <!-- 流式加载指示器 -->
          <div v-if="message.isStreaming" class="streaming-indicator">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>

        <div class="message-info" v-if="message.content != null">
          <span>{{ message.type === 'user' ? '您' : message.type === 'system' ? '系统' : '' }} {{ message.time }}</span>
          <span v-if="message.agent" class="agent-tag">{{ message.agent }}</span>
        </div>
      </div>
    </div>

    <!-- 输入框部分 - 只在有会话时显示 -->
    <div v-if="chatHistories.length > 0" class="input-fixed-container" id="inputContainer" ref="inputContainer">
      <div class="input-tools">
        <button class="input-tool" title="上传文件" @click="$emit('upload-file')">
          <i class="fas fa-paperclip"></i>
        </button>
        <button class="input-tool" title="上传图片" @click="$emit('upload-image')">
          <i class="fas fa-image"></i>
        </button>
        <button class="input-tool" title="上传代码" @click="$emit('upload-code')">
          <i class="fas fa-code"></i>
        </button>
        <button class="input-tool" title="录音" @click="$emit('start-recording')">
          <i class="fas fa-microphone"></i>
        </button>
      </div>

      <textarea
          placeholder="请输入您的问题或指令..."
          :value="inputMessage"
          @input="$emit('update-input', $event.target.value)"
          @keyup.enter="handleSendMessage"
      ></textarea>

      <button class="input-submit" @click="handleSendMessage">
        发送
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatContainer',
  props: {
    chatHistories: {
      type: Array,
      default: () => []
    },
    messages: {
      type: Array,
      default: () => []
    },
    inputMessage: {
      type: String,
      default: ''
    }
  },
  watch: {
    messages: {
      handler() {
        this.scrollToBottom();
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    handleSendMessage() {
      if (this.inputMessage.trim()) {
        this.$emit('send-message');
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.chatContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
          // 添加平滑滚动
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        }
      });
    }
  }
};
</script>

<style scoped>
.chat-content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100vh;
  margin: 0 auto;
  position: relative;
  transition: padding-left 0.3s ease;
}
/* 侧边栏收起时的样式 */
.sidebar-collapsed .chat-content-container {
  padding-left: 70px;
  width: calc(100% - 70px);
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

/* 聊天内容区域样式 */
.chat-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  margin-bottom: 180px; /* 初始为输入框留出空间 */
  display: flex;
  flex-direction: column;
  align-items: center;
  width:100%;
  scrollbar-gutter: stable; /* 防止内容抖动 */
  padding-right: 15px; /* 给滚动条留空间 */
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

.system-message {
  align-items: center;
  max-width: 90%;
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

.system-message .message-content {
  background-color: #f0f0f0;
  color: #666;
  font-style: italic;
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

/* 新消息动画效果 */
.message.is-new {
  animation: pop-in 0.4s ease-out;
}

@keyframes pop-in {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}

/* 流式指示器样式 */
.streaming-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  background-color: var(--primary-color);
  border-radius: 50%;
  opacity: 0.6;
  animation: pulse 1.5s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* 流式消息样式 */
.message.streaming .message-content {
  position: relative;
}

.message.streaming .message-content::after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
  animation: streaming 1.5s infinite;
}

@keyframes streaming {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 输入框样式 */
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
  .chat-content-container {
    max-width: 90%; /* 在小屏幕上缩小最大宽度 */
  }
  .message {
    max-width: 90%;
  }
}

@media (max-width: 768px) {
  .chat-content-container {
    padding-left: 0;
    max-width: 100%;
  }
  .chat-container {
    flex: 1;
    padding: 20px;
    overflow-y: scroll;
    scrollbar-width: thin; /* 细滚动条 */
    margin-bottom: 180px; /* 初始为输入框留出空间 */
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 0; /* 移除原有的顶部内边距 */
  }

  .message {
    max-width: 90%;
  }

  .input-fixed-container {
    left: 70px;
  }
  .input-fixed-container {
    left: 0;
  }

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
}
.sidebar-collapsed .input-fixed-container {
  left: 70px;
  width: calc(100% - 70px);
}

@media (max-width: 768px) {
  .input-fixed-container {
    left: 0;
    width: 100%;
  }
}
.scroll-to-top {
  position: fixed;
  bottom: 100px;
  right: 30px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  border: none;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>