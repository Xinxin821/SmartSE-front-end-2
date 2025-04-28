<template>
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
</template>

<script>
export default {
  name: 'FeaturesSection',
  data() {
    return {
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
      ]
    }
  }
}
</script>

<style scoped>
.features {
  padding: 80px 0;
  background-color: white;
}

.section-title {
  text-align: center;
  margin-bottom: 50px;
  font-size: 36px;
  font-weight: 700;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.feature-card {
  background-color: var(--light);
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.feature-icon {
  width: 60px;
  height: 60px;
  background-color: rgba(67, 97, 238, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: var(--primary);
  font-size: 24px;
}

.feature-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 15px;
}

.feature-description {
  color: #555;
}

@media (max-width: 768px) {
  .section-title {
    font-size: 28px;
  }
}
</style>