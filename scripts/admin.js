/**
 * Complete Admin Panel JavaScript
 * Fully interactive views, CRUD operations, search filters, notifications, and modals.
 */

function toPersianDigits(value) {
  const charMap = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(value || "").replace(/[0-9]/g, (match) => charMap[parseInt(match)]);
}

function loadDynamicProducts() {
  try {
    const raw = localStorage.getItem("irHesabdarProducts");
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(p => p && p.id) : [];
    }
  } catch (e) {
    console.warn("admin: error loading products", e);
  }
  localStorage.setItem("irHesabdarProducts", JSON.stringify([]));
  return [];
}

const initialOrders = [
  { id: "#۷۴۸۳۲", customer: "سام به‌نام", product: "دانلود فایل PDF دوره حسابداری مقدماتی", amount: "۴۹,۰۰۰ تومان", date: "۱۴۰۵/۰۵/۰۱", status: "success" },
  { id: "#۵۸۳۹۲", customer: "مریم حسینی", product: "دانلود ویدیوهای آموزشی دوره حسابداری مقدماتی", amount: "۹۵,۰۰۰ تومان", date: "۱۴۰۵/۰۴/۳۰", status: "success" },
  { id: "#۴۸۲۹۱", customer: "علی رضایی", product: "پکیج آموزش ثبت سند حسابداری از صفر تا صد", amount: "۲۹,۰۰۰ تومان", date: "۱۴۰۵/۰۴/۲۹", status: "success" }
];

function loadDynamicOrders() {
  try {
    const raw = localStorage.getItem("irHesabdarOrders");
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : initialOrders;
    }
  } catch (e) {
    console.warn("admin: error loading orders", e);
  }
  localStorage.setItem("irHesabdarOrders", JSON.stringify(initialOrders));
  return initialOrders;
}

const initialUsers = [
  { id: 1, name: "سام به‌نام", contact: "sam@example.com", role: "مدیر سایت", status: "فعال" },
  { id: 2, name: "محمد رضایی", contact: "mohammad@example.com", role: "ادمین", status: "فعال" },
  { id: 3, name: "علی احمدی", contact: "ali@example.com", role: "کاربر عادی", status: "فعال" },
  { id: 4, name: "سارا محمدی", contact: "sara@example.com", role: "کاربر عادی", status: "فعال" },
  { id: 5, name: "زهرا کریمی", contact: "zahra@example.com", role: "کاربر عادی", status: "غیرفعال" }
];

function loadDynamicUsers() {
  try {
    const raw = localStorage.getItem("irHesabdarUsers");
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : initialUsers;
    }
  } catch (e) {
    console.warn("admin: error loading users", e);
  }
  localStorage.setItem("irHesabdarUsers", JSON.stringify(initialUsers));
  return initialUsers;
}

let currentAdminUserRole = "manager";


let safetyWarningState = {
  timer: null,
  countdown: 10,
  actionCallback: null
};

function triggerSafetyWarning(actionText, callback) {
  if (safetyWarningState.timer) {
    clearInterval(safetyWarningState.timer);
  }
  
  safetyWarningState.countdown = 10;
  safetyWarningState.actionCallback = callback;
  
  document.getElementById("warningActionText").textContent = actionText;
  document.getElementById("warningTimerCount").textContent = toPersianDigits(safetyWarningState.countdown);
  
  openModal("safetyWarningModal");
  
  safetyWarningState.timer = setInterval(() => {
    safetyWarningState.countdown--;
    document.getElementById("warningTimerCount").textContent = toPersianDigits(safetyWarningState.countdown);
    
    if (safetyWarningState.countdown <= 0) {
      clearInterval(safetyWarningState.timer);
      executeWarningAction();
    }
  }, 1000);
}

function executeWarningAction() {
  if (safetyWarningState.timer) {
    clearInterval(safetyWarningState.timer);
  }
  closeModal("safetyWarningModal");
  if (typeof safetyWarningState.actionCallback === "function") {
    safetyWarningState.actionCallback();
  }
}

function cancelWarningAction() {
  if (safetyWarningState.timer) {
    clearInterval(safetyWarningState.timer);
  }
  closeModal("safetyWarningModal");
  showToast("عملیات با موفقیت لغو شد.", "info");
}

