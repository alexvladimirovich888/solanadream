// Price Management Module
const PriceManager = (function () {
  let solPrice = 160; // Default SOL price

  // Get saved price from localStorage
  function getSavedSolPrice() {
    const savedPrice = localStorage.getItem("solPrice");
    return savedPrice ? parseFloat(savedPrice) : null;
  }

  // Save price to localStorage
  function saveSolPrice(price) {
    localStorage.setItem("solPrice", price.toString());
    solPrice = price;
  }

  // Fetch current SOL price from CoinGecko API
  function fetchSOLPrice() {
    return fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
    )
      .then((response) => response.json())
      .then((data) => {
        if (data?.solana?.usd) {
          return data.solana.usd;
        }
        throw new Error("Invalid API response");
      });
  }

  // Update SOL price with slight randomization
  function updateSOLPrice() {
    fetchSOLPrice()
      .then((apiPrice) => {
        // Add small random fluctuation (+/- $2)
        const change = (Math.random() - 0.5) * 4;
        const newPrice = Math.max(100, apiPrice + change);

        saveSolPrice(newPrice);
        updateUI(newPrice);
        ProductManager.updateSolPrice(newPrice);
      })
      .catch((error) => {
        console.error("API Error:", error);
        // Fallback to saved price with small fluctuation
        const savedPrice = getSavedSolPrice();
        if (savedPrice) {
          const change = (Math.random() - 0.5) * 2;
          const newPrice = Math.max(100, savedPrice + change);
          updateUI(newPrice);
          ProductManager.updateSolPrice(newPrice);
        }
      })
      .finally(() => {
        // Schedule next update in 15 minutes
        setTimeout(updateSOLPrice, 900000);
      });
  }

  // Update price display
  function updateUI(price) {
    document.getElementById(
      "sol-price"
    ).textContent = `1 SOL = $${price.toFixed(2)}`;
  }

  // Initialize price module
  function init() {
    const savedPrice = getSavedSolPrice();
    if (savedPrice) {
      solPrice = savedPrice;
      updateUI(solPrice);
    }
    updateSOLPrice(); // First update

    return {
      getCurrentPrice: () => solPrice,
    };
  }

  return {
    init: init,
  };
})();

