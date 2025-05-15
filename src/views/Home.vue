<template>
  <div id="home">
    <!-- 顶部导航栏 -->
    <header>
      <div class="container header-container">
        <div class="logo">
          <i class="fas fa-robot"></i>
          SmartSE
        </div>
        <nav class="nav-menu">
          <ul>
            <li><a href="#features">功能介绍</a></li>
            <li><a href="#agents">智能体</a></li>
            <li><a href="#cta">立即体验</a></li>
          </ul>
        </nav>
        <router-link to="/login" class="btn btn-primary">登录</router-link>
      </div>
    </header>

    <!-- 主内容区 -->
    <main>
      <!-- 英雄区域 -->
      <section class="hero">
        <div class="container hero-container">
          <div class="hero-content">
            <h1 class="hero-title">基于大语言模型的<br>
              <span class="animated-title">软件工程智能助手</span>
            </h1>
            <p class="hero-text">SmartSE是您24小时AI导师，通过前沿AI技术赋能软件工程教学，打造个性化、交互式的学习支持平台。轻松理解复杂概念，获取即时帮助，弥合理论与实践的鸿沟。</p>
            <div class="hero-buttons">
              <a href="#cta" class="btn btn-primary">开始体验</a>
              <a href="#features" class="btn btn-outline">了解更多</a>
            </div>
          </div>

          <!-- 右侧交互面板 -->
          <div class="hero-demo-panel">
            <!-- 智能体交互演示 -->
            <div class="demo-card">
              <div class="demo-header">
                <h3><i class="fas fa-robot"></i> 智能体系统演示</h3>
                <div class="agent-selector">
                  <button
                      v-for="agent in demoAgents"
                      :key="agent.id"
                      @click="selectAgent(agent)"
                      :class="{active: selectedAgent.id === agent.id}"
                  >
                    <i :class="'fas ' + agent.icon"></i>
                    {{ agent.name }}
                  </button>
                </div>
              </div>

              <div class="demo-conversation">
                <div v-for="(msg, index) in demoMessages" :key="index"
                     :class="['demo-message', msg.sender === '您' ? 'user-message' : 'agent-message']">
                  <div class="message-sender">{{ msg.sender }}：</div>
                  <div class="message-content">{{ msg.content }}</div>
                </div>
              </div>

              <div class="quick-questions">
                <p class="quick-title">试试提问：</p>
                <ul>
                  <li v-for="(q, index) in quickQuestions" :key="index"
                      @click="askQuestion(q)">
                    {{ q }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- 知识图谱徽章 -->
            <div class="knowledge-badge">
              <div class="badge-icon">
                <i class="fas fa-project-diagram"></i>
              </div>
              <div class="badge-content">
                <h4>专业知识库支持</h4>
                <p>基于<span>1,200+</span>软件工程知识点构建</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 功能特点区域 -->
      <section class="features" id="features">
        <div class="container">
          <h2 class="section-title">智能化学习体验</h2>
          <div class="feature-grid">
            <div class="feature-card" v-for="(feature, index) in features" :key="index">
              <div class="feature-icon">
                <i :class="feature.icon"></i>
              </div>
              <h3 class="feature-title">{{ feature.title }}</h3>
              <p class="feature-description">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 智能体系统区域 -->
      <section class="agents" id="agents">
        <div class="container">
          <h2 class="section-title">专业智能体系统</h2>
          <div class="agent-grid">
            <div class="agent-card" v-for="(agent, index) in agents" :key="index">
              <div class="agent-icon">
                <i :class="agent.icon"></i>
              </div>
              <div class="agent-content">
                <h3 class="agent-title">{{ agent.title }}</h3>
                <p class="agent-description">{{ agent.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 行动号召区域 -->
      <section class="cta" id="cta">
        <div class="container">
          <h2 class="cta-title">立即开启智能学习之旅</h2>
          <p class="cta-text">加入SmartSE，体验AI赋能的软件工程学习新模式，提升学习效率，掌握实践技能。</p>
          <router-link to="/login" class="btn btn-outline">免费注册</router-link>  <router-link to="/login" class="btn btn-primary">立即登录</router-link>
        </div>
      </section>
    </main>

    <!-- 页脚区域 -->
    <footer>
      <div class="container">
        <div class="footer-container">
          <div class="footer-column" v-for="(column, index) in footerColumns" :key="index">
            <h3>{{ column.title }}</h3>
            <ul>
              <li v-for="(link, linkIndex) in column.links" :key="linkIndex">
                <a href="#">
                  <i v-if="link.icon" :class="link.icon"></i>
                  {{ link.text }}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div class="copyright">
          © 2025 SmartSE. 保留所有权利。
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
  data() {
    return {
      demoAgents: [
        { id: 1, name: '需求分析', icon: 'fa-clipboard-list' },
        { id: 2, name: '软件设计', icon: 'fa-sitemap' },
        { id: 3, name: '代码评审', icon: 'fa-code' }
      ],
      selectedAgent: { id: 1, name: '需求分析', icon: 'fa-clipboard-list' },
      demoMessages: [
        { sender: '系统', content: '请选择智能体类型开始体验' }
      ],
      quickQuestions: [
        '如何编写用户故事？',
        '什么是MVC模式？',
        '黑盒测试有哪些方法？'
      ],
      features: [
        {
          icon: 'fas fa-comments',
          title: '多轮智能对话',
          description: '支持自然语言、图片、代码片段输入，理解上下文，进行连贯的多轮对话交互，提供即时精准的解答。'
        },
        {
          icon: 'fas fa-database',
          title: '检索增强生成',
          description: '基于专业软件工程知识库的RAG技术，结合大模型能力，确保回答的准确性和权威性。'
        },
        {
          icon: 'fas fa-tasks',
          title: '习题解析功能',
          description: '智能识别习题类型，提供分步详细解析，帮助理解解题思路，巩固知识点。'
        }
      ],
      agents: [
        {
          icon: 'fas fa-book',
          title: '概念解释智能体',
          description: '深入浅出地解释软件工程核心概念，提供多角度理解，使抽象理论变得清晰易懂。'
        },
        {
          icon: 'fas fa-clipboard-list',
          title: '需求分析智能体',
          description: '指导需求获取、分析和文档编写，提供需求模板和最佳实践案例分析。'
        },
        {
          icon: 'fas fa-sitemap',
          title: '软件设计智能体',
          description: '帮助理解设计原则和模式，审阅设计方案，提供改进建议和优化方向。'
        },
        {
          icon: 'fas fa-vial',
          title: '测试用例智能体',
          description: '指导测试计划制定、用例设计，分析测试覆盖率和测试报告，提供测试策略建议。'
        },
        {
          icon: 'fas fa-code',
              title: '代码评审智能体',
            description: '智能分析代码质量、检测潜在缺陷并提供优化建议，提升代码健壮性和可维护性，实现高效协同评审。'
        }
      ],
      footerColumns: [
        {
          title: '关于我们',
          links: [
            { text: '产品介绍' },
            { text: '团队成员' },
            { text: '联系我们' }
          ]
        },
        {
          title: '资源中心',
          links: [
            { text: '使用指南' },
            { text: '常见问题' },
            { text: '学习资料' }
          ]
        },
        {
          title: '法律信息',
          links: [
            { text: '隐私政策' },
            { text: '服务条款' },
            { text: '版权声明' }
          ]
        },
        {
          title: '关注我们',
          links: [
            { text: '微信公众号', icon: 'fab fa-weixin' },
            { text: '微博', icon: 'fab fa-weibo' },
            { text: 'GitHub', icon: 'fab fa-github' }
          ]
        }
      ]
    }
  },
  methods: {
    selectAgent(agent) {
      this.selectedAgent = agent;
      this.demoMessages = [
        { sender: '系统', content: `已切换到${agent.name}智能体` },
        { sender: agent.name, content: this.getAgentDemoResponse(agent.id) }
      ];
    },
    askQuestion(question) {
      this.demoMessages.push(
          { sender: '您', content: question },
          { sender: this.selectedAgent.name, content: this.getAnswer(question) }
      );
      // 自动滚动到底部
      this.$nextTick(() => {
        const container = this.$el.querySelector('.demo-conversation');
        container.scrollTop = container.scrollHeight;
      });
    },
    getAgentDemoResponse(agentId) {
      const responses = {
        1: '我是需求分析智能体，可以帮助您编写用户要求、需求规格说明书，以及分析需求合理性。',
        2: '我是软件设计智能体，擅长系统架构设计、设计模式应用和UML图绘制指导。',
        3: '我是代码评审智能体，可以分析代码质量、识别代码错误，并提出改进建议。'
      };
      return responses[agentId] || '您好，请问有什么可以帮助您的？';
    },
    getAnswer(question) {
      const answers = {
        '如何编写用户要求？': '用户故事通常遵循"作为[角色]，我想要[功能]，以便[价值]"的格式。重点描述用户角色、具体需求和业务价值。',
        '什么是MVC模式？': 'MVC是Model-View-Controller的缩写，是一种将应用分为数据模型、用户界面和控制逻辑的设计模式，实现关注点分离。',
        '黑盒测试有哪些方法？': '常见黑盒测试方法包括：等价类划分、边界值分析、决策表测试、状态转换测试和用例测试等。'
      };
      return answers[question] || '这个问题很有趣，我们的智能体可以为您提供详细解答。请注册后体验完整功能。';
    }
  },
  mounted() {
    // 平滑滚动逻辑
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
          behavior: 'smooth'
        });
      });
    });
  }
}
</script>

