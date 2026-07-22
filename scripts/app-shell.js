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

  function init() {
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
