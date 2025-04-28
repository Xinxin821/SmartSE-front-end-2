<template>
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
</template>

<script>
export default {
  name: 'AppFooter',
  data() {
    return {
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
  }
}
</script>

<style scoped>
footer {
  background-color: var(--dark);
  color: white;
  padding: 50px 0 20px;
}

.footer-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
}

.footer-column h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
}

.footer-column ul {
  list-style: none;
}

.footer-column ul li {
  margin-bottom: 10px;
}

.footer-column ul li a {
  color: #aaa;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-column ul li a:hover {
  color: white;
}

.copyright {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
  color: #aaa;
  font-size: 14px;
}
</style>