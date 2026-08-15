import { ref, onMounted, onUnmounted } from "vue";
import { config } from "../config";
import { fetchRates } from "../lib/coinbase";

export function useExchangeRates() {
  const rates = ref(null);
  const fetchedAt = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const isStale = ref(false);

  const FETCH_TIMEOUT_MS = 10_000;

  let controller = null;
  let intervalId = null;
  let staleTimeoutId = null;

  function scheduleStaleCheck() {
    clearTimeout(staleTimeoutId);
    isStale.value = false;
    staleTimeoutId = setTimeout(() => {
      isStale.value = true;
    }, config.REFRESH_INTERVAL_MS);
  }

  async function refresh() {
    // Abort whatever's in flight rather than skipping — otherwise a hung request
    // leaves isLoading stuck true forever and Retry can never restart it.
    controller?.abort();
    const activeController = new AbortController();
    controller = activeController;
    isLoading.value = true;

    try {
      const data = await fetchRates({
        base: config.DEFAULT_BASE_CURRENCY,
        signal: AbortSignal.any([activeController.signal, AbortSignal.timeout(FETCH_TIMEOUT_MS)]),
        requiredAssets: config.DEFAULT_ASSETS,
      });
      rates.value = data;
      fetchedAt.value = Date.now();
      error.value = null;
      scheduleStaleCheck();
    } catch (err) {
      // Only ignore the abort if a newer refresh() replaced this one — otherwise this
      // run's own timeout/cancel (e.g. on unmount) would silently vanish with no error.
      if (err.name === "AbortError" && controller !== activeController) return;
      error.value = err;
    } finally {
      // Only the still-current request is allowed to clear isLoading — a superseded
      // request's finally must not clobber the state of the one that replaced it.
      if (controller === activeController) {
        isLoading.value = false;
      }
    }
  }

  function startInterval() {
    clearInterval(intervalId);
    intervalId = setInterval(refresh, config.REFRESH_INTERVAL_MS);
  }

  function stopInterval() {
    clearInterval(intervalId);
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      stopInterval();
      return;
    }
    if (!fetchedAt.value || Date.now() - fetchedAt.value > config.REFRESH_INTERVAL_MS) {
      refresh();
    }
    startInterval();
  }

  onMounted(() => {
    refresh();
    startInterval();
    document.addEventListener("visibilitychange", handleVisibilityChange);
  });

  onUnmounted(() => {
    stopInterval();
    clearTimeout(staleTimeoutId);
    controller?.abort();
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  });

  return { rates, fetchedAt, isLoading, error, isStale, refresh };
}