// Product Management Module
const ProductManager = (function () {
  // Product database
  const products = [
    {
      id: 1,
      name: "Rolex Daytona",
      category: "watches",
      price: 15000,
      image: "images/rolex.png",
    },
    {
      id: 2,
      name: "Ferrari 488 GTB",
      category: "cars",
      price: 250000,
      image: "images/ferrari.png",
    },
    {
      id: 3,
      name: "Patek Philippe",
      category: "watches",
      price: 1200000,
      image: "images/patek.png",
    },
    {
      id: 4,
      name: "Lamborghini Revuelto",
      category: "cars",
      price: 900000,
      image: "images/lamba.jpg",
    },
    {
      id: 5,
      name: "Aston Martin Valhalla",
      category: "cars",
      price: 1000000,
      image: "images/Aston.jpg",
    },
    {
      id: 6,
      name: "Ferrari Roma",
      category: "cars",
      price: 225000,
      image: "images/ferrariRoma.jpg",
    },
    {
      id: 7,
      name: "Luxury Villa",
      category: "real-estate",
      price: 449000,
      image: "images/villa1.webp",
    },
    {
      id: 8,
      name: "Beachfront Villa",
      category: "real-estate",
      price: 1000000,
      image: "images/villa2.webp",
    },
    {
      id: 9,
      name: "Modern Villa",
      category: "real-estate",
      price: 380000,
      image: "images/villa3.webp",
    },
    {
      id: 10,
      name: "Countryside Villa",
      category: "real-estate",
      price: 250000,
      image: "images/villa4.jpg",
    },
    {
      id: 11,
      name: "Luxury Phone",
      category: "gadgets",
      price: 100000,
      image: "images/phone1.jpg",
    },
    {
      id: 12,
      name: "Premium Headphones",
      category: "gadgets",
      price: 70000,
      image: "images/headphones.jpg",
    },
    {
      id: 13,
      name: "Diamond iPhone",
      category: "gadgets",
      price: 600000,
      image: "images/iphone1.jpeg",
    },
    {
      id: 14,
      name: "Foldable Phone",
      category: "gadgets",
      price: 100000,
      image: "images/phone2.jpg",
    },
    {
      id: 15,
      name: "Designer Dress",
      category: "fashion",
      price: 30000,
      image: "images/fashion1.jpg",
    },
    {
      id: 16,
      name: "Luxury Handbag",
      category: "fashion",
      price: 28000,
      image: "images/bag1.jpg",
    },
    {
      id: 17,
      name: "Designer Bag",
      category: "fashion",
      price: 32000,
      image: "images/bag2.jpg",
    },
    {
      id: 18,
      name: "Premium Bag",
      category: "fashion",
      price: 70000,
      image: "images/bag3.jpg",
    },
  ];

  let solPrice = 160;
  let cart = [];
  let currentFilter = "all";

  // Update SOL price for product calculations
  function updateSolPrice(newPrice) {
    solPrice = newPrice;
    renderProducts();
    updateCartDisplay();
  }

  // Render product grid
  function renderProducts() {
    const productsGrid = document.getElementById("products-grid");
    if (!productsGrid) return;

    productsGrid.innerHTML = "";

    const filteredProducts =
      currentFilter === "all"
        ? products
        : products.filter((p) => p.category === currentFilter);

    filteredProducts.forEach((product) => {
      const solValue = (product.price / solPrice).toFixed(2);

      const productCard = document.createElement("div");
      productCard.className = "product-card";
      productCard.dataset.category = product.category;
      productCard.dataset.price = product.price;

      productCard.innerHTML = `
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-info">
          <h3>${product.name}</h3>
          <div class="product-price">
            <span class="usd-price">$${product.price.toLocaleString()}</span>
            <span class="sol-price">◎${solValue}</span>
          </div>
          <button class="add-to-dream" data-id="${
            product.id
          }">Add to Dream</button>
        </div>
      `;

      productsGrid.appendChild(productCard);
    });

    // Add event listeners to new buttons
    document.querySelectorAll(".add-to-dream").forEach((button) => {
      button.addEventListener("click", addToCart);
    });
  }

  // Add product to cart
  function addToCart(e) {
    const productId = parseInt(e.target.dataset.id);
    const product = products.find((p) => p.id === productId);

    if (!product) return;

    const existingItem = cart.find((item) => item.id === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        ...product,
        quantity: 1,
      });
    }

    updateCartDisplay();
    animateAddToCart(e.target);
  }

  // Animate add to cart button
  function animateAddToCart(button) {
    button.textContent = "Added!";
    button.style.backgroundColor = "#74b9ff";

    setTimeout(() => {
      button.textContent = "Add to Dream";
      button.style.backgroundColor = "";
    }, 1000);
  }

  // Update cart display
  function updateCartDisplay() {
    const cartItems = document.getElementById("cart-items");
    const usdTotal = document.querySelector(".usd-total");
    const solTotal = document.querySelector(".sol-total");
    const daysCounter = document.getElementById("days-counter");

    if (!cartItems || !usdTotal || !solTotal || !daysCounter) return;

    if (cart.length === 0) {
      cartItems.innerHTML =
        '<div class="empty-cart">Your dream is empty... for now</div>';
      usdTotal.textContent = "$0.00";
      solTotal.textContent = "◎0.00";
      daysCounter.textContent = "Start adding items to your dream!";
      return;
    }

    cartItems.innerHTML = "";
    let totalUSD = 0;

    cart.forEach((item) => {
      totalUSD += item.price * item.quantity;
      const solValue = (item.price / solPrice).toFixed(2);

      const cartItem = document.createElement("div");
      cartItem.className = "cart-item";
      cartItem.innerHTML = `
        <div class="item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="item-details">
          <div class="item-name">${item.name}</div>
          <div class="item-price">
            $${item.price.toLocaleString()} • <span class="sol-price">◎${solValue}</span>
          </div>
        </div>
        <button class="remove-item" data-id="${item.id}">×</button>
      `;

      cartItems.appendChild(cartItem);
    });

    // Add event listeners to remove buttons
    document.querySelectorAll(".remove-item").forEach((button) => {
      button.addEventListener("click", removeFromCart);
    });

    // Update totals
    usdTotal.textContent = `$${totalUSD.toLocaleString()}`;
    const totalSOL = totalUSD / solPrice;
    solTotal.textContent = `◎${totalSOL.toFixed(2)}`;
    updateDaysCalculation();
  }

  // Remove item from cart
  function removeFromCart(e) {
    const productId = parseInt(e.target.dataset.id);
    cart = cart.filter((item) => item.id !== productId);
    updateCartDisplay();
  }

  // Calculate days needed to afford dream
  function updateDaysCalculation() {
    const dailyIncomeInput = document.getElementById("daily-income");
    const daysCounter = document.getElementById("days-counter");

    if (!dailyIncomeInput || !daysCounter) return;

    const dailyIncome = parseFloat(dailyIncomeInput.value) || 0;
    const totalSOL =
      parseFloat(
        document.querySelector(".sol-total").textContent.replace("◎", "")
      ) || 0;

    if (dailyIncome > 0 && totalSOL > 0) {
      const daysNeeded = Math.ceil(totalSOL / dailyIncome);
      daysCounter.innerHTML = `You'll need <span class="sol-gradient">${daysNeeded} days</span> to afford this dream!`;
    } else if (cart.length > 0) {
      daysCounter.textContent = "Enter your daily SOL income to calculate";
    }
  }

  // Initialize product module
  function init() {
    // Set initial SOL price from PriceManager
    solPrice = PriceManager.init().getCurrentPrice();

    // Setup event listeners
    document
      .getElementById("daily-income")
      ?.addEventListener("input", updateDaysCalculation);

    document.querySelectorAll(".filter-btn").forEach((button) => {
      button.addEventListener("click", () => {
        document
          .querySelectorAll(".filter-btn")
          .forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        currentFilter = button.dataset.category;
        renderProducts();
      });
    });

    // Initial render
    renderProducts();
    updateCartDisplay();
  }

  return {
    init: init,
    updateSolPrice: updateSolPrice,
  };
})();

// Initialize application when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  PriceManager.init();
  ProductManager.init();
});
