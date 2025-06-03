<template>
  <div class="exercise-container">
    <!-- 搜索区域 -->
    <div class="search-section">
      <h2 class="search-title">
        <i class="fas fa-search"></i>
        习题搜索与解析
      </h2>
      <div class="search-box">
        <input
            type="text"
            class="search-input"
            placeholder="输入习题内容或题目编号..."
            v-model="searchQuery"
            @keyup.enter="handleSearch"
        >
        <button class="search-btn" @click="handleSearch">搜索</button>
      </div>
      <div
          class="upload-section"
          id="uploadSection"
          @click="triggerFileInput"
          @dragover.prevent="handleDragOver"
          @dragleave="handleDragLeave"
          @drop.prevent="handleDrop"
      >
        <div class="upload-icon">
          <i :class="uploadIconClass" :style="{color: uploadIconColor}"></i>
        </div>
        <div class="upload-text">{{ uploadText }}</div>
        <div class="upload-hint">支持JPG、PNG格式的习题图片</div>
        <input
            type="file"
            id="fileInput"
            accept="image/*"
            style="display: none;"
            ref="fileInput"
            @change="handleFileChange"
        >
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-section">
      <!-- 习题解析详情 -->
      <div class="exercise-detail">
        <div class="exercise-header">
          <h3 class="exercise-title">{{ currentExercise.title }}</h3>
          <div class="exercise-meta">
            <span class="exercise-tag">{{ currentExercise.category }}</span>
            <span class="exercise-tag">难度: {{ currentExercise.difficulty }}</span>
          </div>
        </div>

        <div class="exercise-content">
          <div class="question-text" v-html="currentExercise.question"></div>

          <img
              v-if="currentExercise.image"
              :src="currentExercise.image"
              class="question-image"
              alt="习题图片"
          >

          <div class="solution-section">
            <h4 class="solution-title">
              <i class="fas fa-lightbulb"></i>
              解析与答案
            </h4>
            <div class="solution-content" v-html="currentExercise.solution"></div>
          </div>
        </div>

        <div class="action-buttons">
          <button class="action-btn save-btn" @click="saveExercise">
            <i class="far fa-bookmark"></i>
            收藏本题
          </button>
          <button class="action-btn practice-btn" @click="getSimilarExercises">
            <i class="fas fa-pen-alt"></i>
            相似练习
          </button>
        </div>
      </div>

      <!-- 相关习题推荐 -->
      <div class="related-exercises">
        <h3 class="related-title">
          <i class="fas fa-link"></i>
          相关习题
        </h3>
        <div class="related-list">
          <div
              class="related-item"
              v-for="(exercise, index) in relatedExercises"
              :key="index"
              @click="selectRelatedExercise(exercise)"
          >
            <div class="related-item-title">{{ exercise.title }}</div>
            <div class="exercise-meta">
              <span class="exercise-tag">{{ exercise.category }}</span>
              <span class="exercise-tag">难度: {{ exercise.difficulty }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExerciseContainer',
  data() {
    return {
      searchQuery: '',
      uploadIconClass: 'fas fa-cloud-upload-alt',
      uploadIconColor: 'var(--primary-color)',
      uploadText: '点击或拖拽图片到此处上传',
      currentExercise: {
        id: 'SE20230501',
        title: '习题解析',
        category: '软件工程',
        difficulty: '中等',
        question: '在软件测试中，什么是边界值分析？请举例说明边界值分析在测试输入字段年龄（有效范围18-60岁）时的应用。',
        solution: `
          <div class="solution-step">
            边界值分析是一种黑盒测试技术，它关注输入域的边界而不是中心。边界值分析基于这样的观察：错误更可能发生在输入域的边界附近而不是中心。
          </div>
          <div class="solution-step">
            对于年龄字段（有效范围18-60岁），边界值分析会测试以下值：
            <ul style="margin-top: 10px; margin-left: 20px;">
              <li>刚好低于最小值：17岁（无效）</li>
              <li>最小值：18岁（有效）</li>
              <li>刚好高于最小值：19岁（有效）</li>
              <li>正常值：30岁（有效）</li>
              <li>刚好低于最大值：59岁（有效）</li>
              <li>最大值：60岁（有效）</li>
              <li>刚好高于最大值：61岁（无效）</li>
            </ul>
          </div>
          <div class="solution-step">
            这种测试方法能有效发现边界条件相关的错误，如错误的比较运算符（如使用了>而不是>=）。
          </div>
        `,
        image: null
      },
      relatedExercises: [
        {
          id: 'SE20230502',
          title: '等价类划分与边界值分析的比较',
          category: '软件工程',
          difficulty: '中等'
        },
        {
          id: 'SE20230503',
          title: '如何为电话号码字段设计测试用例',
          category: '软件测试',
          difficulty: '简单'
        },
        {
          id: 'SE20230504',
          title: '白盒测试中的路径覆盖与边界条件',
          category: '软件质量',
          difficulty: '困难'
        },
        {
          id: 'SE20230505',
          title: '登录表单的测试用例设计',
          category: 'Web开发',
          difficulty: '简单'
        }
      ]
    }
  },
  methods: {
    // 搜索习题
    handleSearch() {
      // TODO: 替换为实际API调用
      console.log('搜索习题:', this.searchQuery);
      // 模拟搜索
      this.currentExercise = {
        ...this.currentExercise,
        title: `搜索结果: ${this.searchQuery}`
      };
    },

    // 触发文件选择
    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    // 处理拖拽进入
    handleDragOver() {
      this.uploadIconClass = 'fas fa-file-upload';
      this.uploadIconColor = 'var(--primary-color)';
      this.uploadText = '松开上传图片';
    },

    // 处理拖拽离开
    handleDragLeave() {
      this.uploadIconClass = 'fas fa-cloud-upload-alt';
      this.uploadIconColor = 'var(--primary-color)';
      this.uploadText = '点击或拖拽图片到此处上传';
    },

    // 处理拖放
    handleDrop(e) {
      this.handleDragLeave();
      if (e.dataTransfer.files.length) {
        this.handleFileUpload(e.dataTransfer.files[0]);
      }
    },

    // 处理文件选择
    handleFileChange(e) {
      if (e.target.files.length) {
        this.handleFileUpload(e.target.files[0]);
      }
    },

    // 处理文件上传
    handleFileUpload(file) {
      // TODO: 替换为实际API调用
      console.log('上传文件:', file.name);

      // 显示上传成功反馈
      this.uploadIconClass = 'fas fa-check-circle';
      this.uploadIconColor = 'var(--success-color)';
      this.uploadText = `已选择: ${file.name}`;

      // 3秒后恢复原始状态
      setTimeout(() => {
        this.uploadIconClass = 'fas fa-cloud-upload-alt';
        this.uploadIconColor = 'var(--primary-color)';
        this.uploadText = '点击或拖拽图片到此处上传';
      }, 3000);

      // 预览图片
      const reader = new FileReader();
      reader.onload = (e) => {
        this.currentExercise.image = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    // 收藏习题
    saveExercise() {
      // TODO: 替换为实际API调用
      console.log('收藏习题:', this.currentExercise.id);
      this.$message.success('习题已收藏');
    },

    // 获取相似习题
    getSimilarExercises() {
      // TODO: 替换为实际API调用
      console.log('获取相似习题:', this.currentExercise.id);
      this.$message.info('正在获取相似习题...');
    },

    // 选择相关习题
    selectRelatedExercise(exercise) {
      // TODO: 替换为实际API调用
      console.log('选择相关习题:', exercise.id);
      this.currentExercise = {
        ...this.currentExercise,
        title: exercise.title,
        category: exercise.category,
        difficulty: exercise.difficulty,
        question: `这是关于${exercise.title}的问题描述...`,
        solution: `这是关于${exercise.title}的解析答案...`,
        image: null
      };
    }
  }
}
</script>

<style scoped>
/* 保持原有样式不变 */
.exercise-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  height: calc(100vh - 60px);
  overflow-y: scroll; /* 允许滚动 */
  scrollbar-width: none; /* Firefox 隐藏滚动条 */
  -ms-overflow-style: none; /* IE/Edge 隐藏滚动条 */
}

/* Chrome/Safari/Opera 隐藏滚动条 */
.exercise-container::-webkit-scrollbar {
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

.upload-section {
  border: 2px dashed var(--gray-color);
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
}

.upload-section:hover {
  border-color: var(--primary-color);
  background-color: rgba(74, 107, 255, 0.05);
}

.upload-icon {
  font-size: 40px;
  color: var(--primary-color);
  margin-bottom: 15px;
}

.upload-text {
  font-size: 16px;
  color: var(--dark-color);
  margin-bottom: 10px;
}

.upload-hint {
  font-size: 14px;
  color: #718096;
}

.content-section {
  display: flex;
  gap: 25px;
}

.exercise-detail {
  flex: 2;
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--gray-color);
}

.exercise-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--dark-color);
}