<style scoped>
/* 全局变量 */
:root {
  --primary: #424EDD;
  --primary-dark: #3239a8;
  --primary-light: #6A5ACD;
  --light: #f8f9fa;
  --dark: #212529;
  --grey: #e9ecef;
  --grey-light: #f5f7fa;
}

/* 基础样式 */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.btn {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 16px;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
  border: 1px solid var(--primary);
}

.btn-primary:hover {
  background-color: var(--primary-dark);
  border-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 78, 221, 0.2);
}

.btn-outline {
  background-color: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
}

.btn-outline:hover {
  background-color: rgba(66, 78, 221, 0.1);
  transform: translateY(-2px);
}

/* 头部样式 */
header {
  background-color: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
}

.logo {
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 24px;
  color: var(--primary);
}

.logo i {
  margin-right: 10px;
  font-size: 28px;
}

nav ul {
  display: flex;
  list-style: none;
}

nav ul li {
  margin-left: 25px;
}

nav ul li a {
  text-decoration: none;
  color: var(--dark);
  font-weight: 500;
  transition: color 0.3s;
  font-size: 16px;
}

nav ul li a:hover {
  color: var(--primary);
}

/* 英雄区域样式 */
.hero {
  padding-top: 120px;
  padding-bottom: 80px;
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(67, 97, 238, 0.05) 0%, rgba(58, 12, 163, 0.05) 100%);
}

