<script setup>
import { ref, computed } from "vue";
import BaseCard from "./BaseCard.vue";
import { config } from "../config";
import { currencySymbol, formatBaseAmount } from "../lib/format";

const props = defineProps({
  amount: {
    type: Number,
    required: true,
  },
  splitPercent: {
    type: Number,
    required: true,
    validator: (value) => value >= 0 && value <= 100,
  },
  currency: {
    type: String,
    required: true,
  },
  assetA: {
    type: String,
    required: true,
  },
  assetB: {
    type: String,
    required: true,
  },
  allocatedA: {
    type: Number,
    default: null,
  },
  allocatedB: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits(["update:amount", "update:splitPercent"]);

const otherPercent = computed(() => 100 - props.splitPercent);

const splitPercentModel = computed({
  get: () => props.splitPercent,
  set: (value) => emit("update:splitPercent", value),
});

function formatAmount(value) {
  return new Intl.NumberFormat(config.DEFAULT_LOCALE, { maximumFractionDigits: 2 }).format(value);
}

const amountInput = ref(formatAmount(props.amount));

function handleAmountInput(event) {
  const cleaned = event.target.value.replace(/[^\d.]/g, "");
  const [whole = "", ...rest] = cleaned.split(".");
  const fraction = rest.join("");
  const normalized = rest.length ? `${whole}.${fraction}` : whole;

  const number = Number(normalized);
  emit("update:amount", Number.isFinite(number) ? number : 0);

  // Stay raw for the whole typing session — comma grouping only applies on blur,
  // otherwise inserting a comma mid-number resets the caret to the end.
  amountInput.value = normalized;
}

function handleAmountBlur() {
  const rounded = Math.round(props.amount * 100) / 100;
  emit("update:amount", rounded);
  // Leave a zero amount truly empty so the "0" placeholder shows instead of a real "0".
  amountInput.value = rounded === 0 ? "" : formatAmount(rounded);
}
</script>

<template>
  <BaseCard class="amount-card">
    <label class="amount-card__label label" for="amount">Amount to allocate</label>
    <div class="amount-card__amount-row">
      <span class="amount-card__prefix">{{ currencySymbol(currency) }}</span>
      <input
        id="amount"
        :value="amountInput"
        type="text"
        inputmode="decimal"
        placeholder="0"
        class="amount-card__input"
        @input="handleAmountInput"
        @blur="handleAmountBlur"
        @keydown.enter="$event.target.blur()"
      />
      <span class="amount-card__suffix label">{{ currency }}</span>
    </div>

    <div class="amount-card__split-header">
      <label class="amount-card__label label" for="split">Split</label>
      <span class="amount-card__hint">Drag to rebalance · 1% steps</span>
    </div>
    <div class="amount-card__split-readout">
      <span class="amount-card__split-value amount-card__split-value--a">
        {{ splitPercent }}%
        <span class="amount-card__split-unit">{{ assetA }}</span>
      </span>
      <span class="amount-card__split-value amount-card__split-value--b">
        <span class="amount-card__split-unit">{{ assetB }}</span>
        {{ otherPercent }}%
      </span>
    </div>
    <input
      id="split"
      v-model.number="splitPercentModel"
      type="range"
      min="0"
      max="100"
      class="amount-card__slider"
      :style="{ '--split-percent': `${splitPercent}%` }"
    />
    <div class="amount-card__split-amounts">
      <span class="amount-card__split-amount amount-card__split-amount--a">{{
        formatBaseAmount(allocatedA, currency)
      }}</span>
      <span class="amount-card__split-amount amount-card__split-amount--b">{{
        formatBaseAmount(allocatedB, currency)
      }}</span>
    </div>
  </BaseCard>
</template>

<style scoped>
.amount-card {
  margin-bottom: var(--space-6);
}

.amount-card__label {
  display: block;
  font-weight: 700;
}

.amount-card__amount-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-line);
}

.amount-card__prefix {
  font-size: var(--font-size-lg);
  color: var(--color-text-muted);
  font-weight: 700;
}

.amount-card__input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: 700;
}

.amount-card__input::placeholder {
  color: var(--color-text-muted);
  opacity: 1;
}

.amount-card__input:focus {
  outline: none;
}

.amount-card__input:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.amount-card__suffix {
  margin: 0;
}

.amount-card__split-header {
  padding-top: var(--space-3);
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.amount-card__hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.amount-card__split-readout {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: 700;
}

.amount-card__split-value--a {
  color: var(--color-asset-a);
}

.amount-card__split-value--b {
  color: var(--color-asset-b);
}

.amount-card__split-unit {
  font-size: var(--font-size-sm);
  font-weight: 600;
  margin: 0 var(--space-1);
}

.amount-card__slider {
  width: 100%;
  margin-bottom: var(--space-2);
  appearance: none;
  height: 10px;
  border-radius: var(--radius-pill);
  background: linear-gradient(
    90deg,
    var(--color-asset-a) 0%,
    var(--color-asset-a) var(--split-percent),
    var(--color-asset-b) var(--split-percent),
    var(--color-asset-b) 100%
  );
  outline: none;
}

.amount-card__slider:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.amount-card__slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--color-surface);
  cursor: pointer;
}

.amount-card__slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--color-surface);
  cursor: pointer;
}

.amount-card__split-amounts {
  display: flex;
  font-size: var(--font-size-sm);
  justify-content: space-between;
  font-weight: 700;
}

.amount-card__split-amount--a {
  color: var(--color-asset-a);
}

.amount-card__split-amount--b {
  color: var(--color-asset-b);
}
</style>