.exercise-meta {
  display: flex;
  gap: 15px;
}

.exercise-tag {
  background-color: var(--light-color);
  color: var(--dark-color);
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.exercise-content {
  margin-bottom: 25px;
}

.question-text {
  font-size: 16px;
  margin-bottom: 20px;
  line-height: 1.7;
}

.question-image {
  max-width: 100%;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.solution-section {
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  margin-top: 25px;
}

.solution-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.solution-content {
  line-height: 1.7;
}

.solution-step {
  margin-bottom: 15px;
  padding-left: 20px;
  position: relative;
}

.solution-step:before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--primary-color);
  font-weight: bold;
}

.related-exercises {
  flex: 1;
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  height: fit-content;
}

.related-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--dark-color);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.related-title i {
  color: var(--primary-color);
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.related-item {
  padding: 15px;
  border-radius: 8px;
  background-color: #f8fafc;
  cursor: pointer;
  transition: all 0.3s;
}

.related-item:hover {
  background-color: #edf2f7;
  transform: translateX(5px);
}

.related-item-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
  color: var(--dark-color);
}

.related-item-meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #718096;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 25px;
}

.action-btn {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.save-btn {
  background-color: white;
  border: 1px solid var(--gray-color);
  color: var(--dark-color);
}

.save-btn:hover {
  background-color: #f7fafc;
}

.practice-btn {
  background-color: var(--primary-color);
  border: 1px solid var(--primary-color);
  color: white;
}

.practice-btn:hover {
  background-color: var(--secondary-color);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .content-section {
    flex-direction: column;
  }

  .search-box {
    flex-direction: column;
  }

  .search-btn {
    padding: 12px;
  }

  .exercise-meta {
    flex-direction: column;
    gap: 5px;
    align-items: flex-end;
  }
}
</style>