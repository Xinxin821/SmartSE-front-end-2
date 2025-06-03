<template>
  <div class="knowledge-container">
    <!-- 搜索区域 -->
    <div class="search-section">
      <h2 class="search-title">
        <i class="fas fa-project-diagram"></i>
        知识图谱探索
      </h2>
      <div class="search-box">
        <input
            type="text"
            class="search-input"
            placeholder="输入关键词探索知识图谱..."
            v-model="searchQuery"
            @keyup.enter="handleSearch"
        >
        <button class="search-btn" @click="handleSearch">探索</button>
      </div>

      <!-- 热词推荐 -->
      <div class="hot-words-section">
        <div class="hot-words-header">
          <div class="hot-words-title">
            <i class="fas fa-fire"></i>
            热门搜索词
          </div>
          <button class="refresh-btn" @click="refreshHotWords">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': isRefreshing }"></i>
            换一换
          </button>
        </div>
        <div class="hot-words-list">
          <div
              class="hot-word"
              v-for="(word, index) in hotWords"
              :key="index"
              @click="selectHotWord(word)"
          >
            {{ word }}
          </div>
        </div>
      </div>
    </div>

    <!-- 知识图谱展示区 -->
    <div class="graph-section">
      <div class="graph-header">
        <h3 class="graph-title">
          <i class="fas fa-network-wired"></i>
          知识图谱可视化
        </h3>
        <div class="graph-tools">
          <button class="graph-tool-btn">
            <i class="fas fa-expand"></i>
            全屏
          </button>
          <button class="graph-tool-btn">
            <i class="fas fa-download"></i>
            导出
          </button>
          <button class="graph-tool-btn">
            <i class="fas fa-cog"></i>
            设置
          </button>
        </div>
      </div>

      <div class="graph-container" ref="graphContainer">
        <!-- 这里将使用JavaScript渲染知识图谱 -->
        <div class="graph-placeholder" v-if="!currentKeyword">
          <div class="graph-placeholder-icon">
            <i class="fas fa-project-diagram"></i>
          </div>
          <div class="graph-placeholder-text">
            输入关键词或点击热门搜索词开始探索知识图谱
          </div>
          <button class="graph-placeholder-btn" @click="randomExplore">
            <i class="fas fa-random"></i>
            随机探索
          </button>
        </div>
        <div v-else class="graph-content">
          <!-- 这里可以放置实际的知识图谱可视化内容 -->
          <div class="simulated-graph">
            <div class="node center-node">{{ currentKeyword }}</div>
            <div
                v-for="(relation, index) in relatedNodes"
                :key="index"
                class="node related-node"
                :style="getNodePosition(index)"
            >
              {{ relation }}
            </div>
          </div>
        </div>
      </div>

      <!-- 节点信息面板 -->
      <div class="node-info-panel" v-if="showNodeInfo">
        <div class="node-info-header">
          <div class="node-info-title">节点信息: {{ currentKeyword }}</div>
          <button class="close-info-btn" @click="closeNodeInfo">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="node-info-content">
          <div class="node-info-property">
            <span class="node-info-label">名称:</span>
            <span class="node-info-value">{{ currentKeyword }}</span>
          </div>
          <div class="node-info-property">
            <span class="node-info-label">类型:</span>
            <span class="node-info-value">概念</span>
          </div>
          <div class="node-info-property">
            <span class="node-info-label">描述:</span>
            <span class="node-info-value">{{ getDescriptionForKeyword(currentKeyword) }}</span>
          </div>
          <div class="node-info-relations">
            <div class="node-info-label">相关概念:</div>
            <div
                class="relation-item"
                v-for="(relation, index) in relatedNodes"
                :key="index"
            >
              {{ relation }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KnowledgeGraph',
  data() {
    return {
      searchQuery: '',
      currentKeyword: '',
      showNodeInfo: false,
      isRefreshing: false,
      hotWords: [
        "软件工程", "设计模式", "UML", "敏捷开发", "测试驱动开发",
        "面向对象", "MVC架构", "微服务"
      ],
      hotWordsPool: [
        "软件工程", "设计模式", "UML", "敏捷开发", "测试驱动开发",
        "面向对象", "MVC架构", "微服务", "DevOps", "持续集成",
        "代码重构", "设计原则", "软件架构", "设计模式", "工厂模式",
        "单例模式", "观察者模式", "策略模式", "装饰器模式", "适配器模式",
        "软件测试", "单元测试", "集成测试", "系统测试", "验收测试",
        "黑盒测试", "白盒测试", "灰盒测试", "测试覆盖率", "代码审查"
      ],
      relatedNodes: []
    }
  },
  methods: {
    // 处理搜索
    handleSearch() {
      if (this.searchQuery.trim()) {
        this.currentKeyword = this.searchQuery.trim();
        this.showNodeInfo = true;
        this.generateRelatedNodes();
        console.log('搜索知识图谱:', this.currentKeyword);
        // TODO: 这里替换为实际的API调用
        // this.fetchKnowledgeGraph(this.currentKeyword);
      }
    },

    // 选择热门词
    selectHotWord(word) {
      this.searchQuery = word;
      this.handleSearch();
    },

    // 刷新热门词
    refreshHotWords() {
      this.isRefreshing = true;

      // 随机选择8个不重复的热词
      const shuffled = [...this.hotWordsPool].sort(() => 0.5 - Math.random());
      this.hotWords = shuffled.slice(0, 8);

      setTimeout(() => {
        this.isRefreshing = false;
      }, 500);
    },

    // 随机探索
    randomExplore() {
      const randomIndex = Math.floor(Math.random() * this.hotWordsPool.length);
      this.searchQuery = this.hotWordsPool[randomIndex];
      this.handleSearch();
    },

    // 关闭节点信息
    closeNodeInfo() {
      this.showNodeInfo = false;
    },

    // 生成相关节点（模拟数据）
    generateRelatedNodes() {
      const relatedMap = {
        "软件工程": ["面向对象", "设计模式", "UML", "敏捷开发", "测试驱动开发"],
        "设计模式": ["工厂模式", "单例模式", "观察者模式", "策略模式", "装饰器模式"],
        "UML": ["类图", "时序图", "用例图", "活动图", "状态图"],
        "敏捷开发": ["Scrum", "看板", "用户故事", "冲刺", "每日站会"],
        "测试驱动开发": ["单元测试", "重构", "红绿重构", "测试覆盖率", "持续集成"],
        "面向对象": ["封装", "继承", "多态", "抽象", "SOLID原则"],
        "MVC架构": ["模型", "视图", "控制器", "分离关注点", "前端框架"],
        "微服务": ["Docker", "Kubernetes", "API网关", "服务发现", "分布式系统"]
      };

      this.relatedNodes = relatedMap[this.currentKeyword] || [
        "相关概念1", "相关概念2", "相关概念3", "相关概念4", "相关概念5"
      ];
    },

    // 获取节点位置（模拟布局）
    getNodePosition(index) {
      const angle = (index * (2 * Math.PI / this.relatedNodes.length)) - Math.PI/2;
      const radius = 150;
      return {
        left: `calc(50% + ${radius * Math.cos(angle)}px)`,
        top: `calc(50% + ${radius * Math.sin(angle)}px)`
      };
    },

    // 为关键词生成描述
    getDescriptionForKeyword(keyword) {
      const descriptions = {
        "软件工程": "将系统化、规范化、可量化的方法应用于软件的开发、运行和维护的学科",
        "设计模式": "软件设计中常见问题的典型解决方案",
        "UML": "统一建模语言，用于软件系统可视化、详述、构造和文档化的标准语言",
        "敏捷开发": "以人为核心、迭代、循序渐进的软件开发方法",
        "测试驱动开发": "先写测试用例，再实现功能，最后重构的开发方法",
        "面向对象": "以对象为核心，通过封装、继承、多态等机制组织代码的编程范式",
        "MVC架构": "模型-视图-控制器分层架构，用于分离业务逻辑、数据和界面",
        "微服务": "将单一应用程序划分为一组小型服务的架构风格",
        "DevOps": "开发(Dev)和运维(Ops)的结合，强调自动化与监控",
        "持续集成": "频繁地将代码集成到共享主干并自动构建和测试的开发实践"
      };

      return descriptions[keyword] || "暂无详细描述信息";
    },

    // TODO: 实际API调用方法（示例）
    fetchKnowledgeGraph(keyword) {
      console.log('调用知识图谱API:', keyword);
      // 示例API调用结构：
      /*
      axios.get(`/api/knowledge-graph?keyword=${encodeURIComponent(keyword)}`)
        .then(response => {
          // 处理返回的知识图谱数据
          this.relatedNodes = response.data.relatedNodes;
          // 其他处理...
        })
        .catch(error => {
          console.error('获取知识图谱失败:', error);
          this.$message.error('获取知识图谱数据失败');
        });
      */
    }
  },
  mounted() {
    // 初始化时可以加载一些默认数据
    this.refreshHotWords();
  }
}
</script>

