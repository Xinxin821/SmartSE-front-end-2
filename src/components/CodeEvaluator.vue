<template>
  <transition name="fade">
    <div class="code-evaluator-overlay" v-if="visible" @click.self="close">
      <div class="code-evaluator-card">
        <!-- 头部区域 -->
        <div class="code-evaluator-header">
          <div class="header-content">
            <h2>
              <i class="fas fa-code icon"></i>
              代码质量评测
            </h2>
            <div class="language-badge">{{ languageDisplayName }}</div>
          </div>
          <button class="close-button" @click="close" aria-label="关闭评测窗口">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- 主体区域 -->
        <div class="code-evaluator-body">
          <!-- 语言选择和操作区 -->
          <div class="control-panel">
            <div class="language-selector">
              <label for="codeLanguage">
                <i class="fas fa-code-branch"></i>
                编程语言:
              </label>
              <select
                  id="codeLanguage"
                  v-model="codeLanguage"
                  @change="resetEvaluation"
              >
                <option
                    v-for="lang in supportedLanguages"
                    :value="lang.value"
                    :key="lang.value"
                >
                  {{ lang.label }}
                </option>
              </select>
            </div>

            <div class="action-buttons">
              <button
                  class="btn btn-upload"
                  @click="uploadCode"
                  :disabled="isLoading"
              >
                <i class="fas fa-upload"></i> 上传代码
              </button>
              <button
                  class="btn btn-evaluate"
                  @click="evaluateCode"
                  :disabled="isLoading || !code.trim()"
                  :class="{ 'pulse': !isLoading && code.trim() }"
              >
                <i class="fas fa-check-circle"></i>
                {{ evaluationResult ? '重新评测' : '开始评测' }}
              </button>
              <input
                  type="file"
                  ref="codeFileInput"
                  class="file-input"
                  @change="handleFileUpload"
                  :accept="fileAcceptTypes"
              />
            </div>
          </div>

          <!-- 代码编辑器区域 -->
          <div class="code-editor-container">
            <EnhancedCodeBlock
                ref="codeEditor"
                :code="code"
                :language="codeLanguage"
                :showLineNumbers="true"
                @update:code="handleCodeChange"
                editable
            />
          </div>
          <div class="editor-footer">
              <span class="hint-text">
                <i class="fas fa-info-circle"></i>
                支持 {{ fileAcceptTypes.replace(/\./g, '').replace(/,/g, ', ') }} 文件
              </span>
            <span class="char-count">
                {{ code.length }} 字符
              </span>
          </div>
        </div>

        <!-- 评测结果区域 -->
        <div class="evaluation-results-container">
          <!-- 加载状态 -->
          <div v-if="isLoading" class="evaluation-loading">
            <div class="spinner-container">
              <div class="spinner"></div>
              <p>正在分析代码质量...</p>
              <div class="progress-text">
                已完成 {{ loadingProgress }}%
                <span v-if="estimatedTime">(预计剩余 {{ estimatedTime }} 秒)</span>
              </div>
            </div>
          </div>

          <!-- 错误状态 -->
          <div v-else-if="error" class="evaluation-error">
            <div class="error-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3>评测失败</h3>
            <p>{{ error }}</p>
            <button class="btn btn-retry" @click="evaluateCode">
              <i class="fas fa-redo"></i> 重试
            </button>
          </div>

          <!-- 评测结果 -->
          <div v-else-if="evaluationResult" class="evaluation-results">
            <!-- 结果概览 -->
            <div class="results-summary">
              <div class="overall-score-container">
                <div class="score-circle" :class="getScoreClass(evaluationResult.overallScore)">
                  {{ evaluationResult.overallScore }}
                </div>
                <div class="score-description">
                  <h3>代码质量评分</h3>
                  <p>{{ getScoreDescription(evaluationResult.overallScore) }}</p>
                </div>
              </div>
              <div class="summary-metrics">
                <div class="metric-item">
                  <div class="metric-value">{{ evaluationResult.metrics.bugs || 0 }}</div>
                  <div class="metric-label">Bug</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">{{ evaluationResult.metrics.vulnerabilities || 0 }}</div>
                  <div class="metric-label">漏洞</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">{{ evaluationResult.metrics.code_smells || 0 }}</div>
                  <div class="metric-label">代码异味</div>
                </div>
              </div>
            </div>

            <!-- 详细指标 -->
            <div class="detailed-metrics">
              <h3 class="section-title">
                <i class="fas fa-chart-bar"></i> 详细指标
              </h3>
              <div class="metrics-grid">
                <div
                    v-for="(metric, key) in filteredMetrics"
                    :key="key"
                    class="metric-card"
                >
                  <div class="metric-header">
                    <h4>{{ metricLabels[key] || key }}</h4>
                    <div class="metric-score" :class="getScoreClass(metric.score)">
                      {{ metric.score }}
                    </div>
                  </div>
                  <div class="metric-body">
                    <p>{{ metric.description }}</p>
                    <div class="metric-progress">
                      <div
                          class="progress-bar"
                          :style="{ width: metric.score + '%' }"
                          :class="getScoreClass(metric.score)"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 问题列表 -->
            <div class="issues-section" v-if="evaluationResult.issues && evaluationResult.issues.length">
              <h3 class="section-title">
                <i class="fas fa-exclamation-circle"></i>
                发现的问题 ({{ evaluationResult.issues.length }})
                <span class="filter-controls">
                  <label>
                    <input
                        type="checkbox"
                        v-model="showCriticalIssues"
                        @change="filterIssues"
                    /> 严重
                  </label>
                  <label>
                    <input
                        type="checkbox"
                        v-model="showMajorIssues"
                        @change="filterIssues"
                    /> 主要
                  </label>
                  <label>
                    <input
                        type="checkbox"
                        v-model="showMinorIssues"
                        @change="filterIssues"
                    /> 次要
                  </label>
                  <label>
                    <input
                        type="checkbox"
                        v-model="showInfoIssues"
                        @change="filterIssues"
                    /> 信息
                  </label>
                </span>
              </h3>

              <div class="issues-list">
                <div
                    v-for="(issue, index) in filteredIssues"
                    :key="index"
                    class="issue-item"
                    :class="'severity-' + issue.severity.toLowerCase()"
                >
                  <div class="issue-header">
                    <div class="issue-meta">
                      <span class="issue-severity">
                        <i :class="getSeverityIcon(issue.severity)"></i>
                        {{ issue.severity }}
                      </span>
                      <span class="issue-location">
                        <i class="fas fa-map-marker-alt"></i>
                        第 {{ issue.line }} 行
                      </span>
                      <span class="issue-rule" v-if="issue.rule">
                        <i class="fas fa-book"></i>
                        {{ issue.rule }}
                      </span>
                    </div>
                    <button
                        class="btn btn-copy"
                        @click="copyIssueToClipboard(issue)"
                        title="复制问题信息"
                    >
                      <i class="fas fa-copy"></i>
                    </button>
                  </div>
                  <p class="issue-message">{{ issue.message }}</p>
                  <div class="issue-code" v-if="issue.codeSnippet">
                    <pre><code>{{ issue.codeSnippet }}</code></pre>
                  </div>
                </div>
                <div v-if="filteredIssues.length === 0" class="no-issues">
                  <i class="fas fa-check-circle"></i>
                  没有符合筛选条件的问题
                </div>
              </div>
            </div>
          </div>

          <!-- 初始状态提示 -->
          <div v-else class="evaluation-prompt">
            <h3>准备评测您的代码</h3>
            <p>输入或上传代码后点击"开始评测"按钮，我们将使用SonarQube分析您的代码质量</p>
            <div class="tips">
              <div class="tip-item">
                <i class="fas fa-check"></i>
                支持多种编程语言分析
              </div>
              <div class="tip-item">
                <i class="fas fa-check"></i>
                提供详细的代码质量报告
              </div>
              <div class="tip-item">
                <i class="fas fa-check"></i>
                发现潜在问题和改进建议
              </div>
            </div>
          </div>
        </div>

        <!-- 底部区域 -->
        <div class="code-evaluator-footer">
          <div class="footer-actions">
            <button
                class="btn btn-secondary"
                @click="resetEvaluation"
                :disabled="isLoading"
            >
              <i class="fas fa-undo"></i> 重置
            </button>
            <button
                class="btn btn-primary"
                @click="exportReport"
                :disabled="isLoading || !evaluationResult"
            >
              <i class="fas fa-file-export"></i> 导出报告
            </button>
          </div>
          <div class="footer-info">
            <span v-if="lastEvaluatedTime">
              最后评测: {{ formatTime(lastEvaluatedTime) }}
            </span>
            <span>Powered by SonarQube</span>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import EnhancedCodeBlock from './markdown/EnhancedCodeBlock.vue';
