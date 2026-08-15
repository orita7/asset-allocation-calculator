<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { AppState } from "../lib/appState";
import { formatRelativeTime } from "../lib/format";

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => Object.values(AppState).includes(value),
  },
  fetchedAt: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits(["refresh"]);

const now = ref(Date.now());
let intervalId = null;

onMounted(() => {
  intervalId = setInterval(() => {
    now.value = Date.now();
  }, 10_000);
});

onUnmounted(() => {
  clearInterval(intervalId);
});

const relativeTime = computed(() => formatRelativeTime(props.fetchedAt, now.value));

const STATUS_CONFIG = {
  [AppState.LOADING]: { text: () => "Fetching live rates…", tone: "loading" },
  [AppState.READY]: { text: (rel) => `Live prices · updated ${rel}`, tone: "ok" },
  [AppState.REFRESHING]: { text: () => "Updating…", tone: "ok" },
  [AppState.STALE]: { text: (rel) => `Last known prices from ${rel}`, tone: "stale" },
  [AppState.ERROR_STALE]: {
    text: (rel) => `Couldn't refresh — showing prices from ${rel}`,
    tone: "error",
  },
  [AppState.ERROR_EMPTY]: { text: () => "Couldn't load live rates", tone: "error" },
};

const statusText = computed(() => STATUS_CONFIG[props.status].text(relativeTime.value));
const statusTone = computed(() => STATUS_CONFIG[props.status].tone);
const refreshLabel = computed(() =>
  props.status === AppState.ERROR_EMPTY ? "Retry" : "Refresh quote",
);
const isRefreshDisabled = computed(
  () => props.status === AppState.LOADING || props.status === AppState.REFRESHING,
);
</script>

<template>
  <footer class="status-bar">
    <p class="status-bar__text" aria-live="polite">
      <span
        class="status-bar__dot"
        :class="`status-bar__dot--${statusTone}`"
        aria-hidden="true"
      ></span>
      {{ statusText }}
    </p>
    <div class="status-bar__actions">
      <button
        type="button"
        class="status-bar__button"
        :disabled="isRefreshDisabled"
        @click="emit('refresh')"
      >
        {{ refreshLabel }}
      </button>
    </div>
  </footer>
</template>

<style scoped>
.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin: auto calc(-1 * var(--calculator-padding-x)) calc(-1 * var(--calculator-padding-bottom));
  padding: var(--space-4) var(--calculator-padding-x) var(--calculator-padding-bottom);
  border-top: 1px solid var(--color-line);
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  background: var(--color-surface-glass);
  font-size: var(--font-size-xs);
  font-weight: 700;
  letter-spacing: var(--letter-spacing-label);
  text-transform: uppercase;
}

.status-bar__text {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  min-width: 0;
  flex: 1 1 auto;
}

.status-bar__dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.status-bar__dot--loading,
.status-bar__dot--stale {
  background: var(--color-status-stale);
}

.status-bar__dot--ok {
  background: var(--color-status-ok);
}

.status-bar__dot--error {
  background: var(--color-status-error);
}

.status-bar__actions {
  display: flex;
  flex-shrink: 0;
  gap: var(--space-4);
}

.status-bar__button {
  background: none;
  border: none;
  padding: 0;
  color: var(--color-text);
  font-size: inherit;
  font-weight: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  font-family: inherit;
  cursor: pointer;
}

.status-bar__button:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.status-bar__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