<style scoped>
/* 保持原有样式不变，添加一些额外的样式 */
.knowledge-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  height: calc(100vh - 60px);
  overflow-y: auto;
  scrollbar-width: none; /* Firefox 隐藏滚动条 */
  -ms-overflow-style: none; /* IE/Edge 隐藏滚动条 */
}

/* Chrome/Safari/Opera 隐藏滚动条 */
.knowledge-container::-webkit-scrollbar {
  display: none;
}

.search-section {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 25px;
}

.search-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--dark-color);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-title i {
  color: var(--primary-color);
}

.search-box {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 12px 20px;
  border: 1px solid var(--gray-color);
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(74, 107, 255, 0.2);
}

.search-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0 25px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.search-btn:hover {
  background-color: var(--secondary-color);
  transform: translateY(-2px);
}

.hot-words-section {
  margin-top: 20px;
}

.hot-words-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.hot-words-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--dark-color);
  display: flex;
  align-items: center;
  gap: 8px;
}

.refresh-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s;
}

.refresh-btn:hover {
  color: var(--secondary-color);
}

.hot-words-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hot-word {
  background-color: #f0f4ff;
  color: var(--primary-color);
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.hot-word:hover {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-2px);
}

.graph-section {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 25px;
  height: 600px;
  position: relative;
  overflow: hidden;
}