let appState = {
  users: loadDynamicUsers(),
  products: loadDynamicProducts(),
  orders: loadDynamicOrders(),
  notifications: [
    {
      id: 1,
      title: "سفارش جدید",
      desc: "سفارش شماره #۱۲۳۴۵ ثبت شد",
      time: "الان",
      unread: true,
    },
    {
      id: 2,
      title: "پرداخت موفق",
      desc: "پرداخت سفارش #۱۲۳۴۴ تکمیل شد",
      time: "۵ دقیقه پیش",
      unread: true,
    },
    {
      id: 3,
      title: "موجودی کم",
      desc: "محصول لپ‌تاپ ایسوس موجودی کمی دارد",
      time: "۱ ساعت پیش",
      unread: false,
    },
    {
      id: 4,
      title: "کاربر جدید",
      desc: "کاربر جدید در سیستم ثبت نام کرد",
      time: "۲ ساعت پیش",
      unread: false,
    },
  ],
  messages: [
    {
      id: 1,
      sender: "علی احمدی",
      text: "سلام، کی سفارش من ارسال میشه؟",
      time: "۳ ساعت پیش",
    },
    {
      id: 2,
      sender: "سارا محمدی",
      text: "تشکر از پشتیبانی عالی شما",
      time: "دیروز",
    },
    {
      id: 3,
      sender: "رضا مرادی",
      text: "سوالی درباره گارانتی محصول داشتم",
      time: "۲ روز پیش",
    },
  ],
};

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initMobileSidebar();
  initTables();
  initNotifications();
  initModals();
  initSearch();

  // Handle direct hash navigation on page load
  const currentHash = window.location.hash;
  if (currentHash && currentHash.startsWith("#")) {
    const viewName = currentHash.substring(1).replace("-list", "");
    let mappedView = viewName;
    if (["users", "users-list", "add-user", "user-roles"].includes(viewName)) {
      mappedView = "users";
    } else if (
      [
        "products",
        "products-list",
        "add-product",
        "categories",
        "inventory",
      ].includes(viewName)
    ) {
      mappedView = "products";
    } else if (["general", "security", "notifications"].includes(viewName)) {
      mappedView = "settings";
    } else if (viewName === "site-content") {
      mappedView = "site-content";
    } else if (viewName === "analytics") {
      mappedView = "analytics";
    } else if (viewName === "messages") {
      mappedView = "messages";
    }

    if (document.getElementById(`view-${mappedView}`)) {
      switchView(mappedView);
    }
  }

  // Update dynamic dashboard counters and notification badges on load
  updateDashboardMetrics();
  updateOrdersNotifications();

  console.log("🎉 پنل مدیریت کل با موفقیت بارگذاری و فعال شد.");
});

function updateDashboardMetrics() {
  const revenueEl = document.getElementById("stat-revenue");
  const ordersEl = document.getElementById("stat-orders");

  if (typeof appState !== "undefined" && Array.isArray(appState.orders)) {
    // 1. Calculate Total Revenue from successful orders
    const totalRev = appState.orders
      .filter(o => o.status === "success")
      .reduce((sum, o) => {
        const cleanNum = parseFloat(String(o.amount || "").replace(/[^\d.]/g, ""));
        return sum + (isNaN(cleanNum) ? 0 : cleanNum);
      }, 0);

    if (revenueEl) {
      revenueEl.textContent = toPersianDigits(totalRev.toLocaleString()) + " تومان";
    }

    // 2. Calculate Total Orders Count
    if (ordersEl) {
      ordersEl.textContent = toPersianDigits(appState.orders.length.toLocaleString());
    }
  }
}

function updateOrdersNotifications() {
  const badge = document.getElementById("orders-badge");
  if (!badge) return;

  const currentCount = Array.isArray(appState.orders) ? appState.orders.length : 0;
  
  let lastSeenCount = localStorage.getItem("irHesabdarLastSeenOrderCount");
  if (lastSeenCount === null) {
    lastSeenCount = currentCount;
    localStorage.setItem("irHesabdarLastSeenOrderCount", lastSeenCount);
  } else {
    lastSeenCount = parseInt(lastSeenCount) || 0;
  }

  const unreadCount = currentCount - lastSeenCount;
  if (unreadCount > 0) {
    badge.textContent = toPersianDigits(unreadCount.toLocaleString());
    badge.style.display = "inline-flex";
  } else {
    badge.style.display = "none";
  }
}

// --- View Router & Navigation ---
function switchView(viewName) {
  document.querySelectorAll(".admin-view").forEach((view) => {
    view.classList.remove("active");
  });

  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) {
    targetView.classList.add("active");
  }

  document.querySelectorAll(".sidebar-nav li").forEach((li) => {
    li.classList.remove("active");
    if (li.getAttribute("data-view") === viewName) {
      li.classList.add("active");
    }
  });

  document.getElementById("sidebar").classList.remove("active");
  document.getElementById("overlay").classList.remove("active");

  window.scrollTo({ top: 0, behavior: "smooth" });

  // Handle Orders unread notifications
  if (viewName === "orders") {
    const currentCount = Array.isArray(appState.orders) ? appState.orders.length : 0;
    localStorage.setItem("irHesabdarLastSeenOrderCount", currentCount);
    updateOrdersNotifications();
  }

  // Dynamically trigger rendering of site content if the view is active
  if (viewName === "site-content" && typeof renderContentTable === "function") {
    renderContentTable();
  }
}

