<template>
  <section class="hero">
    <div class="container" style="display: flex; align-items: center;">
      <div class="hero-content">
        <h1 class="hero-title">基于大语言模型的<br><span class="typing">软件工程智能助手</span></h1>
        <p class="hero-text">SmartSE是您24小时AI导师，通过前沿AI技术赋能软件工程教学，打造个性化、交互式的学习支持平台。轻松理解复杂概念，获取即时帮助，弥合理论与实践的鸿沟。</p>
        <div class="hero-buttons">
          <a href="#cta" class="btn btn-primary">开始体验</a>
          <a href="#features" class="btn btn-outline">了解更多</a>
        </div>
      </div>
      <div class="hero-image">
        <ChatDemo />
      </div>
    </div>
  </section>
</template>

<script>
import ChatDemo from './ChatDemo.vue';

export default {
  name: 'HeroSection',
  components: {
    ChatDemo
  },
  mounted() {
    // 平滑滚动
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
.hero {
  padding-top: 120px;
  padding-bottom: 80px;
  display: flex;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(67, 97, 238, 0.05) 0%, rgba(58, 12, 163, 0.05) 100%);
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
}

.hero-text {
  font-size: 18px;
  margin-bottom: 30px;
  color: #555;
}

.hero-buttons {
  display: flex;
  gap: 15px;
}

.hero-image {
  flex: 1;
  position: relative;
}

.typing {
  overflow: hidden;
  border-right: 2px solid var(--primary);
  white-space: nowrap;
  animation: typing 4s steps(40, end), blink-caret 0.75s step-end infinite;
  display: inline-block;
}

@keyframes typing {
  from { width: 0 }
  to { width: 100% }
}

@keyframes blink-caret {
  from, to { border-color: transparent }
  50% { border-color: var(--primary) }
}

@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    text-align: center;
    padding-top: 100px;
  }

  .hero-content {
    padding-right: 0;
    margin-bottom: 40px;
  }

  .hero-buttons {
    justify-content: center;
  }

  .hero-title {
    font-size: 36px;
  }
}
</style>