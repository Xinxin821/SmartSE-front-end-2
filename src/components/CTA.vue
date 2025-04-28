<template>
  <section class="cta" id="cta">
    <div class="container">
      <h2 class="cta-title">立即开启智能学习之旅</h2>
      <p class="cta-text">加入SmartSE，体验AI赋能的软件工程学习新模式，提升学习效率，掌握实践技能。</p>
      <a href="#" class="btn btn-primary">免费注册</a>
    </div>
  </section>
</template>

<script>
export default {
  name: 'CTASection'
}
</script>

<style scoped>
.cta {
  padding: 80px 0;
  background-color: white;
  text-align: center;
}

.cta-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 20px;
}

.cta-text {
  font-size: 18px;
  color: #555;
  margin-bottom: 30px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}
</style>