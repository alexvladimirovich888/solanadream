let solPrice = 160; // Начальная цена

// Функция для получения цены из localStorage
function getSavedSolPrice() {
  const savedPrice = localStorage.getItem("solPrice");
  return savedPrice ? parseFloat(savedPrice) : null;
}

// Функция для сохранения цены в localStorage
function saveSolPrice(price) {
  localStorage.setItem("solPrice", price.toString());
  solPrice = price;
}

// Основная функция обновления
function updateSOLPrice() {
  fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
  )
    .then((response) => response.json())
    .then((data) => {
      if (data && data.solana && data.solana.usd) {
        const apiPrice = data.solana.usd;
        const change = (Math.random() - 0.5) * 2; // Уменьшил колебания
        const newPrice = Math.max(100, apiPrice + change);

        saveSolPrice(newPrice);
        updateUI(newPrice);
      }
    })
    .catch((error) => {
      console.error("API Error:", error);
      const savedPrice = getSavedSolPrice();
      if (savedPrice) {
        // Используем сохраненное значение с небольшими колебаниями
        const change = (Math.random() - 0.5) * 1; // Минимальные колебания
        const newPrice = Math.max(100, savedPrice + change);
        updateUI(newPrice);
      } else {
        // Если нет сохраненного значения, используем начальное
        updateUI(solPrice);
      }
    })
    .finally(() => {
      // Всегда планируем следующее обновление через 30 секунд
      setTimeout(updateSOLPrice, 900000);
    });
}

// Функция обновления интерфейса
function updateUI(price) {
  if (typeof window.updateSOLPrice === "function") {
    window.updateSOLPrice(price);
  }
  document.getElementById(
    "sol-price-display"
  ).textContent = `1 SOL = $${price.toFixed(2)}`;
}

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
  const savedPrice = getSavedSolPrice();
  if (savedPrice) {
    solPrice = savedPrice;
    updateUI(solPrice);
  }
  updateSOLPrice(); // Первый запрос
});
