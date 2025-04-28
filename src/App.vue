<template>
  <div id="app">
    <AppHeader />
    <main>
      <Hero />
      <Features />
      <Agents />
      <CTA />
    </main>
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from './components/Header.vue';
import Hero from './components/Hero.vue';
import Features from './components/Features.vue';
import Agents from './components/Agents.vue';
import CTA from './components/CTA.vue';
import AppFooter from './components/Footer.vue';

export default {
  name: 'App',
  components: {
    AppHeader,
    Hero,
    Features,
    Agents,
    CTA,
    AppFooter
  }
}
</script>

<style>
/* 全局样式已移至global.css */
</style>