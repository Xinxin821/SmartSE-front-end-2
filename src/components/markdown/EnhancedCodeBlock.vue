<template>
  <div class="code-block-container" :class="{ 'has-line-numbers': showLineNumbers }">
    <!-- 代码块头部 -->
    <div class="code-header">
      <!-- 语言标签 -->
      <span class="language-label">{{ formattedLanguage }}</span>

      <!-- 操作按钮组 -->
      <div class="code-actions">
        <!-- 复制按钮 -->
        <button
            class="copy-button"
            @click="copyCode"
            :title="copyStatus === '已复制' ? '复制成功' : '复制代码'"
            :class="{ 'copied': copyStatus === '已复制' }"
        >
          <i class="fas fa-copy"></i>
          <span>{{ copyStatus }}</span>
        </button>

        <!-- 下载按钮 -->
        <button
            class="download-button"
            @click="downloadCode"
            title="下载代码"
        >
          <i class="fas fa-download"></i>
        </button>

        <!-- 行号切换 -->
        <button
            v-if="enableLineNumbers"
            class="line-numbers-toggle"
            @click="toggleLineNumbers"
            :title="showLineNumbers ? '隐藏行号' : '显示行号'"
        >
          <i class="fas" :class="showLineNumbers ? 'fa-list-ol' : 'fa-list'"></i>
        </button>
      </div>
    </div>

    <!-- 代码内容区域 -->
    <div class="code-content-wrapper">
      <!-- 行号列 -->
      <div
          v-if="showLineNumbers"
          class="line-numbers"
          ref="lineNumbers"
          :style="{ height: codeContentHeight }"
      >
        <span
            v-for="n in lineCount"
            :key="n"
            class="line-number"
        >{{ n }}</span>
      </div>

      <!-- 代码内容 -->
      <pre
          ref="preElement"
          :style="{
          'margin-left': showLineNumbers ? lineNumbersWidth + 'px' : '0',
          'height': codeContentHeight
        }"
      >
        <code
            class="hljs"
            :class="languageClass"
            v-html="highlightedCode"
            ref="codeElement"
        ></code>
      </pre>
    </div>
  </div>
</template>

<script>
import hljs from 'highlight.js/lib/core'
import 'highlight.js/styles/github.css'

// 按需注册语言（根据项目需要增减）
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import cpp from 'highlight.js/lib/languages/cpp'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'
import sql from 'highlight.js/lib/languages/sql'
import bash from 'highlight.js/lib/languages/bash'

// 注册语言
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('java', java)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('css', css)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('bash', bash)