function initNavigation() {
  const navLinks = document.querySelectorAll(
    ".sidebar-nav a:not(.dropdown-toggle)",
  );
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        const viewName = href.substring(1).replace("-list", "");
        let mappedView = viewName;
        if (
          ["users", "users-list", "add-user", "user-roles"].includes(viewName)
        )
          mappedView = "users";
        else if (
          [
            "products",
            "products-list",
            "add-product",
            "categories",
            "inventory",
          ].includes(viewName)
        )
          mappedView = "products";
        else if (["general", "security", "notifications"].includes(viewName))
          mappedView = "settings";
        else if (viewName === "site-content") mappedView = "site-content";

        if (document.getElementById(`view-${mappedView}`)) {
          e.preventDefault();
          switchView(mappedView);
          window.location.hash = href;
        }
      }
    });
  });

  document.querySelectorAll(".dropdown-toggle").forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      toggle.parentElement.classList.toggle("active");
    });
  });
}

function initMobileSidebar() {
  const menuToggle = document.getElementById("menuToggle");
  const closeSidebar = document.getElementById("closeSidebar");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  menuToggle.addEventListener("click", () => {
    sidebar.classList.add("active");
    overlay.classList.add("active");
  });

  closeSidebar.addEventListener("click", () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  });

  overlay.addEventListener("click", () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    if (confirm("آیا می‌خواهید از پنل مدیریت کل خارج شوید؟")) {
      showToast("با موفقیت خارج شدید", "info");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  });
}

function initTables() {
  renderDashboardOrders();
  renderDashboardProducts();
  renderUsersTable();
  renderProductsTable();
  renderOrdersTable();
  renderMessages();
}

function renderDashboardOrders() {
  const tbody = document.querySelector("#dashboardOrdersTable tbody");
  if (!tbody) return;
  tbody.innerHTML = appState.orders
    .slice(0, 5)
    .map(
      (order) => `
        <tr>
            <td>${order.id}</td>
            <td>${order.customer}</td>
            <td>${order.product}</td>
            <td>${order.amount}</td>
            <td><span class="status ${order.status}">${getStatusText(order.status)}</span></td>
        </tr>
    `,
    )
    .join("");
}

function formatProductPrice(price) {
  if (typeof price === "number") {
    if (price === 0) {
      return `<span class="status success" style="background: rgba(52, 199, 89, 0.1); color: #34c759; padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 11px;">رایگان</span>`;
    }
    return toPersianDigits(price.toLocaleString()) + " تومان";
  }
  const cleanNum = parseFloat(String(price || "").replace(/[^\d.]/g, ""));
  if (!isNaN(cleanNum)) {
    if (cleanNum === 0) {
      return `<span class="status success" style="background: rgba(52, 199, 89, 0.1); color: #34c759; padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 11px;">رایگان</span>`;
    }
    return toPersianDigits(cleanNum.toLocaleString()) + " تومان";
  }
  return toPersianDigits(String(price || "رایگان"));
}

function renderDashboardProducts() {
  const container = document.getElementById("dashboardTopProducts");
  if (!container) return;
  container.innerHTML = appState.products
    .slice(0, 4)
    .map(
      (prod) => `
        <div class="product-item">
            <img src="${prod.img || '../images/ravin.png'}" alt="${prod.name}">
            <div class="product-info">
                <h4>${prod.name}</h4>
                <p>شناسه: ${prod.id}</p>
            </div>
            <div class="product-price">
                <span style="font-weight: bold; color: var(--success);">${formatProductPrice(prod.price)}</span>
            </div>
        </div>
    `,
    )
    .join("");
}

