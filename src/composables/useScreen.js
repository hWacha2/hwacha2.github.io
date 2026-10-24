import { ref } from 'vue';

// Единый брейкпоинт: должен совпадать с @media (max-width: 768px) в CSS
const MOBILE_QUERY = '(max-width: 576px)';
const mediaQuery = window.matchMedia(MOBILE_QUERY);

const isMobile = ref(mediaQuery.matches);

mediaQuery.addEventListener('change', (event) => {
  isMobile.value = event.matches;
});

export function useScreen() {
  return {
    isMobile
  };
}