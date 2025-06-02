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
        <div class="avatar-container" v-if="message.type === 'bot'">
          <div class="avatar-circle">
            <img src="../assets/img/bot-avatar.png" alt="头像" />
          </div>
        </div>
        <div class="message-content-wrapper">
        <div class="message-content">
          <!-- 使用动态组件渲染Markdown -->
          <div v-if="message.type === 'bot' && message.isStreaming" class="streaming-content" ref="streamingContent">
          <!-- 流式响应时直接显示原始内容 -->
            <!-- 修改流式内容显示，添加基本Markdown支持 -->
            <div class="markdown-body" v-html="sanitizeHtml(processStreamingContent(message.content))"></div>
          <!-- 流式加载指示器 -->
          <div class="streaming-indicator">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
          </div>
          <div v-else>
            <template v-for="(block, bIdx) in renderMarkdownBlocks(message.content)" :key="bIdx">
              <!-- 普通 Markdown 内容 -->
              <div v-if="block.type === 'html'" class="markdown-body" v-html="block.content"/>

              <!-- 代码块 -->
              <EnhancedCodeBlock
                  v-else-if="block.type === 'code'"
                  :code="block.code"
                  :language="block.language"
              />
              </template>
          </div>
        </div>
        <div class="message-info" v-if="message.content != null">
          <span>{{ message.type === 'user' ? '您' : message.type === 'system' ? '系统' : '' }} {{ message.time }}</span>
          <span v-if="message.agent" class="agent-tag">{{ message.agent }}</span>
        </div>
      </div>
      </div>
    </div>

    <!-- 输入框部分 - 只在有会话时显示 -->
    <div v-if="chatHistories.length > 0" class="input-fixed-container" id="inputContainer" @mousedown="handleDragStart" ref="inputContainer" >
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
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import EnhancedCodeBlock from './markdown/EnhancedCodeBlock.vue';
import MarkdownIt from 'markdown-it'
import container from 'markdown-it-container'
import taskLists from 'markdown-it-task-lists'
import mathjax3 from 'markdown-it-mathjax3'
import botAvatar from '../assets/img/bot-avatar.png'
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  xhtmlOut: false,  // 改为 false 以避免干扰公式
  quotes: '""\'\''  // 修改引号配置
}).use(mathjax3, {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true
  },
  options: {
    skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
  }
})
    .use(container, 'info')
    .use(taskLists, { enabled: true });