function renderUsersTable() {
  const tbody = document.querySelector("#usersManageTable tbody");
  if (!tbody) return;

  const searchQuery = document.getElementById("userTableSearch") ? document.getElementById("userTableSearch").value.trim().toLowerCase() : "";
  
  const roleOrder = {
    "مدیر سایت": 1,
    "مدیر سیستم": 1,
    "ادمین": 2,
    "مدیر فروش": 2,
    "پشتیبان": 2,
    "مشتری VIP": 3,
    "مشتری عادی": 3,
    "کاربر عادی": 3
  };

  // Sort: Managers first, then Admins, then Users last
  const sortedUsers = [...appState.users].sort((a, b) => {
    const orderA = roleOrder[a.role] || 99;
    const orderB = roleOrder[b.role] || 99;
    return orderA - orderB;
  });

  const filteredUsers = sortedUsers.filter(u => {
    return u && (
           String(u.name || "").toLowerCase().includes(searchQuery) ||
           String(u.role || "").toLowerCase().includes(searchQuery) ||
           String(u.contact || "").toLowerCase().includes(searchQuery)
    );
  });

  const isLocked = currentAdminUserRole === "admin";

  // Lock or unlock "Add User" button in the view header
  const addUserHeaderBtn = document.querySelector('#view-users .page-title .btn-primary');
  if (addUserHeaderBtn) {
    if (isLocked) {
      addUserHeaderBtn.style.opacity = "0.5";
      addUserHeaderBtn.style.pointerEvents = "none";
      addUserHeaderBtn.title = "افزودن کاربر مخصوص مدیر کل می‌باشد";
    } else {
      addUserHeaderBtn.style.opacity = "1";
      addUserHeaderBtn.style.pointerEvents = "auto";
      addUserHeaderBtn.title = "افزودن کاربر جدید";
    }
  }

  tbody.innerHTML = filteredUsers
    .map(
      (user) => {
        // Blur contact details if locked (role is admin)
        const contactStyle = isLocked ? 'filter: blur(5px); select: none; pointer-events: none; user-select: none;' : '';
        const contactTitle = isLocked ? 'title="اطلاعات حساس - مخصوص مدیر کل"' : '';
        const contactText = isLocked ? "•••••••••••••••••" : user.contact;

        // Faded styles for operations if locked
        const actionStyle = isLocked ? 'opacity: 0.4; pointer-events: none; cursor: not-allowed;' : '';
        const actionTitle = isLocked ? 'title="عملیات مدیریت مخصوص مدیر کل می‌باشد"' : '';

        return `
          <tr>
              <td>#${toPersianDigits(user.id)}</td>
              <td style="font-weight: 500;">${user.name}</td>
              <td ${contactTitle} style="${contactStyle}">${contactText}</td>
              <td><span class="status pending" style="background: rgba(0, 122, 255, 0.08); color: var(--primary); font-size: 11px; font-weight: bold; border-radius: 6px; padding: 4px 8px;">${user.role}</span></td>
              <td><span class="status ${user.status === "فعال" ? "success" : "cancelled"}">${user.status}</span></td>
              <td>
                  <button class="btn-secondary" style="padding: 4px 10px; font-size: 12px; cursor: pointer; border-radius: 6px; ${actionStyle}" ${actionTitle} onclick="editUser(${user.id})">ویرایش</button>
                  <button class="btn-secondary" style="padding: 4px 10px; font-size: 12px; color: var(--danger); border-color: rgba(255,59,48,0.2); background: rgba(255,59,48,0.05); cursor: pointer; border-radius: 6px; ${actionStyle}" ${actionTitle} onclick="deleteUser(${user.id})">حذف</button>
              </td>
          </tr>
        `;
      }
    )
    .join("");
}

function renderProductsTable() {
  const tbody = document.querySelector("#productsManageTable tbody");
  if (!tbody) return;
  
  const searchQuery = document.getElementById("productTableSearch") ? document.getElementById("productTableSearch").value.trim().toLowerCase() : "";
  
  const filteredProducts = appState.products.filter(p => {
    return p && p.id && (
           String(p.name || "").toLowerCase().includes(searchQuery) ||
           String(p.id || "").toLowerCase().includes(searchQuery) ||
           String(p.category || "").toLowerCase().includes(searchQuery)
    );
  });

  tbody.innerHTML = filteredProducts
    .map(
      (prod) => `
        <tr>
            <td><img src="${prod.img || '../images/ravin.png'}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover; border: 1px solid rgba(255,255,255,0.1);" alt=""></td>
            <td style="font-weight: 500;">${prod.name || "بدون نام"}</td>
            <td><span class="status pending" style="background: rgba(0, 122, 255, 0.1); color: var(--primary); font-size: 11px; font-weight: bold; border-radius: 6px; padding: 4px 8px;">${String(prod.category || "FILE").toUpperCase()}</span></td>
            <td style="font-weight: bold; color: var(--success);">${formatProductPrice(prod.price)}</td>
            <td><code>${prod.id}</code></td>
            <td>
                <button class="btn-secondary" style="padding: 4px 10px; font-size: 12px; cursor: pointer; border-radius: 6px;" onclick="editProduct('${prod.id}')">ویرایش قیمت</button>
                <button class="btn-secondary" style="padding: 4px 10px; font-size: 12px; color: var(--danger); border-color: rgba(255,59,48,0.2); background: rgba(255,59,48,0.05); cursor: pointer; border-radius: 6px;" onclick="deleteProduct('${prod.id}')">حذف</button>
            </td>
        </tr>
    `,
    )
    .join("");
}

