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
          <!-- 思考内容渲染 -->
          <div v-if="message.type === 'bot' && message.content" class="thinking-content">
            <div v-if="hasReasoningContent(message.content)" class="reasoning-section">
              <div class="reasoning-header">思考过程</div>
              <div class="reasoning-body" v-html="getReasoningContent(message.content)"></div>
            </div>
            <div class="answer-section" v-html="getAnswerContent(message.content)"></div>
          </div>
          <!-- 使用 v-html 渲染 Markdown，注意安全 -->
          <div v-else-if="message.renderedContent" v-html="message.renderedContent"></div>
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
      <!-- 文件预览区域 -->
      <div v-if="previewFiles.length > 0" class="preview-container">
        <div v-for="(file, index) in previewFiles" :key="index" class="preview-item">
          <div class="preview-content">
            <!-- 图片预览 -->
            <img v-if="file.type.startsWith('image/')" :src="file.preview" class="preview-image" />
            <!-- 文件预览 -->
            <div v-else class="preview-file">
              <i class="fas" :class="getFileIcon(file.type)"></i>
              <span class="file-name">{{ file.name }}</span>
            </div>
          </div>
          <button class="remove-preview" @click="removePreview(index)">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div class="input-tools">
        <input
          type="file"
          ref="fileInput"
          style="display: none"
          @change="handleFileUpload"
          multiple
          accept=".txt,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.jpg,.jpeg,.png,.gif"
        />
        <input
          type="file"
          ref="imageInput"
          style="display: none"
          @change="handleImageUpload"
          accept="image/*"
          multiple
        />
        <button class="input-tool" title="上传文件" @click="$refs.fileInput.click()">
          <i class="fas fa-paperclip"></i>
        </button>
        <button class="input-tool" title="上传图片" @click="$refs.imageInput.click()">
          <i class="fas fa-image"></i>
        </button>
        <button class="input-tool" title="上传代码" @click="handleCodeUpload">
          <i class="fas fa-code"></i>
        </button>
        <button class="input-tool" title="录音" @click="handleRecording" :class="{ 'recording': isRecording }">
          <i class="fas fa-microphone"></i>
        </button>
      </div>

      <textarea
          placeholder="请输入您的问题或指令..."
          :value="inputMessage"
          @input="$emit('update-input', $event.target.value)"
          @keyup.enter="handleSendMessage"
          :disabled="isRecording"
      ></textarea>

      <button
          v-if="!isStreaming && !isWaitingForResponse"
          class="input-submit"
          @click="handleSendMessage"
          :disabled="isRecording"
      >
        发送
      </button>
      <button
          v-else
          class="input-submit"
          @click="handleWaitingResponse"
      >
        回复中...
      </button>
    </div>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

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
  data() {
    return {
      isStreaming: false,
      isRecording: false,
      previewFiles: [],
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedFileTypes: [
        'text/plain', 'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/zip', 'application/x-rar-compressed',
        'image/jpeg', 'image/png', 'image/gif'
      ],
      isWaitingForResponse: false
    };
  },
  watch: {
    messages: {
      handler() {
        this.scrollToBottom();
        // 检查是否有消息正在流式加载
        this.isStreaming = this.messages.some(msg => msg.isStreaming);
        // 如果没有消息在流式加载，重置等待状态
        if (!this.isStreaming) {
          this.isWaitingForResponse = false;
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    handleWaitingResponse() {
      // 当点击"回复中..."按钮时显示提示
      ElMessage.warning('请等待当前回复完成后再发送新消息');
    },
    handleSendMessage() {
      if (this.isWaitingForResponse) {
        // 如果正在等待回复，显示提示
        this.$emit('show-error', '请等待当前回复完成后再发送新消息');
        return;
      }

      if (this.inputMessage.trim() || this.previewFiles.length > 0) {
        this.isWaitingForResponse = true; // 设置等待状态
        // 准备发送的数据
        const formData = new FormData();
        formData.append('message', this.inputMessage);
        
        // 添加文件
        this.previewFiles.forEach((file, index) => {
          formData.append(`file${index}`, file);
        });

        // 发送消息事件
        this.$emit('send-message', formData);
        
        // 清空预览文件
        this.previewFiles = [];
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.chatContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },
    handleTerminateConversation() {
      this.$emit('terminate-conversation');
    },
    getFileIcon(fileType) {
      const icons = {
        'text/plain': 'fa-file-alt',
        'application/pdf': 'fa-file-pdf',
        'application/msword': 'fa-file-word',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'fa-file-word',
        'application/vnd.ms-excel': 'fa-file-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'fa-file-excel',
        'application/vnd.ms-powerpoint': 'fa-file-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'fa-file-powerpoint',
        'application/zip': 'fa-file-archive',
        'application/x-rar-compressed': 'fa-file-archive',
        'image/jpeg': 'fa-file-image',
        'image/png': 'fa-file-image',
        'image/gif': 'fa-file-image'
      };
      return icons[fileType] || 'fa-file';
    },
    async handleFileUpload(event) {
      const files = Array.from(event.target.files);
      for (const file of files) {
        if (!this.allowedFileTypes.includes(file.type)) {
          this.$emit('show-error', `不支持的文件类型: ${file.type}`);
          continue;
        }
        if (file.size > this.maxFileSize) {
          this.$emit('show-error', `文件大小超过限制: ${file.name}`);
          continue;
        }
        
        if (file.type.startsWith('image/')) {
          const preview = await this.createImagePreview(file);
          this.previewFiles.push({ ...file, preview });
        } else {
          this.previewFiles.push(file);
        }
      }
      event.target.value = ''; // 清空input，允许重复选择相同文件
    },
    async handleImageUpload(event) {
      const files = Array.from(event.target.files);
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          this.$emit('show-error', `请选择图片文件: ${file.name}`);
          continue;
        }
        if (file.size > this.maxFileSize) {
          this.$emit('show-error', `图片大小超过限制: ${file.name}`);
          continue;
        }
        
        const preview = await this.createImagePreview(file);
        this.previewFiles.push({ ...file, preview });
      }
      event.target.value = '';
    },
    createImagePreview(file) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    },
    removePreview(index) {
      this.previewFiles.splice(index, 1);
    },
    handleCodeUpload() {
      // 触发代码上传事件
      this.$emit('upload-code');
    },
    async handleRecording() {
      if (!this.isRecording) {
        try {
          // 开始录音
          this.isRecording = true;
          this.$emit('start-recording');
        } catch (error) {
          this.$emit('show-error', '无法启动录音功能');
          this.isRecording = false;
        }
      } else {
        // 停止录音
        this.isRecording = false;
        this.$emit('stop-recording');
      }
    },
    // 检查是否包含思考内容
    hasReasoningContent(content) {
      return content.includes('[REASONING_START]') && content.includes('[REASONING_END]');
    },

    // 获取思考内容
    getReasoningContent(content) {
      const startIndex = content.indexOf('[REASONING_START]') + '[REASONING_START]'.length;
      const endIndex = content.indexOf('[REASONING_END]');
      if (startIndex === -1 || endIndex === -1) return '';
      
      const reasoningContent = content.substring(startIndex, endIndex).trim();
      // 移除可能存在的标签
      return DOMPurify.sanitize(marked.parse(reasoningContent.replace(/\[REASONING_START\]|\[REASONING_END\]/g, '')));
    },

    // 获取最终回答内容
    getAnswerContent(content) {
      const endIndex = content.indexOf('[REASONING_END]');
      if (endIndex === -1) return DOMPurify.sanitize(marked.parse(content));
      
      const answerContent = content.substring(endIndex + '[REASONING_END]'.length).trim();
      // 移除可能存在的标签
      return DOMPurify.sanitize(marked.parse(answerContent.replace(/\[REASONING_START\]|\[REASONING_END\]/g, '')));
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
  margin-left: 280px; /* 与侧边栏宽度一致 */
  width: calc(100% - 280px); /* 计算剩余宽度 */
  height: 100vh;
  position: relative;
  transition: margin-left 0.3s ease;
}
/* 侧边栏收起时的样式 */
.sidebar-collapsed .chat-content-container {
  margin-left: 70px;
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
  padding-top: 0; /* 移除原有的顶部内边距 */
}

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
  .message {
    max-width: 90%;
  }
}

@media (max-width: 768px) {
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

.preview-container {
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.preview-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.preview-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-file {
  padding: 10px;
  text-align: center;
}

.preview-file i {
  font-size: 24px;
  color: var(--primary-color);
  margin-bottom: 5px;
}

.file-name {
  font-size: 12px;
  color: var(--mid-gray);
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.remove-preview {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  padding: 0;
}

.remove-preview:hover {
  background: rgba(0,0,0,0.7);
}

.input-tool.recording {
  background: #ff4d4f;
  color: white;
}

.input-tool.recording:hover {
  background: #ff7875;
}

/* 优化输入框样式 */
textarea {
  min-height: 60px;
  max-height: 200px;
  resize: none;
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  transition: all 0.3s ease;
}

textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
  outline: none;
}

textarea:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

/* 思考框样式 */
.message.thinking {
  align-items: flex-start;
}

.message.thinking .message-content {
  background: linear-gradient(135deg, #f6f8fa 0%, #e9ecef 100%);
  border: 1px solid #e1e4e8;
  border-radius: 12px;
  padding: 15px 20px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.message.thinking .message-content::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 15px;
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 8px solid #e1e4e8;
}

.message.thinking .message-content::after {
  content: '';
  position: absolute;
  left: -7px;
  top: 15px;
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 8px solid #f6f8fa;
}

/* 回答框样式 */
.message.answer {
  align-items: flex-end;
}

.message.answer .message-content {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  border-radius: 12px;
  padding: 15px 20px;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.message.answer .message-content::before {
  content: '';
  position: absolute;
  right: -8px;
  top: 15px;
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 8px solid var(--secondary-color);
}

.message.answer .message-content::after {
  content: '';
  position: absolute;
  right: -7px;
  top: 15px;
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-left: 8px solid var(--primary-color);
}

/* 思考框动画 */
@keyframes thinking-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

.message.thinking .message-content {
  animation: thinking-pulse 2s infinite ease-in-out;
}

/* 回答框动画 */
@keyframes answer-slide {
  0% { transform: translateX(20px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

.message.answer .message-content {
  animation: answer-slide 0.3s ease-out;
}

/* 思考框内容样式 */
.message.thinking .message-content p {
  margin: 0;
  color: #586069;
  font-size: 14px;
  line-height: 1.6;
}

/* 回答框内容样式 */
.message.answer .message-content p {
  margin: 0;
  color: white;
  font-size: 14px;
  line-height: 1.6;
}

/* 思考框和回答框的代码块样式 */
.message.thinking .message-content pre,
.message.answer .message-content pre {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  padding: 12px;
  margin: 10px 0;
  overflow-x: auto;
}

.message.answer .message-content pre {
  background: rgba(255, 255, 255, 0.1);
}

/* 思考框和回答框的列表样式 */
.message.thinking .message-content ul,
.message.thinking .message-content ol,
.message.answer .message-content ul,
.message.answer .message-content ol {
  margin: 10px 0;
  padding-left: 20px;
}

.message.thinking .message-content li,
.message.answer .message-content li {
  margin: 5px 0;
}

/* 思考框和回答框的引用样式 */
.message.thinking .message-content blockquote,
.message.answer .message-content blockquote {
  border-left: 4px solid #e1e4e8;
  margin: 10px 0;
  padding: 0 15px;
  color: #586069;
}

.message.answer .message-content blockquote {
  border-left-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.9);
}

/* 思考框和回答框的表格样式 */
.message.thinking .message-content table,
.message.answer .message-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 10px 0;
}

.message.thinking .message-content th,
.message.thinking .message-content td,
.message.answer .message-content th,
.message.answer .message-content td {
  border: 1px solid #e1e4e8;
  padding: 8px;
  text-align: left;
}

.message.answer .message-content th,
.message.answer .message-content td {
  border-color: rgba(255, 255, 255, 0.2);
}

/* 思考框和回答框的链接样式 */
.message.thinking .message-content a,
.message.answer .message-content a {
  color: var(--primary-color);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}

.message.answer .message-content a {
  color: white;
  border-bottom-color: rgba(255, 255, 255, 0.3);
}

.message.thinking .message-content a:hover,
.message.answer .message-content a:hover {
  border-bottom-color: currentColor;
}

/* 思考框和回答框的图片样式 */
.message.thinking .message-content img,
.message.answer .message-content img {
  max-width: 100%;
  border-radius: 6px;
  margin: 10px 0;
}

/* 思考框和回答框的标题样式 */
.message.thinking .message-content h1,
.message.thinking .message-content h2,
.message.thinking .message-content h3,
.message.thinking .message-content h4,
.message.thinking .message-content h5,
.message.thinking .message-content h6,
.message.answer .message-content h1,
.message.answer .message-content h2,
.message.answer .message-content h3,
.message.answer .message-content h4,
.message.answer .message-content h5,
.message.answer .message-content h6 {
  margin: 15px 0 10px;
  color: inherit;
}

/* 思考框和回答框的分割线样式 */
.message.thinking .message-content hr,
.message.answer .message-content hr {
  border: none;
  border-top: 1px solid #e1e4e8;
  margin: 15px 0;
}

.message.answer .message-content hr {
  border-top-color: rgba(255, 255, 255, 0.2);
}

/* 思考内容样式 */
.thinking-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reasoning-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #e9ecef;
}

.reasoning-header {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reasoning-header::before {
  content: '💭';
  font-size: 1rem;
}

.reasoning-body {
  color: #495057;
  font-size: 0.9rem;
  line-height: 1.6;
}

.answer-section {
  color: inherit;
  padding-left: 1rem;
}

/* 思考内容中的代码块样式 */
.reasoning-body pre {
  background: #f1f3f5;
  border-radius: 6px;
  padding: 1rem;
  margin: 0.5rem 0;
  overflow-x: auto;
}

.reasoning-body code {
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
}

/* 思考内容中的列表样式 */
.reasoning-body ul,
.reasoning-body ol {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.reasoning-body li {
  margin: 0.25rem 0;
}

/* 思考内容中的引用样式 */
.reasoning-body blockquote {
  border-left: 4px solid #dee2e6;
  margin: 0.5rem 0;
  padding: 0.5rem 1rem;
  color: #6c757d;
  background: #f8f9fa;
}

/* 思考内容中的表格样式 */
.reasoning-body table {
  border-collapse: collapse;
  width: 100%;
  margin: 0.5rem 0;
}

.reasoning-body th,
.reasoning-body td {
  border: 1px solid #dee2e6;
  padding: 0.5rem;
  text-align: left;
}

.reasoning-body th {
  background: #f8f9fa;
  font-weight: 600;
}

/* 思考内容中的链接样式 */
.reasoning-body a {
  color: #22863a;
  text-decoration: none;
}

.reasoning-body a:hover {
  text-decoration: underline;
}

/* 思考内容中的图片样式 */
.reasoning-body img {
  max-width: 100%;
  border-radius: 6px;
  margin: 0.5rem 0;
}

/* 思考内容中的标题样式 */
.reasoning-body h1,
.reasoning-body h2,
.reasoning-body h3,
.reasoning-body h4,
.reasoning-body h5,
.reasoning-body h6 {
  margin: 1rem 0 0.5rem;
  color: #212529;
}

/* 思考内容中的分割线样式 */
.reasoning-body hr {
  border: none;
  border-top: 1px solid #dee2e6;
  margin: 1rem 0;
}
</style>