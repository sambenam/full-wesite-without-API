document.addEventListener("DOMContentLoaded", () => {
  // FAQ
  document.querySelectorAll(".faq-item").forEach((item) => {
    item.querySelector(".faq-question")?.addEventListener("click", () => {
      item.classList.toggle("active");
    });
  });

  // کاستوم سلکت زیبا
  const nativeSelect = document.getElementById("subject");
  if (nativeSelect) {
    const icons = {
      question: "fa-circle-question",
      feedback: "fa-lightbulb",
      bug: "fa-bug",
      cooperation: "fa-handshake",
    };
    const labels = {
      question: "سوال آموزشی",
      feedback: "نظر یا پیشنهاد",
      bug: "گزارش مشکل",
      cooperation: "همکاری",
    };

    const wrapper = document.createElement("div");
    wrapper.className = "custom-select-wrapper";
    const customSelect = document.createElement("div");
    customSelect.className = "custom-select";
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "custom-select-trigger";
    trigger.innerHTML = `<span class="custom-select-placeholder">موضوع را انتخاب کنید</span>`;
    const optionsList = document.createElement("ul");
    optionsList.className = "custom-select-options";

    Array.from(nativeSelect.options).forEach((opt) => {
      if (!opt.value) return;
      const li = document.createElement("li");
      li.className = "custom-select-option";
      li.dataset.value = opt.value;
      const iconClass = icons[opt.value] || "fa-tag";
      li.innerHTML = `<span style="display:flex;align-items:center;gap:10px"><span class="opt-icon"><i class="fa-solid ${iconClass}"></i></span>${labels[opt.value] || opt.textContent}</span>`;
      li.addEventListener("click", () => {
        nativeSelect.value = opt.value;
        trigger.innerHTML = `<span style="display:flex;align-items:center;gap:10px"><span class="opt-icon"><i class="fa-solid ${iconClass}"></i></span><span class="custom-select-value">${labels[opt.value]}</span></span>`;
        optionsList
          .querySelectorAll(".custom-select-option")
          .forEach((o) => o.classList.remove("selected"));
        li.classList.add("selected");
        customSelect.classList.remove("open");
      });
      optionsList.appendChild(li);
    });

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      customSelect.classList.toggle("open");
    });
    document.addEventListener("click", () =>
      customSelect.classList.remove("open"),
    );

    customSelect.appendChild(trigger);
    customSelect.appendChild(optionsList);
    wrapper.appendChild(customSelect);
    nativeSelect.classList.add("native-select-hidden");
    nativeSelect.parentNode.insertBefore(wrapper, nativeSelect.nextSibling);
  }

  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    const showMessage = (message, type) => {
      let messageEl = contactForm.querySelector(".form-message");
      if (!messageEl) {
        messageEl = document.createElement("p");
        messageEl.className = "form-message";
        contactForm.prepend(messageEl);
      }
      messageEl.textContent = message;
      messageEl.dataset.type = type || "info";
    };

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submit = contactForm.querySelector('[type="submit"]');
      const originalText = submit?.innerHTML;
      if (submit) {
        submit.disabled = true;
        submit.innerHTML = "در حال ارسال...";
      }

      try {
        await appApi.support.sendMessage({
          name: document.getElementById("name").value.trim(),
          email: document.getElementById("email").value.trim(),
          subject: document.getElementById("subject").value,
          message: document.getElementById("message").value.trim(),
        });
        contactForm.reset();
        if (nativeSelect) {
          nativeSelect.value = "";
        }
        showMessage("پیام شما با موفقیت ارسال شد.", "success");
      } catch (error) {
        showMessage(error.message, "error");
      } finally {
        if (submit) {
          submit.disabled = false;
          submit.innerHTML = originalText;
        }
      }
    });
  }
});
