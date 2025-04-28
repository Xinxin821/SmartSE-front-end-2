<template>
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
</template>

<script>
export default {
  name: 'AgentsSection',
  data() {
    return {
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
          title: '软件测试智能体',
          description: '指导测试计划制定、用例设计，分析测试覆盖率和测试报告，提供测试策略建议。'
        }
      ]
    }
  }
}
</script>

<style scoped>
.agents {
  padding: 80px 0;
  background: linear-gradient(135deg, rgba(67, 97, 238, 0.05) 0%, rgba(58, 12, 163, 0.05) 100%);
}

.agent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.agent-card {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  transition: transform 0.3s;
}

.agent-card:hover {
  transform: translateY(-5px);
}

.agent-icon {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(67, 97, 238, 0.1);
  color: var(--primary);
  font-size: 48px;
}

.agent-content {
  padding: 20px;
}

.agent-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
}

.agent-description {
  color: #555;
  font-size: 14px;
}
</style>