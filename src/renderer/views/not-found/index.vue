<template>
  <div class="bg-body">
    <div class="not-found-container">
      <div class="content">
        <div class="error-code glitch" data-text="404">404</div>
        <div class="error-title">{{ i18nt.errors.NoFound.title }}</div>
        <div class="error-desc">
          <p>{{ i18nt.errors.NoFound.desc1 }}</p>
          <p>{{ i18nt.errors.NoFound.desc2 }}</p>
        </div>

        <div class="terminal-logs">
          <div class="log-line">{{ i18nt.errors.NoFound.diagnosticStart }}</div>
          <div class="log-line">
            {{ i18nt.errors.NoFound.checkingProxy }}
            <span class="status-ok">{{ i18nt.errors.NoFound.ok }}</span>
          </div>
          <div class="log-line">
            {{ i18nt.errors.NoFound.checkingTarget }}
            <span class="status-fail">{{ i18nt.errors.NoFound.failed }}</span>
          </div>
          <div class="log-line">
            {{ i18nt.errors.NoFound.errorPageNotFound }}
          </div>
        </div>

        <button class="btn-return" @click="goHome">
          <span class="icon">◀</span>
          {{ i18nt.errors.NoFound.returnToMain }}
        </button>
      </div>

      <div class="deco-grid"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { i18nt } from '@renderer/i18n'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style>
.not-found-container {
  --nf-bg-start: #f3f6f9;
  --nf-bg-end: #dde4ed;
  --nf-text-main: #333;
  --nf-text-sub: #666;
  --nf-content-bg: rgba(255, 255, 255, 0.4);
  --nf-content-border: rgba(255, 255, 255, 0.6);
  --nf-error-code: #c62828;
  --nf-terminal-bg: rgba(0, 0, 0, 0.05);
  --nf-terminal-border: #666;
  --nf-log-line: #555;
  --nf-btn-border: #333;
  --nf-btn-text: #333;
  --nf-btn-hover-bg: #333;
  --nf-btn-hover-text: #fff;
  --nf-grid-color: rgba(0, 0, 0, 0.03);
  --nf-shadow: rgba(0, 0, 0, 0.05);
}

html.dark .not-found-container {
  --nf-bg-start: #1a1a1a;
  --nf-bg-end: #0d0d0d;
  --nf-text-main: #e0e0e0;
  --nf-text-sub: #aaa;
  --nf-content-bg: rgba(0, 0, 0, 0.4);
  --nf-content-border: rgba(255, 255, 255, 0.1);
  --nf-error-code: #ff5252;
  --nf-terminal-bg: rgba(255, 255, 255, 0.05);
  --nf-terminal-border: #888;
  --nf-log-line: #ccc;
  --nf-btn-border: #e0e0e0;
  --nf-btn-text: #e0e0e0;
  --nf-btn-hover-bg: #e0e0e0;
  --nf-btn-hover-text: #121212;
  --nf-grid-color: rgba(255, 255, 255, 0.03);
  --nf-shadow: rgba(0, 0, 0, 0.5);
}
</style>

<style scoped>
.bg-body {
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background: var(--background-gradient, var(--background-color));
  font-family: var(--font-ui);
  color: var(--text-color);
  overflow: hidden;
  padding-top: 30px; /* Account for custom title bar */
  box-sizing: border-box;
}
.not-found-container {
  height: 100%;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: radial-gradient(
    circle at 50% 50%,
    var(--nf-bg-start) 0%,
    var(--nf-bg-end) 100%
  );
  overflow: hidden;
  font-family: 'Courier New', monospace;
  color: var(--nf-text-main);
}

.content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 40px;
  background: var(--nf-content-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--nf-content-border);
  border-radius: 4px;
  box-shadow: 0 10px 30px var(--nf-shadow);
  max-width: 500px;
  width: 90%;
}

.error-code {
  font-size: 80px;
  font-weight: 900;
  line-height: 1;
  color: var(--nf-error-code); /* Red for error */
  position: relative;
  margin-bottom: 10px;
}

.glitch {
  position: relative;
}

.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.glitch::before {
  left: 2px;
  text-shadow: -1px 0 #00ffff;
  clip: rect(24px, 550px, 90px, 0);
  animation: glitch-anim-2 3s infinite linear alternate-reverse;
}

.glitch::after {
  left: -2px;
  text-shadow: -1px 0 #ff00ff;
  clip: rect(85px, 550px, 140px, 0);
  animation: glitch-anim 2.5s infinite linear alternate-reverse;
}

@keyframes glitch-anim {
  0% {
    clip: rect(11px, 9999px, 81px, 0);
  }
  20% {
    clip: rect(96px, 9999px, 2px, 0);
  }
  40% {
    clip: rect(25px, 9999px, 94px, 0);
  }
  60% {
    clip: rect(61px, 9999px, 34px, 0);
  }
  80% {
    clip: rect(5px, 9999px, 66px, 0);
  }
  100% {
    clip: rect(84px, 9999px, 11px, 0);
  }
}

@keyframes glitch-anim-2 {
  0% {
    clip: rect(65px, 9999px, 100px, 0);
  }
  20% {
    clip: rect(32px, 9999px, 11px, 0);
  }
  40% {
    clip: rect(8px, 9999px, 69px, 0);
  }
  60% {
    clip: rect(54px, 9999px, 24px, 0);
  }
  80% {
    clip: rect(92px, 9999px, 4px, 0);
  }
  100% {
    clip: rect(21px, 9999px, 78px, 0);
  }
}

.error-title {
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 4px;
  margin-bottom: 20px;
  color: var(--nf-text-main);
}

.error-desc {
  font-size: 12px;
  line-height: 1.6;
  color: var(--nf-text-sub);
  margin-bottom: 30px;
  font-weight: bold;
}

.terminal-logs {
  text-align: left;
  background: var(--nf-terminal-bg);
  padding: 15px;
  font-size: 11px;
  margin-bottom: 30px;
  border-left: 2px solid var(--nf-terminal-border);
}

.log-line {
  margin-bottom: 4px;
  color: var(--nf-log-line);
}

.status-ok {
  color: #2e7d32;
  font-weight: bold;
}
.status-fail {
  color: #c62828;
  font-weight: bold;
}

.btn-return {
  background: transparent;
  border: 1px solid var(--nf-btn-border);
  color: var(--nf-btn-text);
  padding: 10px 24px;
  font-family: inherit;
  font-weight: bold;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-return:hover {
  background: var(--nf-btn-hover-bg);
  color: var(--nf-btn-hover-text);
}

.deco-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    linear-gradient(var(--nf-grid-color) 1px, transparent 1px),
    linear-gradient(90deg, var(--nf-grid-color) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
}
</style>