import axios from 'axios';

export default {
  name: 'CodeEvaluator',
  components: {
    EnhancedCodeBlock
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    initialCode: {
      type: String,
      default: ''
    },
    initialLanguage: {
      type: String,
      default: 'java'
    }
  },
  data() {
    return {
      code: this.initialCode,
      codeLanguage: this.initialLanguage,
      isLoading: false,
      loadingProgress: 0,
      estimatedTime: null,
      evaluationResult: null,
      error: null,
      lastEvaluatedTime: null,
      showCriticalIssues: true,
      showMajorIssues: true,
      showMinorIssues: true,
      showInfoIssues: false,
      filteredIssues: [],
      supportedLanguages: [
        { value: 'java', label: 'Java' },
        { value: 'javascript', label: 'JavaScript' },
        { value: 'python', label: 'Python' },
        { value: 'cpp', label: 'C++' },
        { value: 'csharp', label: 'C#' },
        { value: 'php', label: 'PHP' },
        { value: 'typescript', label: 'TypeScript' }
      ],
      metricLabels: {
        reliability_rating: '可靠性评级',
        security_rating: '安全性评级',
        sqale_rating: '可维护性评级',
        coverage: '测试覆盖率',
        duplicated_lines_density: '重复代码比例',
        bugs: 'Bug数量',
        vulnerabilities: '漏洞数量',
        code_smells: '代码异味数量',
        complexity: '复杂度',
        comment_density: '注释密度'
      },
      fileAcceptTypes: '.java,.js,.py,.cpp,.cs,.php,.ts,.html,.css'
    };
  },
  computed: {
    languageDisplayName() {
      const lang = this.supportedLanguages.find(l => l.value === this.codeLanguage);
      return lang ? lang.label : this.codeLanguage;
    },
    filteredMetrics() {
      if (!this.evaluationResult?.metrics) return [];
      return Object.entries(this.evaluationResult.metrics)
          .filter(([key]) => key !== 'bugs' && key !== 'vulnerabilities' && key !== 'code_smells')
          .map(([key, value]) => ({
            key,
            score: typeof value === 'number' ? Math.round(value) : 0,
            name: this.metricLabels[key] || key,
            description: this.getMetricDescription(key)
          }));
    }
  },
  watch: {
    initialCode(newVal) {
      this.code = newVal;
    },
    initialLanguage(newVal) {
      this.codeLanguage = newVal;
    },
    visible(newVal) {
      if (newVal) {
        this.resetEvaluation();
      }
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },
    uploadCode() {
      this.$refs.codeFileInput.click();
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      // 重置文件输入，允许重复选择同一文件
      event.target.value = '';

      // 设置临时加载状态
      this.isLoading = true;
      this.loadingProgress = 10;

      // 根据文件扩展名自动设置语言
      const extension = file.name.split('.').pop().toLowerCase();
      const languageMap = {
        'java': 'java',
        'js': 'javascript',
        'py': 'python',
        'cpp': 'cpp',
        'cs': 'csharp',
        'php': 'php',
        'ts': 'typescript',
        'html': 'html',
        'css': 'css'
      };

      if (languageMap[extension]) {
        this.codeLanguage = languageMap[extension];
      }

      // 使用setTimeout将文件读取放入事件循环队列
      setTimeout(() => {
        const reader = new FileReader();
        reader.onload = (e) => {
          // 使用setTimeout避免同时处理大量数据和DOM更新
          setTimeout(() => {
            this.code = e.target.result;
            this.resetEvaluation();
            this.isLoading = false;
          }, 100);
        };

        reader.onprogress = (e) => {
          if (e.lengthComputable) {
            this.loadingProgress = Math.round((e.loaded / e.total) * 50) + 10;
          }
        };

        reader.onerror = () => {
          this.error = "文件读取失败";
          this.isLoading = false;
        };

        reader.readAsText(file);
      }, 100);
    },
    handleCodeChange(newCode) {
      this.code = newCode;
    },
    resetEvaluation() {
      this.evaluationResult = null;
      this.error = null;
      this.filteredIssues = [];
    },
    async evaluateCode() {
      if (!this.code.trim()) {
        this.error = '请输入或上传代码内容';
        return;
      }

      this.isLoading = true;
      this.loadingProgress = 0;
      this.estimatedTime = null;
      this.error = null;

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        if (this.loadingProgress < 90) {
          this.loadingProgress += Math.floor(Math.random() * 10) + 1;
          this.estimatedTime = Math.floor(Math.random() * 5) + 1;
        }
      }, 500);

      try {
        // 调用后端API进行代码评测
        const response = await axios.post('http://localhost:8080/api/code/evaluate', {
          code: this.code,
          language: this.codeLanguage,
          userId: localStorage.getItem('userId')
        });

        if (response.data.code === 200) {
          this.evaluationResult = this.formatResults(response.data.data);
          this.filterIssues();
          this.lastEvaluatedTime = new Date();
          this.$emit('evaluated', this.evaluationResult);
        } else {
          throw new Error(response.data.message || '评测失败');
        }
      } catch (error) {
        console.error('代码评测失败:', error);
        this.error = error.response?.data?.message || error.message || '评测服务暂时不可用';
        this.$emit('error', this.error);
      } finally {
        clearInterval(progressInterval);
        this.loadingProgress = 100;
        setTimeout(() => {
          this.isLoading = false;
        }, 300);
      }
    },
    formatResults(rawData) {
      // 格式化SonarQube返回的数据
      return {
        ...rawData,
        issues: rawData.issues?.map(issue => ({
          ...issue,
          severity: this.formatSeverity(issue.severity)
        })) || [],
        metrics: {
          ...rawData.metrics,
          // 确保关键指标存在
          bugs: rawData.metrics?.bugs || 0,
          vulnerabilities: rawData.metrics?.vulnerabilities || 0,
          code_smells: rawData.metrics?.code_smells || 0
        }
      };
    },
    formatSeverity(severity) {
      const severityMap = {
        BLOCKER: '严重',
        CRITICAL: '严重',
        MAJOR: '主要',
        MINOR: '次要',
        INFO: '信息'
      };
      return severityMap[severity.toUpperCase()] || severity;
    },
    filterIssues() {
      if (!this.evaluationResult?.issues) {
        this.filteredIssues = [];
        return;
      }

      this.filteredIssues = this.evaluationResult.issues.filter(issue => {
        const severity = issue.severity.toLowerCase();
        return (
            (severity === '严重' && this.showCriticalIssues) ||
            (severity === '主要' && this.showMajorIssues) ||
            (severity === '次要' && this.showMinorIssues) ||
            (severity === '信息' && this.showInfoIssues)
        );
      });
    },
    getScoreClass(score) {
      if (score >= 80) return 'score-good';
      if (score >= 60) return 'score-average';
      return 'score-poor';
    },
    getScoreDescription(score) {
      if (score >= 90) return '代码质量优秀，继续保持！';
      if (score >= 80) return '代码质量良好，有少量改进空间';
      if (score >= 60) return '代码质量一般，建议进行优化';
      if (score >= 40) return '代码质量较差，需要重点关注';
      return '代码质量很差，建议全面重构';
    },
    getMetricDescription(key) {
      const descriptions = {
        reliability_rating: '代码的可靠性评级，分数越高表示越可靠',
        security_rating: '代码的安全性评级，分数越高表示越安全',
        sqale_rating: '代码的可维护性评级，分数越高表示越容易维护',
        coverage: '测试覆盖率，表示被测试覆盖的代码比例',
        duplicated_lines_density: '重复代码占全部代码的比例',
        complexity: '代码的圈复杂度，衡量代码复杂程度',
        comment_density: '代码注释占全部代码的比例'
      };
      return descriptions[key] || '暂无描述';
    },
    getSeverityIcon(severity) {
      const icons = {
        '严重': 'fas fa-skull-crossbones',
        '主要': 'fas fa-exclamation-triangle',
        '次要': 'fas fa-exclamation-circle',
        '信息': 'fas fa-info-circle'
      };
      return icons[severity] || 'fas fa-question-circle';
    },
    copyIssueToClipboard(issue) {
      const text = `问题类型: ${issue.severity}\n位置: 第 ${issue.line} 行\n描述: ${issue.message}\n${issue.codeSnippet ? '代码片段:\n' + issue.codeSnippet : ''}`;
      navigator.clipboard.writeText(text).then(() => {
        this.$emit('show-message', '问题信息已复制到剪贴板');
      });
    },
    exportReport() {
      if (!this.evaluationResult) return;

      const report = {
        code: this.code,
        language: this.codeLanguage,
        timestamp: new Date().toISOString(),
        ...this.evaluationResult
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `code-review-${new Date().getTime()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    formatTime(date) {
      return new Date(date).toLocaleString();
    }
  },
  mounted() {
    if (this.initialCode) {
      this.code = this.initialCode;
    }
    if (this.initialLanguage) {
      this.codeLanguage = this.initialLanguage;
    }
  }
};
</script>

<style scoped>
/* 基础样式 */
:root {
  --primary-color: #4361ee;
  --secondary-color: #3f37c9;
  --success-color: #4cc9f0;
  --danger-color: #f72585;
  --warning-color: #f7b955;
  --info-color: #4895ef;
  --light-color: #f8f9fa;
  --dark-color: #212529;
  --border-color: #e1e4e8;
  --border-radius: 8px;
  --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

/* 过渡动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

/* 模态框样式 */
.code-evaluator-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  backdrop-filter: blur(5px);
  padding: 20px;
}

.code-evaluator-card {
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  width: 100%;
  max-width: 1000px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slide-up 0.3s ease;
}

/* 头部样式 */
.code-evaluator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: var(--light-color);
  border-bottom: 1px solid var(--border-color);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.code-evaluator-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--dark-color);
  display: flex;
  align-items: center;
  gap: 8px;
}

.code-evaluator-header .icon {
  color: var(--primary-color);
}

.language-badge {
  background-color: var(--primary-color);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.close-button {
  background: none;
  border: none;
  color: #6a737d;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 4px;
  border-radius: 4px;
  transition: var(--transition);
}

.close-button:hover {
  color: var(--danger-color);
  background-color: rgba(0, 0, 0, 0.05);
}

/* 主体区域 */
.code-evaluator-body {
  padding: 20px;
  overflow-y: auto;
}

.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.language-selector label {
  font-weight: 500;
  color: var(--dark-color);
  display: flex;
  align-items: center;
  gap: 6px;
}

.language-selector select {
  padding: 8px 12px;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  background-color: white;
  font-size: 0.875rem;
  outline: none;
  transition: var(--transition);
  min-width: 120px;
}

.language-selector select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.2);
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border-radius: var(--border-radius);
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: var(--transition);
}

.btn-upload {
  background-color: var(--light-color);
  color: var(--dark-color);
  border: 1px solid var(--border-color);
}

.btn-upload:hover {
  background-color: #eef1f5;
}

.btn-evaluate {
  background-color: var(--primary-color);
  color: white;
}

.btn-evaluate:hover {
  background-color: var(--secondary-color);
}

.btn-evaluate.pulse {
  animation: pulse 2s infinite;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.file-input {
  display: none;
}

/* 代码编辑器区域 */
/* 修改代码编辑器容器样式 */
.code-editor-container {
  height: 160px; /* 固定高度 */
  overflow: auto; /* 启用滚动 */
  margin: 16px 0; /* 上下间距 */
  border-radius: 6px;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: var(--light-color);
  border-top: 1px solid var(--border-color);
  font-size: 0.75rem;
  color: #6a737d;
}

.hint-text {
  display: flex;
  align-items: center;
  gap: 4px;
}

.char-count {
  font-weight: 500;
}

/* 评测结果容器 */
.evaluation-results-container {
  margin-top: auto;
  flex: 1;
  overflow-y: auto;
  border-top: 5px solid var(--border-color);
}

/* 加载状态 */
.evaluation-loading {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.spinner-container {
  max-width: 400px;
  width: 100%;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid var(--primary-color);
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.progress-text {
  margin-top: 12px;
  font-size: 0.875rem;
  color: #6a737d;
}

/* 错误状态 */
.evaluation-error {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  color: var(--danger-color);
  margin-bottom: 16px;
}

.evaluation-error h3 {
  margin: 0 0 8px;
  color: var(--danger-color);
}

.evaluation-error p {
  margin: 0 0 16px;
  color: #6a737d;
  max-width: 400px;
}

.btn-retry {
  background-color: var(--danger-color);
  color: white;
}

.btn-retry:hover {
  background-color: #d31658;
}

/* 初始提示 */
.evaluation-prompt {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.prompt-icon {
  font-size: 3rem;
  color: var(--primary-color);
  margin-bottom: 16px;
}

.evaluation-prompt h3 {
  margin: 0 0 8px;
  color: var(--dark-color);
}

.evaluation-prompt p {
  margin: 0 0 24px;
  color: #6a737d;
  max-width: 500px;
}

.tips {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
  max-width: 500px;
  width: 100%;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--dark-color);
  font-size: 0.875rem;
}

.tip-item i {
  color: var(--success-color);
}

/* 评测结果 */
.evaluation-results {
  padding: 20px;
}

/* 结果概览 */
.results-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
}

.overall-score-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.score-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.score-good {
  background-color: #2ea44f;
  background-image: linear-gradient(135deg, #2ea44f, #3ac162);
}

.score-average {
  background-color: #f7b955;
  background-image: linear-gradient(135deg, #f7b955, #f9c469);
}

.score-poor {
  background-color: #e34c26;
  background-image: linear-gradient(135deg, #e34c26, #f06844);
}

.score-description h3 {
  margin: 0 0 4px;
  font-size: 1.125rem;
}

.score-description p {
  margin: 0;
  color: #6a737d;
  font-size: 0.875rem;
}

.summary-metrics {
  display: flex;
  gap: 16px;
  flex-grow: 1;
  justify-content: flex-end;
}

.metric-item {
  text-align: center;
  padding: 12px;
  min-width: 80px;
  border-radius: var(--border-radius);
  background-color: var(--light-color);
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--dark-color);
}

.metric-label {
  font-size: 0.75rem;
  color: #6a737d;
  margin-top: 4px;
}

/* 详细指标 */
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  font-size: 1.125rem;
  color: var(--dark-color);
}

.section-title i {
  color: var(--primary-color);
}

.filter-controls {
  margin-left: auto;
  display: flex;
  gap: 12px;
  font-size: 0.875rem;
  font-weight: normal;
}

.filter-controls label {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.filter-controls input {
  margin: 0;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  background-color: white;
  border-radius: var(--border-radius);
  padding: 16px;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.metric-header h4 {
  margin: 0;
  font-size: 0.875rem;
  color: var(--dark-color);
}

.metric-score {
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 12px;
  color: white;
  font-size: 0.75rem;
}

.metric-body p {
  margin: 0 0 8px;
  font-size: 0.875rem;
  color: #6a737d;
}

.metric-progress {
  height: 6px;
  background-color: #f1f2f3;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  transition: width 0.5s ease;
}

/* 问题列表 */
.issues-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.issue-item {
  background-color: white;
  border-radius: var(--border-radius);
  padding: 16px;
  border-left: 4px solid #6a737d;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.issue-item.severity-严重 {
  border-left-color: var(--danger-color);
  background-color: rgba(247, 37, 133, 0.05);
}

.issue-item.severity-主要 {
  border-left-color: var(--warning-color);
  background-color: rgba(247, 185, 85, 0.05);
}

.issue-item.severity-次要 {
  border-left-color: var(--info-color);
  background-color: rgba(72, 149, 239, 0.05);
}

.issue-item.severity-信息 {
  border-left-color: #6a737d;
}

.issue-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.issue-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.75rem;
}

.issue-severity {
  font-weight: 600;
  color: var(--dark-color);
  display: flex;
  align-items: center;
  gap: 4px;
}

.issue-location, .issue-rule {
  color: #6a737d;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-copy {
  background: none;
  border: none;
  color: #6a737d;
  padding: 0;
  font-size: 0.875rem;
}

.btn-copy:hover {
  color: var(--primary-color);
}

.issue-message {
  margin: 0 0 12px;
  color: var(--dark-color);
  font-size: 0.875rem;
}

.issue-code {
  background-color: #f1f2f3;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.75rem;
}

.issue-code pre {
  margin: 0;
  padding: 12px;
  white-space: pre-wrap;
}

.no-issues {
  text-align: center;
  padding: 24px;
  color: #6a737d;
  font-size: 0.875rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.no-issues i {
  font-size: 1.5rem;
  color: var(--success-color);
}

/* 底部区域 */
.code-evaluator-footer {
  padding: 12px 24px;
  background-color: var(--light-color);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.btn-secondary {
  background-color: white;
  color: var(--dark-color);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background-color: #f1f2f3;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--secondary-color);
}

.footer-info {
  font-size: 0.75rem;
  color: #6a737d;
  display: flex;
  gap: 16px;
}

/* 动画 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(67, 97, 238, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(67, 97, 238, 0); }
  100% { box-shadow: 0 0 0 0 rgba(67, 97, 238, 0); }
}

@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .code-evaluator-card {
    height: 95vh;
    max-height: none;
  }

  .code-evaluator-overlay {
    padding: 10px;
  }

  .control-panel {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons {
    justify-content: flex-end;
  }

  .results-summary {
    flex-direction: column;
    gap: 16px;
  }

  .summary-metrics {
    justify-content: flex-start;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .footer-info {
    display: none;
  }
}

@media (max-width: 480px) {
  .code-evaluator-header h2 {
    font-size: 1rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn {
    justify-content: center;
  }

  .filter-controls {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
}
</style>