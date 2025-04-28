<template>
  <header>
    <div class="container header-container">
      <div class="logo">
        <i class="fas fa-robot"></i>
        SmartSE
      </div>
      <nav class="nav-menu">
        <ul>
          <li><a href="#features">功能</a></li>
          <li><a href="#agents">智能体</a></li>
          <li><a href="#cta">立即体验</a></li>
        </ul>
      </nav>
      <a href="#cta" class="btn btn-primary">登录</a>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader'
}
</script>

<style scoped>
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
}

nav ul li a:hover {
  color: var(--primary);
}

@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
}
</style>