export default {
  name: 'EnhancedCodeBlock',
  props: {
    // 代码内容
    code: {
      type: String,
      required: true,
      default: ''
    },

    // 代码语言
    language: {
      type: String,
      default: ''
    },

    // 是否显示行号
    lineNumbers: {
      type: Boolean,
      default: false
    },

    // 是否允许切换行号显示
    enableLineNumbers: {
      type: Boolean,
      default: true
    },

    // 高亮特定行（数组格式，如[1,3-5]）
    highlightLines: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      copyStatus: '复制',
      copyTimeout: null,
      showLineNumbers: this.lineNumbers,
      lineNumbersWidth: 0,
      codeContentHeight: 'auto',
      lineCount: 0
    }
  },
  computed: {
    // 格式化后的语言显示名称
    formattedLanguage() {
      if (!this.language) return 'TEXT'

      const langMap = {
        js: 'JavaScript',
        py: 'Python',
        java: 'Java',
        cpp: 'C++',
        cs: 'C#',
        html: 'HTML',
        xml: 'XML',
        sql: 'SQL',
        bash: 'Bash',
        sh: 'Shell'
      }

      return langMap[this.language.toLowerCase()] || this.language.toUpperCase()
    },

    // 高亮后的代码HTML
    highlightedCode() {
      try {
        // 如果有指定语言且支持
        if (this.language && hljs.getLanguage(this.language)) {
          const result = hljs.highlight(this.code, {
            language: this.language,
            ignoreIllegals: true
          })

          // 处理高亮行
          return this.processHighlightLines(result.value)
        }

        // 自动检测语言
        const result = hljs.highlightAuto(this.code)
        return this.processHighlightLines(result.value)
      } catch (e) {
        console.error('代码高亮错误:', e)
        return hljs.highlightAuto(this.code).value
      }
    },

    // 代码语言类名
    languageClass() {
      return this.language ? `language-${this.language}` : ''
    }
  },
  watch: {
    // 监听代码变化重新计算行号
    code: {
      immediate: true,
      handler() {
        this.$nextTick(() => {
          this.calculateLineNumbers()
          this.updateLineNumbersWidth()
        })
      }
    },

    // 监听行号显示状态变化
    showLineNumbers(newVal) {
      this.$nextTick(() => {
        if (newVal) {
          this.updateLineNumbersWidth()
        }
      })
    }
  },
  mounted() {
    this.calculateLineNumbers()
    this.updateLineNumbersWidth()

    // 监听窗口变化调整行号宽度
    window.addEventListener('resize', this.handleResize)

    // 初始化高亮行
    this.highlightSpecificLines()
  },
  beforeUnmount() {
    clearTimeout(this.copyTimeout)
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    // 复制代码
    async copyCode() {
      try {
        await navigator.clipboard.writeText(this.code)
        this.copyStatus = '已复制'

        clearTimeout(this.copyTimeout)
        this.copyTimeout = setTimeout(() => {
          this.copyStatus = '复制'
        }, 2000)
      } catch (err) {
        console.error('复制失败:', err)
        this.copyStatus = '复制失败'

        // 回退到document.execCommand方法
        const textarea = document.createElement('textarea')
        textarea.value = this.code
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)

        this.copyStatus = '已复制'
        clearTimeout(this.copyTimeout)
        this.copyTimeout = setTimeout(() => {
          this.copyStatus = '复制'
        }, 2000)
      }
    },

    // 下载代码
    downloadCode() {
      const blob = new Blob([this.code], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')

      a.href = url
      a.download = `code-${Date.now()}.${this.language || 'txt'}`
      a.style.display = 'none'

      document.body.appendChild(a)
      a.click()

      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)
    },

    // 切换行号显示
    toggleLineNumbers() {
      this.showLineNumbers = !this.showLineNumbers
    },

    // 计算行号
    calculateLineNumbers() {
      if (!this.code) {
        this.lineCount = 0
        return
      }

      // 计算代码行数
      const lines = this.code.split('\n')
      this.lineCount = lines.length

      // 更新代码区域高度（保持行号与代码同步滚动）
      if (this.$refs.codeElement) {
        this.codeContentHeight = this.$refs.codeElement.offsetHeight + 'px'
      }
    },

    // 更新行号列宽度
    updateLineNumbersWidth() {
      if (!this.showLineNumbers || !this.$refs.lineNumbers) {
        this.lineNumbersWidth = 0
        return
      }

      // 根据行号位数动态调整宽度
      const digitCount = String(this.lineCount).length
      this.lineNumbersWidth = digitCount * 10 + 20 // 根据数字位数计算宽度
    },

    // 处理窗口大小变化
    handleResize() {
      this.updateLineNumbersWidth()
    },

    // 处理高亮指定行
    processHighlightLines(html) {
      if (!this.highlightLines || this.highlightLines.length === 0) {
        return html
      }

      // 将代码按行分割
      const lines = html.split('\n')

      // 处理每行
      return lines.map((line, index) => {
        const lineNumber = index + 1
        const shouldHighlight = this.highlightLines.some(hl => {
          if (typeof hl === 'number') {
            return hl === lineNumber
          } else if (typeof hl === 'string' && hl.includes('-')) {
            const [start, end] = hl.split('-').map(Number)
            return lineNumber >= start && lineNumber <= end
          }
          return false
        })

        return shouldHighlight
            ? `<span class="highlight-line">${line}</span>`
            : line
      }).join('\n')
    },

    // 高亮特定行（DOM操作）
    highlightSpecificLines() {
      this.$nextTick(() => {
        const codeElement = this.$refs.codeElement
        if (!codeElement) return

        // 移除旧的高亮
        const oldHighlights = codeElement.querySelectorAll('.highlight-line')
        oldHighlights.forEach(el => {
          el.classList.remove('highlight-line')
        })

        // 添加新的高亮
        const lines = codeElement.innerHTML.split('\n')
        codeElement.innerHTML = lines.map((line, index) => {
          const lineNumber = index + 1
          const shouldHighlight = this.highlightLines.some(hl => {
            if (typeof hl === 'number') {
              return hl === lineNumber
            } else if (typeof hl === 'string' && hl.includes('-')) {
              const [start, end] = hl.split('-').map(Number)
              return lineNumber >= start && lineNumber <= end
            }
            return false
          })

          return shouldHighlight
              ? `<span class="highlight-line">${line}</span>`
              : line
        }).join('\n')
      })
    }
  }
}
</script>

<style scoped>
/* 基础容器样式 */
.code-block-container {
  position: relative;
  margin: 1.5em 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #f6f8fa;
  transition: all 0.3s ease;
}

.code-block-container:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

/* 头部样式 */
.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: #f6f8fa;
  border-bottom: 1px solid #e1e4e8;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.language-label {
  font-size: 13px;
  font-weight: 600;
  color: #6a737d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 操作按钮组 */
.code-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.copy-button,
.download-button,
.line-numbers-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  color: #6a737d;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.copy-button.copied {
  color: #28a745;
  background-color: rgba(40, 167, 69, 0.1);
}

.copy-button:hover,
.download-button:hover,
.line-numbers-toggle:hover {
  color: #0366d6;
  background-color: rgba(3, 102, 214, 0.1);
}

/* 代码内容区域 */
.code-content-wrapper {
  position: relative;
  display: flex;
  overflow: auto;
  max-height: 600px;
}

/* 行号样式 */
.line-numbers {
  min-width: 40px;
  padding: 16px 8px;
  text-align: right;
  background-color: #f6f8fa;
  border-right: 1px solid #e1e4e8;
  color: #6a737d;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
  line-height: 1.5;
  user-select: none;
  overflow: hidden;
}

.line-number {
  display: block;
}

/* 代码区域样式 */
pre {
  margin: 0;
  padding: 16px;
  overflow: auto;
  flex-grow: 1;
  background-color: #f6f8fa;
}

code {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 14px;
  line-height: 1.5;
  display: block;
}

/* 高亮行样式 */
.highlight-line {
  background-color: rgba(255, 235, 59, 0.3);
  display: inline-block;
  width: 100%;
  padding: 0 4px;
  margin: 0 -4px;
  border-left: 3px solid #ffc107;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .code-block-container {
    border-radius: 6px;
  }

  .code-header {
    padding: 6px 12px;
  }

  pre {
    padding: 12px;
  }
}
</style>

<style>
/* 全局高亮样式（非scoped） */
.hljs {
  background: transparent !important;
  padding: 0 !important;
}
</style>