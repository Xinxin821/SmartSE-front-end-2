<template>
  <div class="chat-demo">
    <div class="chat-header">
<!--      <img src="/api/placeholder/40/40" alt="SmartSE">-->
      <div>
        <div style="font-weight: 500;">SmartSE 智能助手</div>
        <div style="font-size: 12px;">实时在线</div>
      </div>
    </div>
    <div class="chat-body" ref="chatBody">
      <div v-for="(message, index) in messages" :key="index" :class="['message', `message-${message.type}`]">
        <div class="message-content">
          {{ message.content }}
        </div>
      </div>
    </div>
    <div class="chat-footer">
      <input
          type="text"
          class="chat-input"
          placeholder="输入您的问题..."
          v-model="newMessage"
          @keypress.enter="sendMessage"
      >
      <button class="chat-send" @click="sendMessage">
        <i class="fas fa-paper-plane"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatDemo',
  data() {
    return {
      messages: [
        { type: 'assistant', content: '你好！我是SmartSE，你的软件工程学习助手。有什么我可以帮助你的吗？' },
        { type: 'user', content: '什么是软件需求规格说明书？' },
        { type: 'assistant', content: '软件需求规格说明书(SRS)是一种结构化文档，它详细描述了软件系统的功能和非功能需求。它是开发团队和客户之间的契约，定义了软件应该做什么，而不是如何做。' },
        { type: 'user', content: '如何编写一个好的需求文档？' }
      ],
      newMessage: '',
      responseTimeout: null
    }
  },
  mounted() {
    // 模拟初始回复
    setTimeout(() => {
      this.messages.push({
        type: 'assistant',
        content: '好的需求文档应遵循SMART原则：具体(Specific)、可衡量(Measurable)、可达成(Achievable)、相关性(Relevant)和时限性(Time-bound)。使用清晰的语言，避免歧义，包含功能和非功能需求，并通过用例或用户故事展示系统行为。'
      });
      this.scrollToBottom();
    }, 3000);
  },
  methods: {
    sendMessage() {
      if (this.newMessage.trim() === '') return;

      // 添加用户消息
      this.messages.push({
        type: 'user',
        content: this.newMessage
      });
      this.newMessage = '';
      this.scrollToBottom();

      // 模拟回复
      clearTimeout(this.responseTimeout);
      this.responseTimeout = setTimeout(() => {
        this.messages.push({
          type: 'assistant',
          content: '我理解您的问题，正在思考中...（这是演示响应，实际系统将提供详细解答）'
        });
        this.scrollToBottom();
      }, 1000);
    },
    scrollToBottom() {
      this.$nextTick(() => {
        if (this.$refs.chatBody) {
          this.$refs.chatBody.scrollTop = this.$refs.chatBody.scrollHeight;
        }
      });
    }
  }
}
</script>

<style scoped>
.chat-demo {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  overflow: hidden;
  margin-left: auto;
  position: relative;
  z-index: 2;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
  100% {
    transform: translateY(0px);
  }
}

.chat-header {
  background-color: var(--primary);
  color: white;
  padding: 15px;
  display: flex;
  align-items: center;
}

.chat-header img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 15px;
}

.chat-body {
  padding: 15px;
  height: 350px;
  overflow-y: auto;
}

.message {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.message-user {
  align-items: flex-end;
}

.message-assistant {
  align-items: flex-start;
}

.message-content {
  padding: 10px 15px;
  border-radius: 18px;
  max-width: 70%;
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-user .message-content {
  background-color: var(--primary);
  color: white;
  border-top-right-radius: 4px;
}

.message-assistant .message-content {
  background-color: var(--grey);
  color: var(--dark);
  border-top-left-radius: 4px;
}

.chat-footer {
  padding: 15px;
  border-top: 1px solid var(--grey);
  display: flex;
}

.chat-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid var(--grey);
  border-radius: 25px;
  outline: none;
  font-family: inherit;
}

.chat-send {
  margin-left: 10px;
  background-color: var(--primary);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
}
</style>