.hero-container {
  display: flex;
  align-items: center;
  gap: 40px;
}

.hero-content {
  flex: 1;
  padding-right: 40px;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.2;
  color: var(--dark);
}

.hero-text {
  font-size: 18px;
  margin-bottom: 30px;
  color: #555;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}


@keyframes blink-caret {
  from, to { border-color: transparent }
  50% { border-color: var(--primary) }
}

/* 右侧交互面板样式 */
.hero-demo-panel {
  flex: 0 0 380px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.demo-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.demo-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
}

.demo-header {
  padding: 20px;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: white;
}

.demo-header h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.demo-header i {
  font-size: 20px;
}

.agent-selector {
  display: flex;
  gap: 8px;
}

.agent-selector button {
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.agent-selector button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.agent-selector button.active {
  background: white;
  color: var(--primary);
}

.demo-conversation {
  height: 250px;
  padding: 15px;
  overflow-y: auto;
  background: var(--grey-light);
}

.demo-message {
  margin-bottom: 15px;
  line-height: 1.5;
}

.message-sender {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 14px;
}

.user-message .message-sender {
  color: var(--primary);
}

.agent-message .message-sender {
  color: #666;
}

.message-content {
  background: white;
  padding: 10px 15px;
  border-radius: 8px;
  display: inline-block;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.user-message .message-content {
  background: var(--primary);
  color: white;
  border-top-right-radius: 0;
}

.agent-message .message-content {
  border-top-left-radius: 0;
}

.quick-questions {
  padding: 15px;
  border-top: 1px solid var(--grey);
}

.quick-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.quick-questions ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-questions li {
  background: rgba(66, 78, 221, 0.1);
  color: var(--primary);
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-questions li:hover {
  background: rgba(66, 78, 221, 0.2);
  transform: translateY(-2px);
}

/* 知识图谱徽章 */
.knowledge-badge {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
  transition: transform 0.3s;
}

.knowledge-badge:hover {
  transform: translateY(-5px);
}

.badge-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  margin-right: 15px;
  flex-shrink: 0;
}

.badge-content h4 {
  margin: 0 0 5px 0;
  color: var(--dark);
}

.badge-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.badge-content span {
  color: var(--primary);
  font-weight: 600;
  margin: 0 3px;
}

/* 功能区域样式 */
.features {
  padding: 80px 0;
  background-color: white;
}

.section-title {
  text-align: center;
  margin-bottom: 50px;
  font-size: 36px;
  font-weight: 700;
  color: var(--dark);
  position: relative;
}

.section-title::after {
  content: '';
  display: block;
  width: 60px;
  height: 4px;
  background: linear-gradient(to right, var(--primary), var(--primary-light));
  margin: 15px auto 0;
  border-radius: 2px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.feature-card {
  background-color: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  border: 1px solid rgba(0,0,0,0.05);
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.1);
}

.feature-icon {
  width: 70px;
  height: 70px;
  background-color: rgba(67, 97, 238, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 25px;
  color: var(--primary);
  font-size: 28px;
  transition: transform 0.3s;
}

.feature-card:hover .feature-icon {
  transform: scale(1.1);
}

.feature-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 15px;
  color: var(--dark);
}

.feature-description {
  color: #666;
  line-height: 1.6;
}

/* 智能体区域样式 */
.agents {
  padding: 80px 0;
  background: linear-gradient(135deg, rgba(67, 97, 238, 0.05) 0%, rgba(58, 12, 163, 0.05) 100%);
}

.agent-grid {
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 30px;
}

@media (max-width: 1024px) {
  .agent-grid {
    grid-template-columns: repeat(2, 1fr); /* 中等屏幕下2列 */
  }
}

@media (max-width: 768px) {
  .agent-grid {
    grid-template-columns: 1fr; /* 小屏幕下1列 */
  }
}

.agent-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.agent-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.1);
}

.agent-icon {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(67, 97, 238, 0.1);
  color: var(--primary);
  font-size: 48px;
  transition: all 0.3s;
}

.agent-card:hover .agent-icon {
  background-color: rgba(67, 97, 238, 0.2);
}

.agent-content {
  padding: 25px;
}

.agent-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 15px;
  color: var(--dark);
}

