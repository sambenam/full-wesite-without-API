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

    actionsContainer.innerHTML = `
            <button type="button" class="btn-action-secondary" onclick="window.print()"><i class="fas fa-print"></i> چاپ</button>
            <a href="../html/user-profile.html" class="btn-action-primary"><i class="fas fa-user-circle"></i> ورود به پروفایل</a>
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
