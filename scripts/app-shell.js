(function () {
  function fixKnownLinks() {
    document.querySelectorAll("a[href]").forEach((link) => {
      const href = link.getAttribute("href");
      if (href === "home.html") link.setAttribute("href", "index.html");
      if (href === "../html/home.html") link.setAttribute("href", "../html/index.html");
      if (href === "signup.html") link.setAttribute("href", "sign-up.html");
      if (href === "../html/signup.html") link.setAttribute("href", "../html/sign-up.html");
    });
  }

  function bindSearch() {
    document.querySelectorAll(".search-box input").forEach((input) => {
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && input.value.trim()) {
          window.location.href = "list-page.html?query=" + encodeURIComponent(input.value.trim());
        }
      });
    });
  }

  function bindNewsletter() {
    document.querySelectorAll(".newsletter-form").forEach((form) => {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const input = form.querySelector('input[type="email"]');
        const button = form.querySelector("button");
        if (!input?.value.trim()) return;
        const original = button?.innerHTML;
        if (button) {
          button.disabled = true;
          button.innerHTML = "...";
        }
        try {
          const result = await appApi.newsletter.subscribe({ email: input.value.trim() });
          showShellMessage(form, result.message, "success");
          form.reset();
        } catch (error) {
          showShellMessage(form, error.message, "error");
        } finally {
          if (button) {
            button.disabled = false;
            button.innerHTML = original;
          }
        }
      });
    });
  }

  function showShellMessage(form, message, type) {
    let messageEl = form.querySelector(".shell-form-message");
    if (!messageEl) {
      messageEl = document.createElement("small");
      messageEl.className = "shell-form-message";
      form.appendChild(messageEl);
    }
    messageEl.textContent = message;
    messageEl.dataset.type = type || "info";
  }

  function checkMaintenanceMode() {
    if (window.location.pathname.includes("admin.html")) {
      return;
    }
    
    const isMaintenance = localStorage.getItem("irHesabdarMaintenanceMode") === "true";
    if (isMaintenance) {
      document.body.innerHTML = `
        <div style="position: fixed; inset: 0; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 999999; color: #fff; text-align: center; font-family: 'Vazirmatn', sans-serif; padding: 20px; direction: rtl;">
          <i class="fas fa-tools" style="font-size: 5rem; color: #ff9500; margin-bottom: 20px; animation: bounce 2s infinite;"></i>
          <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 10px;">🛠️ وب‌سایت در دست تعمیر و به‌روزرسانی است</h1>
          <p style="color: #94a3b8; max-width: 500px; line-height: 1.8; margin-bottom: 20px; font-size: 15px;">کاربر گرامی، ما در حال ارتقا و بهبود خدمات وبسایت هستیم. از اینکه تا پایان این فرایند مارا همراهی میکنید متشکریم.</p>
          <div style="font-size: 13px; color: #64748b; margin-bottom: 10px;">پشتیبانی: support@irhesabdar.ir</div>
          
          <style>
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
          </style>
        </div>
      `;
      document.body.style.overflow = "hidden";
    }
  }

  function init() {
    checkMaintenanceMode();
    fixKnownLinks();
    bindSearch();
    bindNewsletter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