.agent-description {
  color: #666;
  font-size: 15px;
  line-height: 1.6;
}

/* CTA区域样式 */
.cta {
  padding: 100px 0;
  background-color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.cta::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(67, 97, 238, 0.03) 0%, rgba(58, 12, 163, 0.03) 100%);
  z-index: 0;
}

.cta .container {
  position: relative;
  z-index: 1;
}

.cta-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--dark);
}

.cta-text {
  font-size: 18px;
  color: #666;
  margin-bottom: 30px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

/* 页脚样式 */
footer {
  background-color: var(--dark);
  color: white;
  padding: 60px 0 20px;
}

.footer-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
}

.footer-column h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: white;
  position: relative;
  padding-bottom: 10px;
}

.footer-column h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 2px;
  background: var(--primary);
}

.footer-column ul {
  list-style: none;
  padding: 0;
}

.footer-column ul li {
  margin-bottom: 12px;
}

.footer-column ul li a {
  color: #aaa;
  text-decoration: none;
  transition: color 0.3s;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-column ul li a:hover {
  color: white;
}

.footer-column ul li a i {
  width: 20px;
  text-align: center;
}

.copyright {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
  color: #aaa;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .hero-container {
    flex-direction: column;
  }

  .hero-content {
    padding-right: 0;
    margin-bottom: 50px;
    text-align: center;
  }

  .hero-buttons {
    justify-content: center;
  }

  .hero-demo-panel {
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .section-title, .cta-title {
    font-size: 28px;
  }

  .hero-title {
    font-size: 36px;
  }

  .hero-text {
    font-size: 16px;
  }

  .nav-menu {
    display: none;
  }

  .feature-grid, .agent-grid {
    grid-template-columns: 1fr;
  }

  .footer-container {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 28px;
  }

  .hero-buttons {
    flex-direction: column;
  }

  .footer-container {
    grid-template-columns: 1fr;
  }

  .agent-selector {
    flex-direction: column;
  }
}
</style>