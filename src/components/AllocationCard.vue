<script setup>
import { computed } from "vue";
import BaseCard from "./BaseCard.vue";
import { config } from "../config";
import { formatBaseAmount, formatQuantity, formatUnitPrice } from "../lib/format";
import { AppState } from "../lib/appState";

const props = defineProps({
  variant: {
    type: String,
    required: true,
    validator: (value) => ["asset-a", "asset-b"].includes(value),
  },
  status: {
    type: String,
    required: true,
    validator: (value) => Object.values(AppState).includes(value),
  },
  assetCode: {
    type: String,
    default: null,
  },
  percent: {
    type: Number,
    required: true,
    validator: (value) => value >= 0 && value <= 100,
  },
  allocated: {
    type: Number,
    default: null,
  },
  quantity: {
    type: Number,
    default: null,
  },
  rate: {
    type: Number,
    default: null,
  },
});

const isLoading = computed(() => props.status === AppState.LOADING);
const isErrorEmpty = computed(() => props.status === AppState.ERROR_EMPTY);
const isDimmed = computed(() => props.status === AppState.ERROR_STALE);
</script>

<template>
  <BaseCard
    class="allocation-card"
    :class="`allocation-card--${variant}`"
    :provisional="isDimmed"
    role="group"
    :aria-label="`${assetCode} allocation, ${percent} percent`"
    aria-live="polite"
    :aria-busy="isLoading"
  >
    <div class="allocation-card__header">
      <span class="allocation-card__title">{{ assetCode }}</span>
      <span class="allocation-card__badge">{{ percent }}%</span>
    </div>
    <p v-if="isErrorEmpty" class="allocation-card__message">No live rates available yet.</p>

    <template v-else>
      <div class="allocation-card__subheader">
        <p class="allocation-card__label label">Allocated {{ config.DEFAULT_BASE_CURRENCY }}</p>
        <strong class="allocation-card__allocated" :class="{ skeleton: isLoading }">
          {{ isLoading ? "" : formatBaseAmount(allocated) }}
        </strong>
      </div>
      <p class="allocation-card__quantity" :class="{ skeleton: isLoading }">
        <template v-if="!isLoading">
          {{ formatQuantity(quantity) }}
          <span class="allocation-card__asset">{{ assetCode }}</span>
        </template>
      </p>
      <p class="allocation-card__caption">
        <template v-if="isLoading">Fetching quote…</template>
        <template v-else-if="rate !== null">
          {{ assetCode }} at {{ formatUnitPrice(rate)
          }}<template v-if="isDimmed"> · last known quote</template>
        </template>
        <template v-else>No quote available for {{ assetCode }}</template>
      </p>
    </template>
  </BaseCard>
</template>

<style scoped>
.allocation-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.allocation-card--asset-a {
  --card-accent: var(--color-asset-a);
  background: var(--color-surface-a);
}

.allocation-card--asset-b {
  --card-accent: var(--color-asset-b);
  background: var(--color-surface-b);
}

.allocation-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.allocation-card__title {
  font-weight: 700;
  color: var(--color-text-dim);
  font-size: var(--font-size-md);
}

.allocation-card__subheader {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  justify-content: space-between;
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-line);
}

.allocation-card__badge {
  background: var(--card-accent);
  color: var(--color-on-accent);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-pill);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  font-size: var(--font-size-xs);
}

.allocation-card__label {
  margin: 0 0 var(--space-2);
  color: var(--card-accent);
  font-weight: 700;
}

.allocation-card__allocated {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text);
}

.allocation-card__allocated.skeleton {
  width: 40%;
  height: 1em;
}

.allocation-card__quantity {
  margin: 0 0 var(--space-2);
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: 600;
  line-height: 1.1;
}

.allocation-card__asset {
  margin-left: var(--space-2);
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--color-text-dim);
  letter-spacing: 0.04em;
}

.allocation-card__quantity.skeleton {
  width: 70%;
  height: 1.2em;
}

.allocation-card__caption {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.allocation-card__message {
  margin: 0;
  color: var(--color-text-muted);
}
</style>