marked.setOptions({
  gfm: true,
  breaks: true,
  tables: true,//启用表格支持
  mangle: false,    // 不转义特殊字符
  headerIds: false,  // 禁用自动生成的标题ID
  highlight: (code, lang) => {
    const validLang = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(validLang, code).value;
  }
});
export default {
  name: 'ChatContainer',
  data() {
    return {
      botAvatar:botAvatar,
      dragging: false,
      startY: 0,
      startHeight: 0
    }
  },
  components: {
    EnhancedCodeBlock
  },
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
  methods: {
    handleDragStart(e) {
      this.dragging = true;
      this.startY = e.clientY;
      this.startHeight = this.$refs.inputContainer.offsetHeight;
      document.addEventListener('mousemove', this.handleDragMove);
      document.addEventListener('mouseup', this.handleDragEnd);
    },
    handleDragMove(e) {
      if (!this.dragging) return;
      const deltaY = this.startY - e.clientY;
      const newHeight = this.startHeight + deltaY;
      this.$refs.inputContainer.style.height = `${Math.max(120, Math.min(300, newHeight))}px`;
    },
    handleDragEnd() {
      this.dragging = false;
      document.removeEventListener('mousemove', this.handleDragMove);
      document.removeEventListener('mouseup', this.handleDragEnd);
    },
    renderMarkdownBlocks(content, isStreaming = false) {
      const protectedContent = content
          // 保护显示公式 \[...\]
          .replace(/\\\[([\s\S]*?)\\\]/g, (match, p1) => {
            return `<span class="math-raw display">\\[${p1}\\]</span>`;
          })
          // 保护行内公式 \(...\)
          .replace(/\\\(([\s\S]*?)\\\)/g, (match, p1) => {
            return `<span class="math-raw inline">\\(${p1}\\)</span>`;
          })
          // 保护传统格式 $$...$$ 和 $...$
          .replace(/\$\$([\s\S]*?)\$\$/g, (match, p1) => {
            return `<span class="math-raw display">$$${p1}$$</span>`;
          })
          .replace(/\$([^\$]*?)\$/g, (match, p1) => {
            return `<span class="math-raw inline">$${p1}$</span>`;
          });
      if (isStreaming) {
        const preservedContent = content
            .replace(/\$\$(.*?)\$\$/gs, '<span class="math-raw">$$$1$$</span>')
            .replace(/\\\((.*?)\\\)/gs, '<span class="math-raw">\\($1\\)</span>');
        // 流式响应时直接显示原始内容，但保留基本格式处理
        return [{
          type: 'html',
          content: this.sanitizeHtml(md.renderInline(preservedContent))
        }];
      }
      const tokens = md.parse(content || '', {});
      console.log("解析后的Tokens:", tokens); // 调试输出
      const blocks = [];
      let htmlTokens = [];

      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (token.type === 'fence') {
          if (htmlTokens.length) {
            blocks.push({
              type: 'html',
              content: this.sanitizeHtml(md.renderer.render(htmlTokens, md.options, {}))
            });
            htmlTokens = [];
          }
          blocks.push({
            type: 'code',
            language: token.info.trim(),
            code: token.content
          });
        } else {
          htmlTokens.push(token);
        }
      }

      if (htmlTokens.length) {
        blocks.push({
          type: 'html',
          content: this.sanitizeHtml(md.renderer.render(htmlTokens, md.options, {}))
        });
      }

      // 确保 MathJax 渲染
      this.$nextTick(() => {
        this.renderMathJax();
      });

      return blocks;
    },
    // 添加流式内容处理方法
    processStreamingContent(content) {
      // 先保护所有数学公式
      let processed = content
          .replace(/\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)|\$\$([\s\S]*?)\$\$|\$([^\$]*?)\$/g, (match) => {
            return `<span class="math-protected">${match}</span>`;
          });

      // 然后处理换行等基本格式
      processed = processed.replace(/\n/g, '<br>');

      // 最后恢复保护的公式
      processed = processed.replace(/<span class="math-protected">(.*?)<\/span>/g, (match, p1) => {
        return p1; // 保留原始公式格式
      });

      return processed;
  },
    // 渲染Markdown内容
    renderMathJax() {
      if (!window.MathJax || this.renderingMathJax) return;

      this.renderingMathJax = true;
      console.log('开始渲染 MathJax');

      // 清除之前的渲染
      if (window.MathJax.typesetClear) {
        window.MathJax.typesetClear();
      }

      // 使用 Promise 链确保顺序执行
      Promise.resolve()
          .then(() => {
            return window.MathJax.typesetPromise()
                .catch(err => {
                  console.error('MathJax 第一次渲染失败:', err);
                  // 延迟后重试一次
                  return new Promise(resolve => setTimeout(resolve, 500))
                      .then(() => window.MathJax.typesetPromise());
                });
          })
          .then(() => {
            console.log('MathJax 渲染完成');
          })
          .catch(err => {
            console.error('MathJax 最终渲染失败:', err);
          })
          .finally(() => {
            this.renderingMathJax = false;
          });
    },
    sanitizeHtml(html) {
      return DOMPurify.sanitize(html, {
        ADD_TAGS: ['math', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub', 'mfrac', 'mtable', 'mtr', 'mtd', 'mjx-container', 'mjx-assistive-mml'],
        ADD_ATTR: ['display', 'mathbackground', 'mathcolor', 'mathsize', 'data-mjx-texclass', 'jax', 'chtml', 'data-mjx-math', 'aria-hidden'],
        ALLOW_DATA_ATTR: true,
        FORBID_ATTR: ['style', 'on*'],
        ALLOW_UNKNOWN_PROTOCOLS: true  // 允许 MathJax 的特殊协议
      });
    },
    handleSendMessage() {
      if (this.inputMessage.trim()) {
        this.$emit('send-message');
      }
    },
    scrollToBottom() {
      if (this.$refs.chatContainer) {
        this.$refs.chatContainer.scrollTop = this.$refs.chatContainer.scrollHeight;
      }
      this.$nextTick(() => {
        const container = this.$refs.chatContainer;
        const inputContainer = this.$refs.inputContainer;
        if (container && inputContainer) {
          // 计算输入框的实际高度
          const inputHeight = inputContainer.offsetHeight;
          // 设置CSS变量
          document.documentElement.style.setProperty('--input-height', `${inputHeight}px`);

          // 滚动到底部
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
          });
        }
      });
    }
},
  watch: {
    messages: {
      handler(newVal, oldVal) {
        // 使用防抖防止频繁更新
        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => {
          this.$nextTick(() => {
            this.scrollToBottom();

            // 只有当有新消息时才渲染 MathJax
            if (newVal.length !== oldVal?.length ||
                JSON.stringify(newVal[newVal.length-1]) !==
                JSON.stringify(oldVal[oldVal.length-1])) {
              this.renderMathJax();
            }
          });
        }, 50);
      },
      deep: true,
      immediate:true
    }
  },
  mounted() {
    // 全局错误处理
    window.addEventListener('error', (event) => {
      if (event.message.includes('Maximum call stack size exceeded')) {
        console.error('检测到调用栈溢出，正在恢复...');
        this.recoverFromStackOverflow();
        event.preventDefault();
      }
    });
  },
  updated() {
    console.log("DOM更新完成");
  }
};
</script>

