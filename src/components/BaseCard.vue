<script setup>
defineProps({
  /** Dimmed + dashed border — used for last-known/stale data. */
  provisional: { type: Boolean, default: false },
  as: { type: String, default: "div" },
});
</script>

<template>
  <component :is="as" class="base-card" :class="{ 'base-card--provisional': provisional }">
    <slot />
  </component>
</template>

<style scoped>
.base-card {
  min-width: 0;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-lg);
  padding: var(--space-5) var(--space-6);
  background: var(--color-surface-glass);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.base-card--provisional {
  border-style: dashed;
  opacity: 0.6;
}
</style>
