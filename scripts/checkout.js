let CHECKOUT_TOTAL = 33000000;

document.addEventListener("DOMContentLoaded", () => {
  renderCheckoutItems();
  try {
    const savedCheckout = JSON.parse(sessionStorage.getItem("hesabyarCheckout") || "{}");
    if (Number(savedCheckout.total) > 0) {
      CHECKOUT_TOTAL = Number(savedCheckout.total);
    }
  } catch (error) {
    CHECKOUT_TOTAL = 33000000;
  }
  const discountInput = document.getElementById("discountInput");
  const discountButton = document.getElementById("discountBtn");
  const discountRow = document.getElementById("discountRow");
  const discountAmount = document.getElementById("discountAmount");
  const finalPrice = document.getElementById("cartFinalPrice");
  let finalAmount = CHECKOUT_TOTAL;

  const formatMoney = (value) => `${Number(value).toLocaleString("fa-IR")} تومان`;
  const showMessage = (message, type) => {
    let messageEl = document.querySelector(".checkout-message");
    if (!messageEl) {
      messageEl = document.createElement("p");
      messageEl.className = "checkout-message";
      discountInput.closest(".form-group").after(messageEl);
    }
    messageEl.textContent = message;
    messageEl.dataset.type = type || "info";
  };

  sessionStorage.setItem(
    "hesabyarCheckout",
    JSON.stringify({ total: CHECKOUT_TOTAL, finalAmount }),
  );

  discountButton?.addEventListener("click", async () => {
    const code = discountInput.value.trim();
    if (!code) {
      showMessage("کد تخفیف را وارد کنید.", "error");
      return;
    }

    discountButton.disabled = true;
    try {
      const result = await appApi.commerce.validateCoupon({ code });
      const discount = Math.round((CHECKOUT_TOTAL * result.percent) / 100);
      finalAmount = CHECKOUT_TOTAL - discount;
      discountRow.hidden = false;
      discountAmount.textContent = formatMoney(discount);
      finalPrice.textContent = formatMoney(finalAmount);
      sessionStorage.setItem(
        "hesabyarCheckout",
        JSON.stringify({ total: CHECKOUT_TOTAL, finalAmount, code: result.code }),
      );
      showMessage(result.message, "success");
    } catch (error) {
      showMessage(error.message, "error");
    } finally {
      discountButton.disabled = false;
    }
  });
});

function renderCheckoutItems() {
  const container = document.querySelector(".cart-items-list");
  if (!container) return;

  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem("hesabyarCart") || "[]");
  } catch (error) {
    cart = [];
  }

  if (!Array.isArray(cart) || !cart.length) return;

  container.replaceChildren();
  cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-item";
    const image = document.createElement("img");
    image.src = item.img || "../images/ravin.png";
    image.alt = item.name || "محصول";
    const info = document.createElement("div");
    info.className = "cart-item-info";
    const title = document.createElement("h4");
    title.textContent = item.name || "محصول بدون نام";
    const price = document.createElement("p");
    price.className = "price";
    price.textContent = `${Number(item.price || 0).toLocaleString("fa-IR")} تومان (تعداد: ${item.qty || 1})`;
    info.append(title, price);
    row.append(image, info);
    container.appendChild(row);
  });
}
