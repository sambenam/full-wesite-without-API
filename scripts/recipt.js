/**
 * Smart Receipt JavaScript
 * Reads URL query params (?status=success or ?status=failed) and updates UI dynamically.
 */

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get("status") || "success";

  const card = document.getElementById("receiptCard");
  const iconElem = document.getElementById("iconElement");
  const titleElem = document.getElementById("receiptTitle");
  const subtitleElem = document.getElementById("receiptSubtitle");
  const statusBadge = document.getElementById("statusBadge");
  const actionsContainer = document.getElementById("receiptActions");
  const orderIdElem = document.getElementById("orderId");
  const trxIdElem = document.getElementById("trxId");
  const amountElem = document.querySelector(".price-text");
  const orderId = urlParams.get("orderId");

  if (orderIdElem && orderId) {
    orderIdElem.textContent = orderId;
  }
  if (trxIdElem && orderId) {
    trxIdElem.textContent = "TRX-" + orderId.slice(-8).toUpperCase();
  }
  try {
    const checkout = JSON.parse(sessionStorage.getItem("hesabyarCheckout") || "{}");
    if (amountElem && checkout.finalAmount) {
      amountElem.textContent = Number(checkout.finalAmount).toLocaleString("fa-IR") + " تومان";
    }
  } catch (error) {
    console.warn("receipt: اطلاعات سفارش خوانده نشد", error);
  }

  if (status === "success") {
    card.classList.add("success");
    iconElem.className = "fas fa-check";
    titleElem.textContent = "تراکنش با موفقیت انجام شد";
    subtitleElem.textContent = "پرداخت شما با موفقیت ثبت و تایید گردید";
    statusBadge.textContent = "موفق (تایید شده)";

    // REGISTER THE PURCHASE & ORDER INTERACTIVELY!
    let cart = [];
    try {
      cart = JSON.parse(localStorage.getItem("hesabyarCart") || "[]");
    } catch(e) {}

    let downloadButtonHtml = "";
    if (Array.isArray(cart) && cart.length > 0) {
      const product = cart[0];

      // 1. Unlock the product!
      try {
        const purchasedRaw = localStorage.getItem("irHesabdarPurchasedProducts");
        let purchased = purchasedRaw ? JSON.parse(purchasedRaw) : [];
        if (!Array.isArray(purchased)) purchased = [];
        if (purchased.indexOf(product.id) === -1) {
          purchased.push(product.id);
        }
        localStorage.setItem("irHesabdarPurchasedProducts", JSON.stringify(purchased));
      } catch (e) {
        console.error("error unlocking product:", e);
      }

      // 2. Fetch fileUrl of this product to render the download button
      let fileUrl = "#";
      try {
        const prodsRaw = localStorage.getItem("irHesabdarProducts");
        const prods = prodsRaw ? JSON.parse(prodsRaw) : [];
        if (Array.isArray(prods)) {
          const match = prods.find(function(p) { return String(p.id) === String(product.id); });
          if (match && match.fileUrl) {
            fileUrl = match.fileUrl;
          }
        }
      } catch (e) {}

      if (fileUrl && fileUrl !== "#") {
        downloadButtonHtml = `
          <a href="${fileUrl}" download class="btn-action-primary" style="background: #34c759; margin-top: 10px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <i class="fas fa-file-arrow-down"></i> دانلود فایل اصلی محصول
          </a>
        `;
      }

      // 3. Register the order in the Admin Orders list!
      try {
        const ordersRaw = localStorage.getItem("irHesabdarOrders");
        let orders = ordersRaw ? JSON.parse(ordersRaw) : [];
        if (!Array.isArray(orders)) orders = [];

        const buyerName = localStorage.getItem("irHesabdarBuyerName") || "سام به‌نام";
        
        // Generate a random numeric order number
        const randomOrderId = "#" + Math.floor(10000 + Math.random() * 90000);
        
        // Get today's Persian Jalali date or a mock today date
        const today = new Date();
        const year = today.getFullYear() - 19; // Mocking Jalali year
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayJalali = `۱۴۰۵/${month}/${day}`;

        let finalPriceText = Number(product.price || 50000).toLocaleString("fa-IR") + " تومان";
        try {
          const checkout = JSON.parse(sessionStorage.getItem("hesabyarCheckout") || "{}");
          if (checkout.finalAmount) {
            finalPriceText = Number(checkout.finalAmount).toLocaleString("fa-IR") + " تومان";
          }
        } catch(e) {}

        const newOrder = {
          id: randomOrderId,
          customer: buyerName,
          product: product.name,
          amount: finalPriceText,
          date: todayJalali,
          status: "success"
        };

        orders.unshift(newOrder);
        localStorage.setItem("irHesabdarOrders", JSON.stringify(orders));
      } catch(e) {
        console.error("error saving order:", e);
      }

      // 4. Clear the cart
      localStorage.removeItem("hesabyarCart");
    }

    actionsContainer.innerHTML = `
            ${downloadButtonHtml}
            <button type="button" class="btn-action-secondary" onclick="window.print()"><i class="fas fa-print"></i> چاپ فاکتور</button>
            <a href="index.html" class="btn-action-primary"><i class="fas fa-house"></i> بازگشت به صفحه اصلی</a>
        `;
  } else {
    card.classList.add("failed");
    iconElem.className = "fas fa-times";
    titleElem.textContent = "تراکنش ناموفق بود";
    subtitleElem.textContent = "عملیات پرداخت لغو شد یا با خطا مواجه گردید";
    statusBadge.textContent = "ناموفق (خطا / انصراف)";

    actionsContainer.innerHTML = `
            <a href="gateway.html" class="btn-action-secondary" style="background:#fee2e2; color:#991b1b;"><i class="fas fa-redo"></i> تلاش مجدد</a>
            <a href="../html/user-profile.html" class="btn-action-primary" style="background:#ef4444;"><i class="fas fa-arrow-right"></i> بازگشت به پروفایل</a>
        `;
  }
});