.graph-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.graph-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--dark-color);
  display: flex;
  align-items: center;
  gap: 10px;
}

.graph-tools {
  display: flex;
  gap: 10px;
}

.graph-tool-btn {
  background-color: var(--light-color);
  color: var(--dark-color);
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.graph-tool-btn:hover {
  background-color: var(--gray-color);
}

.graph-container {
  width: 100%;
  height: calc(100% - 50px);
  border: 1px solid var(--gray-color);
  border-radius: 8px;
  position: relative;
}

.graph-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #a0aec0;
}

.graph-placeholder-icon {
  font-size: 60px;
  margin-bottom: 15px;
  color: var(--gray-color);
}

.graph-placeholder-text {
  font-size: 16px;
  margin-bottom: 20px;
}

.graph-placeholder-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.graph-placeholder-btn:hover {
  background-color: var(--secondary-color);
}

.node-info-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 250px;
  z-index: 10;
}

.node-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--gray-color);
}

.node-info-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--dark-color);
}

.close-info-btn {
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  font-size: 16px;
}

.node-info-content {
  font-size: 14px;
  line-height: 1.6;
}

.node-info-property {
  margin-bottom: 8px;
}

.node-info-label {
  font-weight: 500;
  color: var(--dark-color);
  margin-right: 5px;
}

.node-info-value {
  color: #4a5568;
}

.node-info-relations {
  margin-top: 15px;
}

.relation-item {
  margin-bottom: 5px;
  padding-left: 15px;
  position: relative;
}

.relation-item:before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--primary-color);
}

/* 模拟知识图谱样式 */
.simulated-graph {
  position: relative;
  width: 100%;
  height: 100%;
}

.node {
  position: absolute;
  padding: 10px 15px;
  border-radius: 20px;
  font-size: 14px;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: all 0.3s;
}

.center-node {
  background-color: var(--primary-color);
  color: white;
  top: 50%;
  left: 50%;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(74, 107, 255, 0.3);
}

.related-node {
  background-color: #f0f4ff;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.related-node:hover {
  background-color: var(--primary-color);
  color: white;
  transform: translate(-50%, -50%) scale(1.1);
}

@media (max-width: 768px) {
  .search-box {
    flex-direction: column;
  }

  .search-btn {
    padding: 12px;
  }

  .graph-tools {
    display: none;
  }

  .node-info-panel {
    width: calc(100% - 40px);
  }

  .graph-section {
    height: 500px;
  }
}
</style>