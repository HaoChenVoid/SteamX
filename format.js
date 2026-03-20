export const LANGUAGES = ['中文', 'English', '日本語', '한국어', 'Deutsch', 'Français', 'Español'];
export const CURRENCIES = {
  CNY: { symbol: '¥', label: '人民币', rate: 7.2 },
  USD: { symbol: '$', label: '美元', rate: 1 },
  EUR: { symbol: '€', label: '欧元', rate: 0.92 },
  JPY: { symbol: '¥', label: '日元', rate: 148 },
  KRW: { symbol: '₩', label: '韩元', rate: 1320 },
};

export function formatMoney(value, currency) {
  const c = CURRENCIES[currency] || CURRENCIES.USD;
  const amount = value * c.rate;
  if (value === 0) return currency === 'USD' ? '$0.00' : `${c.symbol}0`;
  const isInt = currency === 'KRW' || currency === 'JPY';
  return `${c.symbol}${isInt ? Math.round(amount) : amount.toFixed(2)}`;
}
export const pct = (n) => `${Math.round(n)}%`;
export const normalize = (value) => String(value || '').toLowerCase().trim();
export const getStoreCountry = (currency) => ({ CNY: 'cn', JPY: 'jp', KRW: 'kr', EUR: 'de' }[currency] || 'us');
export const getStoreLanguage = (language) => ({ '中文': 'schinese', '日本語': 'japanese', '한국어': 'koreana', 'Deutsch': 'german', 'Français': 'french', 'Español': 'spanish' }[language] || 'english');
