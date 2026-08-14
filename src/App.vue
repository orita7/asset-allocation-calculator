<script setup>
import { config } from "./config";
</script>

<template>
  <main id="main" class="main">
    <section class="calculator">
      <header class="calculator__header">
        <span class="calculator__title">CoinSplit</span>
        <span class="calculator__strategy"
          >{{ config.DEFAULT_SPLIT_PERCENT }} /
          {{ 100 - config.DEFAULT_SPLIT_PERCENT }} strategy</span
        >
      </header>
      <h1 class="calculator__headline">Build your crypto <em>allocation.</em></h1>
    </section>
  </main>
</template>

<style scoped>
.main {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 0 clamp(0px, 4vw, 56px) clamp(0px, 4vw, 56px);
}

.calculator {
  max-width: 1000px;
  width: 100%;
  border-radius: var(--radius-xl);
  height: 100vh;
  background: linear-gradient(
    135deg,
    var(--color-page-start) 0%,
    var(--color-page-mid) 58%,
    var(--color-page-end) 100%
  );
  margin: var(--space-8) 0;
  box-shadow: var(--shadow-panel);
  display: flex;
  flex-direction: column;
  padding: clamp(24px, 4vw, 34px) clamp(20px, 4vw, 44px) clamp(24px, 3vw, 30px);
}

.calculator__header {
  display: flex;
  align-items: center;
  margin-bottom: var(--space-6);
}

.calculator__title {
  font-weight: 700;
  font-size: var(--font-size-base);
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.calculator__strategy {
  margin-left: auto;
  font-weight: 700;
  font-size: var(--font-size-xs);
  letter-spacing: var(--letter-spacing-widest);
  text-transform: uppercase;
  color: var(--color-text-dim);
}

.calculator__headline {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  line-height: 1.05;
  color: #fff;
  margin-bottom: var(--space-6);
  text-wrap: pretty;
}

.calculator__headline em {
  font-style: normal;
  color: var(--color-text-accent);
}
</style>