<style>
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
  margin-bottom: calc(var(--input-height) + 20px); /* 使用CSS变量动态计算 */
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  scrollbar-gutter: stable; /* 防止内容抖动 */
  padding-bottom: 70px;
}

.message {
  display: flex;
  margin-bottom: 20px;
  max-width: 85%;
  width: 100%;
  animation: fade-in 0.3s ease-in-out;
  opacity: 1;
  transition: opacity 0.3s ease;
  position: relative;
}
.message-content-wrapper {
  flex: 1;
  min-width: 0;
}

@keyframes fade-in {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}

.user-message {
  flex-direction: row-reverse;
  justify-content: flex-end;
}
.user-message .avatar-container {
  display: none; /* 用户消息不显示头像 */
}
.user-message .message-content-wrapper {
  display: flex;
  flex-direction: column;
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
  /*box-shadow: var(--shadow);阴影删除*/
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
  background-color: #F8F9FA;
  border-bottom-left-radius: 0;
  padding-left: 30px;
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
  min-height: 150px;
  max-height: 300px;
  cursor: ns-resize;
  height: var(--input-height, 120px); /* 默认高度 */
  box-sizing: border-box;
  z-index: 101;
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
  min-height: 40px;
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
    overflow-y: hidden;
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
    width: 100%;
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
}
/* 头像样式 */
.avatar-container {
  flex-shrink: 0;
  margin-right: -10px;
  display: flex;
  align-items: flex-start;
  padding-top: 15px;
  position: relative;
  z-index: 100;
}
.avatar-circle {
  width: 40px;             /* 设置你需要的宽高 */
  height: 40px;
  border-radius: 50%;      /* 圆形 */
  overflow: hidden;        /* 裁剪超出部分 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;       /* 等比例缩放并填充整个区域，可能会裁剪边缘 */
}
@media (max-width: 768px) {

  .avatar-container {
    margin-right: 8px;
  }
}
.bot-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.markdown-body table {
  border-collapse: collapse !important;
  margin: 1em 0 !important;
  width: 100% !important;
  border: 1px solid #dfe2e5 !important;
  display: table !important; /* 确保使用table布局 */
}

.markdown-body table th,
.markdown-body table td {
  border: 1px solid #dfe2e5 !important;
  padding: 6px 13px !important;
  text-align: left !important;
}

.markdown-body table tr {
  background-color: #fff !important;
  border-top: 1px solid #c6cbd1 !important;
}

.markdown-body table tr:nth-child(2n) {
  background-color: #f6f8fa !important;
}

/* MathJax公式样式 */
mjx-container {
  display: inline-block !important;
  opacity: 1 !important;
  visibility: visible !important;
  line-height: normal !important;
  vertical-align: middle !important;
  overflow-x: hidden;
  overflow-y: hidden;
  max-width: fit-content;
}
/* 修正行内公式对齐 */
mjx-container[display="false"] {
  display: inline-block !important;
}

mjx-container[jax="CHTML"][display="true"] {
  display: block;
  margin: 1em 0;
  overflow-x: hidden;
  overflow-y: hidden;
  max-width: fit-content;
}
/* 流式公式的临时样式 */
.math-raw {
  background-color: rgba(0,0,0,0.05);
  border-radius: 3px;
  padding: 0 2px;
  display: inline-block;
}
.math-raw.display {
  display: block;
  text-align: center;
  margin: 1em 0;
  padding: 8px;
}

/* 防止公式换行 */
.mjx-chtml {
  white-space: nowrap;
}

/* 显示公式居中 */
.mjx-chtml[display="true"] {
  margin: 1em 0;
  display: block !important;
  text-align: center;
}

.MathJax {
  color: inherit !important;
  font-size: inherit !important;
}

/* 确保公式在流式响应中也能正确显示 */
.streaming-math {
  display: inline-block;
  visibility: hidden;
}

.streaming-math.rendered {
  visibility: visible;
}
.streaming-content {
  /* 确保流式内容有合适的样式 */
  white-space: pre-wrap;
  word-break: break-word;
}

.streaming-math {
  /* 流式公式的临时样式 */
  display: inline-block;
  background-color: rgba(0,0,0,0.05);
  border-radius: 3px;
  padding: 0 2px;
}

.streaming-math.rendered {
  /* 公式渲染完成后的样式 */
  background-color: transparent;
  padding: 0;
}
</style>