function downloadOrdersReport() {
  if (!appState.orders || !appState.orders.length) {
    showToast("هیچ سفارشی برای گزارش‌گیری وجود ندارد.", "error");
    return;
  }
  
  // UTF-8 BOM to support Persian characters in Excel!
  let csvContent = "\uFEFF"; 
  csvContent += "شماره سفارش,نام خریدار,موبایل خریدار,ایمیل خریدار,محصول,مبلغ,تاریخ ثبت,وضعیت\n";
  
  appState.orders.forEach(o => {
    const phone = o.buyerPhone || "۰۹۱۲۳۴۵۶۷۸۹";
    const email = o.buyerEmail || "sam@example.com";
    const statusText = o.status === "success" ? "تکمیل شده" : "ناموفق";
    
    // Convert to Farsi digits for report
    const fId = toPersianDigits(o.id);
    const fPhone = toPersianDigits(phone);
    const fAmount = toPersianDigits(o.amount);
    const fDate = toPersianDigits(o.date);
    
    csvContent += `"${fId}","${o.customer}","${fPhone}","${email}","${o.product}","${fAmount}","${fDate}","${statusText}"\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `report_orders_${toPersianDigits(Date.now())}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("گزارش اکسل سفارشات با موفقیت دانلود شد.", "success");
}

function downloadSingleOrderInvoice(orderId) {
  const order = appState.orders.find(o => String(o.id) === String(orderId));
  if (!order) {
    showToast("سفارش پیدا نشد.", "error");
    return;
  }

  // UTF-8 BOM
  let csvContent = "\uFEFF";
  csvContent += "فاکتور خرید محصول پلتفرم حسابیار\n\n";
  csvContent += "شناسه سفارش,نام خریدار,موبایل خریدار,ایمیل خریدار,نام محصول,مبلغ پرداختی,تاریخ ثبت,وضعیت پرداخت\n";
  
  const phone = order.buyerPhone || "۰۹۱۲۳۴۵۶۷۸۹";
  const email = order.buyerEmail || "sam@example.com";
  const statusText = order.status === "success" ? "موفق (تکمیل شده)" : "ناموفق";
  
  // Convert to Farsi digits for invoice
  const fId = toPersianDigits(order.id);
  const fPhone = toPersianDigits(phone);
  const fAmount = toPersianDigits(order.amount);
  const fDate = toPersianDigits(order.date);

  csvContent += `"${fId}","${order.customer}","${fPhone}","${email}","${order.product}","${fAmount}","${fDate}","${statusText}"\n`;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `invoice_order_${toPersianDigits(order.id.replace("#", ""))}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("فاکتور سفارش به صورت فایل اکسل دانلود شد.", "success");
}

function openOrderDetailModal(orderId) {
  const order = appState.orders.find(o => String(o.id) === String(orderId));
  if (!order) {
    showToast("سفارش پیدا نشد.", "error");
    return;
  }

  // Populate modal fields with gorgeous Persian digits
  document.getElementById("detailOrderNum").textContent = "شماره سفارش: " + toPersianDigits(order.id);
  document.getElementById("detailOrderCustomer").textContent = order.customer || "نامشخص";
  document.getElementById("detailOrderPhone").textContent = toPersianDigits(order.buyerPhone || "۰۹۱۲۳۴۵۶۷۸۹");
  document.getElementById("detailOrderEmail").textContent = order.buyerEmail || "sam@example.com";
  document.getElementById("detailOrderProduct").textContent = order.product || "محصول آموزشی";
  document.getElementById("detailOrderAmount").textContent = toPersianDigits(order.amount || "۰ تومان");
  document.getElementById("detailOrderDate").textContent = toPersianDigits(order.date || "---");

  // Try to find the download link for this product
  let fileUrl = "";
  try {
    const prodsRaw = localStorage.getItem("irHesabdarProducts");
    const prods = prodsRaw ? JSON.parse(prodsRaw) : [];
    if (Array.isArray(prods)) {
      const match = prods.find(p => String(p.id) === String(order.productId || order.product));
      if (match && match.fileUrl) {
        fileUrl = match.fileUrl;
      }
    }
  } catch (e) {}

  const downloadContainer = document.getElementById("detailOrderDownloadContainer");
  if (downloadContainer) {
    let htmlButtons = `
      <button type="button" class="btn-primary" onclick="downloadSingleOrderInvoice('${order.id}')" style="background: #10b981; border-color: #10b981; padding: 10px 20px; border-radius: 8px; font-weight: bold; display: inline-flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; border: none;">
        <i class="fas fa-file-excel"></i> دانلود فاکتور اکسل (CSV)
      </button>
    `;

    if (fileUrl && fileUrl !== "#") {
      htmlButtons += `
        <a href="${fileUrl}" download class="btn-primary" style="background: #007aff; border-color: #007aff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; display: inline-flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; margin-right: 10px;">
          <i class="fas fa-file-arrow-down"></i> دانلود فایل اصلی محصول
        </a>
      `;
    }

    downloadContainer.innerHTML = htmlButtons;
  }

  openModal("orderDetailModal");
}

function renderOrdersTable() {
  const tbody = document.querySelector("#ordersFullTable tbody");
  if (!tbody) return;
  tbody.innerHTML = appState.orders
    .map(
      (order) => `
        <tr>
            <td>${toPersianDigits(order.id)}</td>
            <td>${order.customer}</td>
            <td>${order.product}</td>
            <td style="font-weight: bold; color: var(--success);">${toPersianDigits(order.amount)}</td>
            <td>${toPersianDigits(order.date)}</td>
            <td><span class="status ${order.status}">${getStatusText(order.status)}</span></td>
            <td>
                <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px; cursor: pointer;" onclick="openOrderDetailModal('${order.id}')">بررسی جزئیات</button>
            </td>
        </tr>
      `
    )
    .join("");
}

function renderMessages() {
  const container = document.getElementById("messagesListContainer");
  if (!container) return;
  container.innerHTML = appState.messages
    .map(
      (msg) => `
        <div class="notification-item unread">
            <div class="notification-icon blue"><i class="fas fa-envelope"></i></div>
            <div class="notification-info">
                <h4>${msg.sender}</h4>
                <p>${msg.text}</p>
                <span class="notification-time">${msg.time}</span>
            </div>
        </div>
    `,
    )
    .join("");
}

function getStatusText(status) {
  if (status === "success") return "تکمیل شده";
  if (status === "pending") return "در حال پردازش";
  if (status === "cancelled") return "لغو شده";
  return status;
}

function populateProductContentDropdown() {
  const select = document.getElementById("newProdContentId");
  if (!select) return;

  if (typeof siteData === "undefined") {
    select.innerHTML = '<option value="">اطلاعات لود نشده است</option>';
    return;
  }

  let htmlOptions = "";
  Object.keys(siteData).forEach(catKey => {
    const category = siteData[catKey];
    if (category && Array.isArray(category.items)) {
      htmlOptions += `<optgroup label="${category.title}">`;
      category.items.forEach(item => {
        htmlOptions += `<option value="${item.id}">${item.title} (${item.id})</option>`;
      });
      htmlOptions += `</optgroup>`;
    }
  });

  select.innerHTML = htmlOptions;
}

function openModal(modalId) {
  if (modalId === "addProductModal") {
    populateProductContentDropdown();
    
    // Reset product access type toggles on modal open
    const premiumRadio = document.getElementById("accessTypePremium");
    if (premiumRadio) premiumRadio.checked = true;
    
    const priceContainer = document.getElementById("prodPriceContainer");
    if (priceContainer) priceContainer.style.display = "block";
    
    const priceInput = document.getElementById("newProdPrice");
    if (priceInput) {
      priceInput.required = true;
      priceInput.value = "";
    }
  }
  document.getElementById(modalId).classList.add("active");
  document.getElementById("overlay").classList.add("active");
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
  document.getElementById("overlay").classList.remove("active");
}

function initModals() {
  // Safety confirmation buttons
  document.getElementById("warningConfirmBtn")?.addEventListener("click", executeWarningAction);
  document.getElementById("warningCancelBtn")?.addEventListener("click", cancelWarningAction);

  // Edit User Form Submission (With safety warning!)
  const editUserForm = document.getElementById("editUserForm");
  if (editUserForm) {
    editUserForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const id = parseInt(document.getElementById("editUserId").value);
      const name = document.getElementById("editUserName").value.trim();
      const role = document.getElementById("editUserRole").value;
      const status = document.getElementById("editUserStatus").value;

      triggerSafetyWarning(`آیا از ثبت نهایی تغییرات کاربر «${name}» اطمینان دارید؟`, () => {
        const user = appState.users.find(u => u.id === id);
        if (user) {
          user.name = name;
          user.role = role;
          user.status = status;
          localStorage.setItem("irHesabdarUsers", JSON.stringify(appState.users));
          renderUsersTable();
          closeModal("editUserModal");
          showToast(`مشخصات کاربر با موفقیت تغییر یافت.`, "success");
        }
      });
    });
  }

  // Delete User button inside Edit Modal (With safety warning!)
  const deleteUserFromEditBtn = document.getElementById("deleteUserFromEditBtn");
  if (deleteUserFromEditBtn) {
    deleteUserFromEditBtn.addEventListener("click", () => {
      const id = parseInt(document.getElementById("editUserId").value);
      const user = appState.users.find(u => u.id === id);
      if (!user) return;

      triggerSafetyWarning(`⚠️ هشدار جدی: آیا از حذف دائمی کاربر «${user.name}» از دیتابیس کل سیستم مطمئن هستید؟`, () => {
        appState.users = appState.users.filter(u => u.id !== id);
        localStorage.setItem("irHesabdarUsers", JSON.stringify(appState.users));
        renderUsersTable();
        closeModal("editUserModal");
        showToast("حساب کاربری برای همیشه از کل دیتابیس حذف شد.", "error");
      });
    });
  }

  // Bind radio button listeners for product access type
  const accessTypePremium = document.getElementById("accessTypePremium");
  const accessTypeFree = document.getElementById("accessTypeFree");
  const prodPriceContainer = document.getElementById("prodPriceContainer");
  const newProdPrice = document.getElementById("newProdPrice");

  if (accessTypePremium && accessTypeFree && prodPriceContainer) {
    accessTypePremium.addEventListener("change", () => {
      if (accessTypePremium.checked) {
        prodPriceContainer.style.display = "block";
        if (newProdPrice) newProdPrice.required = true;
      }
    });
    accessTypeFree.addEventListener("change", () => {
      if (accessTypeFree.checked) {
        prodPriceContainer.style.display = "none";
        if (newProdPrice) {
          newProdPrice.required = false;
          newProdPrice.value = "0";
        }
      }
    });
  }

  // Add Product Form
  const addProductForm = document.getElementById("addProductForm");
  if (addProductForm) {
    addProductForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const contentId = document.getElementById("newProdContentId").value;
      const name = document.getElementById("newProdName").value.trim();
      const category = document.getElementById("newProdCat").value;
      const isFree = document.getElementById("accessTypeFree") ? document.getElementById("accessTypeFree").checked : false;
      const price = isFree ? 0 : parseFloat(document.getElementById("newProdPrice").value || "0");
      const fileSize = document.getElementById("newProdSize").value.trim();
      const fileUrl = document.getElementById("newProdFileUrl").value.trim();

      const existingIdx = appState.products.findIndex(p => String(p.id) === String(contentId));
      const newProduct = {
        id: contentId,
        name: name,
        category: category,
        price: price,
        fileUrl: fileUrl,
        fileSize: fileSize,
        img: "../images/ravin.png"
      };

      if (existingIdx > -1) {
        appState.products[existingIdx] = newProduct;
      } else {
        appState.products.unshift(newProduct);
      }

      // Save to localStorage
      localStorage.setItem("irHesabdarProducts", JSON.stringify(appState.products));

      // AUTOMATIC TWO-WAY SYNC TO SITE CONTENT:
      if (typeof saveContentOverride === "function") {
        const overrides = loadContentOverrides();
        const current = overrides[contentId] || {};
        const content = current.content || { blocks: [], downloads: [], video: null };
        
        if (category === "mp4") {
          // Sync to Video field of that content item!
          content.video = {
            enabled: true,
            url: fileUrl,
            provider: "file",
            title: name
          };
        } else {
          // Sync to Downloads field of that content item!
          if (!Array.isArray(content.downloads)) content.downloads = [];
          const fileId = "prod-file-" + contentId;
          const fileObj = {
            id: fileId,
            title: name,
            url: fileUrl,
            type: category,
            size: fileSize
          };

          const existingFileIndex = content.downloads.findIndex(f => f.id === fileId);
          if (existingFileIndex > -1) {
            content.downloads[existingFileIndex] = fileObj;
          } else {
            content.downloads.push(fileObj);
          }
        }

        saveContentOverride(contentId, {
          content: content,
          excerpt: current.excerpt || ""
        });
        
        if (typeof applyContentOverrides === "function" && typeof siteData !== "undefined") {
          applyContentOverrides(siteData);
        }
      }

      renderProductsTable();
      renderDashboardProducts();
      closeModal("addProductModal");
      addProductForm.reset();
      showToast("محصول با موفقیت ذخیره و به محتوای سایت متصل شد", "success");
    });
  }

  // Add User Form
  const addUserForm = document.getElementById("addUserForm");
  if (addUserForm) {
    addUserForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("newUserName").value.trim();
      const email = document.getElementById("newUserEmail").value.trim();
      const phone = document.getElementById("newUserPhone").value.trim();
      const role = document.getElementById("newUserRole").value;

      if (!name || !email || !phone) {
        alert("لطفاً تمامی فیلدهای فرم را به درستی پر کنید.");
        return;
      }

      const newUser = {
        id: appState.users.length + 1,
        name: name,
        contact: `${email} / ${phone}`,
        role: role,
        status: "فعال"
      };

      appState.users.unshift(newUser);

      // Save to localStorage
      localStorage.setItem("irHesabdarUsers", JSON.stringify(appState.users));

      renderUsersTable();
      closeModal("addUserModal");
      addUserForm.reset();
      showToast("کاربر جدید با موفقیت ثبت شد", "success");
    });
  }

  // Edit Profile Form (Manager / Super Admin)
  const editProfileForm = document.getElementById("editProfileForm");
  if (editProfileForm) {
    editProfileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newName = document.getElementById("editNameInput").value;
      const newRole = document.getElementById("editRoleInput").value;
      const newAvatar = document.getElementById("editAvatarInput").value;

      document.getElementById("sidebarUserName").textContent = newName;
      document.getElementById("sidebarUserRole").textContent = newRole;
      if (newAvatar) {
        document.getElementById("sidebarAvatar").src = newAvatar;
      }

      closeModal("editProfileModal");
      showToast("پروفایل مدیر کل با موفقیت به‌روزرسانی شد", "success");
    });
  }
}

function deleteUser(id) {
  // Delete action is now moved inside the Edit User Modal for high safety!
  showToast("حذف کاربر فقط از داخل منوی ویرایش کاربر امکان‌پذیر است.", "info");
}

function editUser(id) {
  if (currentAdminUserRole === "admin") {
    showToast("خطا: شما دسترسی لازم برای ویرایش کاربران را ندارید.", "error");
    return;
  }

  const user = appState.users.find((u) => u.id === id);
  if (user) {
    document.getElementById("editUserId").value = id;
    document.getElementById("editUserName").value = user.name || "";
    document.getElementById("editUserRole").value = user.role || "کاربر عادی";
    document.getElementById("editUserStatus").value = user.status || "فعال";
    
    openModal("editUserModal");
  }
}

function deleteProduct(id) {
  if (confirm("آیا از حذف این محصول اطمینان دارید؟")) {
    const prod = appState.products.find((p) => p && p.id && String(p.id) === String(id));
    appState.products = appState.products.filter((p) => p && p.id && String(p.id) !== String(id));
    localStorage.setItem("irHesabdarProducts", JSON.stringify(appState.products));

    // AUTOMATIC SYNC DELETION: Remove the file or video from Site Content overrides based on URL!
    if (prod && typeof saveContentOverride === "function") {
      const overrides = loadContentOverrides();
      const current = overrides[id] || {};
      const content = current.content || { blocks: [], downloads: [], video: null };
      
      if (Array.isArray(content.downloads)) {
        // Safe URL matching instead of ID matching!
        content.downloads = content.downloads.filter(function(f) { 
          return f.url !== prod.fileUrl && f.id !== "prod-file-" + id; 
        });
      }
      
      if (content.video && content.video.url === prod.fileUrl) {
        content.video = null;
      }

      saveContentOverride(id, {
        content: content,
        excerpt: current.excerpt || ""
      });

      if (typeof applyContentOverrides === "function" && typeof siteData !== "undefined") {
        applyContentOverrides(siteData);
        if (typeof renderContentTable === "function") {
          renderContentTable();
        }
      }
    }

    renderProductsTable();
    renderDashboardProducts();
    showToast("محصول با موفقیت حذف شد", "error");
  }
}

function editProduct(id) {
  const prod = appState.products.find((p) => p && p.id && String(p.id) === String(id));
  if (prod) {
    const newPriceRaw = prompt("ویرایش قیمت محصول (تومان):", prod.price);
    if (newPriceRaw !== null) {
      const newPrice = parseFloat(newPriceRaw);
      if (!isNaN(newPrice)) {
        prod.price = newPrice;
        localStorage.setItem("irHesabdarProducts", JSON.stringify(appState.products));
        renderProductsTable();
        renderDashboardProducts();
        showToast("قیمت محصول به‌روز شد", "success");
      } else {
        showToast("خطا: قیمت نامعتبر است", "error");
      }
    }
  }
}

function initNotifications() {
  const btn = document.getElementById("notificationBtn");
  const dropdown = document.getElementById("notificationDropdown");
  const markAllBtn = document.getElementById("markAllRead");

  if (btn && dropdown) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("active");
      renderNotificationDropdownItems();
    });

    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
        dropdown.classList.remove("active");
      }
    });
  }

  if (markAllBtn) {
    markAllBtn.addEventListener("click", () => {
      appState.notifications.forEach((n) => (n.unread = false));
      renderNotificationDropdownItems();
      document.querySelector(".notification-dot").style.display = "none";
      showToast("تمام اعلان‌ها خوانده شدند", "success");
    });
  }
}

function renderNotificationDropdownItems() {
  const container = document.getElementById("notifListContainer");
  if (!container) return;
  container.innerHTML = appState.notifications
    .map(
      (n) => `
        <div class="notif-item" style="${n.unread ? "background: rgba(0,122,255,0.08); font-weight: 600;" : ""}">
            <div style="font-size: 13px; color: var(--text-primary);">${n.title}: ${n.desc}</div>
            <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">${n.time}</div>
        </div>
    `,
    )
    .join("");
}

function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  let icon = "fa-check-circle";
  if (type === "error") icon = "fa-exclamation-circle";
  if (type === "info") icon = "fa-info-circle";

  toast.innerHTML = `
        <i class="fas ${icon}" style="font-size: 18px; color: var(--${type === "success" ? "success" : type === "error" ? "danger" : "primary"});"></i>
        <span>${message}</span>
    `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "fadeOut 0.3s ease forwards";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function initSearch() {
  const userSearch = document.getElementById("userTableSearch");
  if (userSearch) {
    userSearch.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      document.querySelectorAll("#usersManageTable tbody tr").forEach((row) => {
        row.style.display = row.textContent.toLowerCase().includes(query)
          ? ""
          : "none";
      });
    });
  }

  const prodSearch = document.getElementById("productTableSearch");
  if (prodSearch) {
    prodSearch.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      document
        .querySelectorAll("#productsManageTable tbody tr")
        .forEach((row) => {
          row.style.display = row.textContent.toLowerCase().includes(query)
            ? ""
            : "none";
        });
    });
  }
}
