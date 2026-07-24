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
  { id: 1, name: "سام به‌نام", email: "sam@example.com", phone: "09121111111", role: "مدیر سایت", status: "فعال" },
  { id: 2, name: "محمد رضایی", email: "mohammad@example.com", phone: "09122222222", role: "ادمین", status: "فعال" },
  { id: 3, name: "علی احمدی", email: "ali@example.com", phone: "09121234567", role: "کاربر عادی", status: "فعال" },
  { id: 4, name: "سارا محمدی", email: "sara@example.com", phone: "09129876543", role: "کاربر عادی", status: "فعال" },
  { id: 5, name: "زهرا کریمی", email: "zahra@example.com", phone: "09123456789", role: "کاربر عادی", status: "غیرفعال" }
];

function normalizeUserContact(user) {
  const copy = Object.assign({}, user);
  const isEmptyValue = function (value) { return !value || String(value).trim() === "—"; };
  if (isEmptyValue(copy.email) || isEmptyValue(copy.phone)) {
    const parts = String(copy.contact || "").split(/\s*\/\s*/).filter(Boolean);
    if (isEmptyValue(copy.email)) copy.email = parts.find(function (value) { return value.includes("@"); }) || "—";
    if (isEmptyValue(copy.phone)) copy.phone = parts.find(function (value) { return !value.includes("@"); }) || "09121234567";
  }
  return copy;
}

function loadDynamicUsers() {
  try {
    const raw = localStorage.getItem("irHesabdarUsers");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean).map(normalizeUserContact);
      }
    }
  } catch (e) {
    console.warn("admin: error loading users", e);
  }
  localStorage.setItem("irHesabdarUsers", JSON.stringify(initialUsers));
  return initialUsers;
}

function loadSystemSettings() {
  const defaultSettings = {
    supportEmail: "support@irhesabdar.ir",
    supportPhone: "۰۹۱۲۳۴۵۶۷۸۹",
    maintenanceMode: false,
    merchantId: "e482da20-9bf3-482a-89a1-893f2dae89cf",
    currencyUnit: "toman",
    adminName: "مدیر کل سایت",
    adminAvatar: "https://i.pravatar.cc/150?img=33"
  };

  try {
    const raw = localStorage.getItem("irHesabdarSystemSettings");
    if (raw) {
      const parsed = JSON.parse(raw);
      return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : defaultSettings;
    }
  } catch (e) {
    console.warn("admin: error loading settings", e);
  }
  localStorage.setItem("irHesabdarSystemSettings", JSON.stringify(defaultSettings));
  return defaultSettings;
}

let currentAdminUserRole = "manager";


let profileReviewState = { timer: null, confirm: null, cancel: null };
function openProfileChangePreview(changes, onConfirm, onCancel) {
  const modal = document.getElementById("profileChangeReviewModal"), list = document.getElementById("profileReviewChanges"), timer = document.getElementById("profileReviewTimer");
  if (!modal || !list) return;
  list.innerHTML = changes.length ? changes.map(change => `<article class="profile-review-row"><strong>${change.label}</strong><div class="profile-review-before"><small>قبل از تغییر</small><span>${change.before || "—"}</span></div><div class="profile-review-after"><small>پس از تغییر</small><span>${change.after || "—"}</span></div></article>`).join("") : '<p class="profile-review-empty">تغییری در اطلاعات پروفایل ثبت نشده است.</p>';
  profileReviewState.confirm = onConfirm; profileReviewState.cancel = onCancel; let remaining = 15; timer.textContent = toPersianDigits(remaining);
  openModal("profileChangeReviewModal");
  const finish = function (approved) { clearInterval(profileReviewState.timer); closeModal("profileChangeReviewModal"); const action = approved ? profileReviewState.confirm : profileReviewState.cancel; profileReviewState.confirm = profileReviewState.cancel = null; if (typeof action === "function") action(); };
  document.getElementById("profileReviewConfirm").onclick = () => finish(true);
  document.getElementById("profileReviewCancel").onclick = () => finish(false);
  profileReviewState.timer = setInterval(() => { remaining--; timer.textContent = toPersianDigits(remaining); if (remaining <= 0) finish(true); }, 1000);
}

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

  // RESTORE ORIGINAL VALUES ON CANCEL:
  if (typeof loadSystemSettings === "function") {
    const sysSettings = loadSystemSettings();
    const nameInput = document.getElementById("setAdminName");
    const avatarInput = document.getElementById("setAdminAvatar");
    if (nameInput) nameInput.value = sysSettings.adminName || "";
    if (avatarInput) avatarInput.value = sysSettings.adminAvatar || "";
    
    // Restore current password from localStorage
    const savedPassword = localStorage.getItem("irHesabdarAdminPassword") || "123456";
    const currentPass = document.getElementById("setAdminCurrentPassword");
    if (currentPass) currentPass.value = savedPassword;

    // Clear and hide new password section
    const newPass = document.getElementById("setAdminPassword");
    const confirmPass = document.getElementById("setAdminPasswordConfirm");
    if (newPass) newPass.value = "";
    if (confirmPass) confirmPass.value = "";
    
    const newPasswordSection = document.getElementById("newPasswordSection");
    if (newPasswordSection) newPasswordSection.style.display = "none";
  }

  showToast("عملیات با موفقیت لغو شد.", "info");
}

const initialMessages = [
  { 
    id: 1, 
    sender: "علی احمدی", 
    email: "ali@example.com", 
    text: "سلام، وقت بخیر. آیا دوره حسابداری مقدماتی شامل پشتیبانی تلگرامی هم هست؟", 
    time: "۱۴۰۵/۰۵/۰۲ - ۱۰:۳۰", 
    unread: true, 
    history: [
      { sender: "user", name: "علی احمدی", text: "سلام، وقت بخیر. آیا دوره حسابداری مقدماتی شامل پشتیبانی تلگرامی هم هست؟", time: "۱۴۰۵/۰۵/۰۲ - ۱۰:۳۰" }
    ]
  },
  { 
    id: 2, 
    sender: "سارا محمدی", 
    email: "sara@example.com", 
    text: "درود بر شما. فایل اکسل محاسبه حقوق و دستمزد را خریدم ولی دانلود نشد. لطفا راهنمایی کنید.", 
    time: "۱۴۰۵/۰۵/۰۱ - ۱۶:۴۵", 
    unread: true, 
    history: [
      { sender: "user", name: "سارا محمدی", text: "درود بر شما. فایل اکسل محاسبه حقوق و دستمزد را خریدم ولی دانلود نشد. لطفا راهنمایی کنید.", time: "۱۴۰۵/۰۵/۰۱ - ۱۶:۴۵" }
    ]
  },
  { 
    id: 3, 
    sender: "محمد رضایی", 
    email: "mohammad@example.com", 
    text: "سلام. خسته نباشید. آزمون استخدامی بعدی وزارت اقتصاد چه زمانی برگزار می‌شود؟", 
    time: "۱۴۰۵/۰۴/۳۰ - ۱۴:۱۵", 
    unread: false, 
    history: [
      { sender: "user", name: "محمد رضایی", text: "سلام. خسته نباشید. آزمون استخدامی بعدی وزارت اقتصاد چه زمانی برگزار می‌شود؟", time: "۱۴۰۵/۰۴/۳۰ - ۱۴:۱۵" },
      { sender: "admin", name: "مدیر کل سایت", text: "سلام دوست عزیز، هنوز بخشنامه جدیدی صادر نشده است. به محض اعلام اخبار، در تب آزمون‌ها قرار می‌گیرد.", time: "۱۴۰۵/۰۴/۳۰ - ۱۵:۰۰" }
    ]
  },
  {
    id: 4,
    sender: "زهرا کریمی",
    email: "zahra@example.com",
    text: "سلام. چطور می‌توانم فاکتور خرید دوره مالیاتی را دریافت کنم؟",
    time: "۱۴۰۵/۰۵/۰۳ - ۰۹:۰۰",
    unread: true,
    history: [
      { sender: "user", name: "زهرا کریمی", text: "سلام. چطور می‌توانم فاکتور خرید دوره مالیاتی را دریافت کنم؟", time: "۱۴۰۵/۰۵/۰۳ - ۰۹:۰۰" }
    ]
  },
  {
    id: 5,
    sender: "پشتیبان تستی",
    email: "test-support@example.com",
    text: "این یک پیام آزمایشی خوانده‌نشده و بی‌پاسخ است تا بتوانید تپش قلب و انتقال‌ها را به راحتی تست کنید.",
    time: "۱۴۰۵/۰۵/۰۳ - ۱۲:۰۰",
    unread: true,
    history: [
      { sender: "user", name: "پشتیبان تستی", text: "این یک پیام آزمایشی خوانده‌نشده و بی‌پاسخ است تا بتوانید تپش قلب و انتقال‌ها را به راحتی تست کنید.", time: "۱۴۰۵/۰۵/۰۳ - ۱۲:۰۰" }
    ]
  }
];

function loadDynamicMessages() {
  try {
    const raw = localStorage.getItem("irHesabdarMessages");
    if (raw) {
      const parsed = JSON.parse(raw);
      // Clean up legacy localstorage data by converting it or filtering
      if (Array.isArray(parsed)) {
        return parsed.map(function(msg) {
          if (msg && !Array.isArray(msg.history)) {
            // Convert old legacy messages to new history bubble format!
            msg.history = [{ sender: "user", name: msg.sender, text: msg.text, time: msg.time }];
            if (msg.reply) {
              msg.history.push({ sender: "admin", name: msg.repliedBy || "مدیر کل سایت", text: msg.reply, time: msg.replyTime || msg.time });
            }
          }
          return msg;
        });
      }
    }
  } catch (e) {
    console.warn("admin: error loading messages", e);
  }
  localStorage.setItem("irHesabdarMessages", JSON.stringify(initialMessages));
  return initialMessages;
}



let staffAuditLogs = (function () {
  try { const saved = JSON.parse(localStorage.getItem("irHesabdarStaffAuditLogs")); if (saved && typeof saved === "object") return saved; } catch (e) {}
  return { 2: [
    { date: "۱۴۰۵/۰۵/۰۲ - ۱۰:۴۵", text: "نام کاربری خود را از «محمد رضایی» به «محمد رضایی‌منش» تغییر داد." },
    { date: "۱۴۰۵/۰۵/۰۳ - ۰۹:۲۰", text: "شماره تلفن همراه خود را به «۰۹۱۲۲۲۲۲۲۲۲» تغییر داد." }
  ] };
})();
let recentlyUpdatedStaffId = 2; // demo indicator
let recentStaffFieldChanges = { 2: ["name", "phone"] }; // cues used only on the main list
let staffModalReviewChanges = { 2: ["name", "phone"] }; // a separate cue, retained for the later edit-modal review
let pendingStaffProfileChanges = {}; // values stay old until the red review cue expires
let currentStaffProfileId = 1; // will be set from the authenticated account when login/profile is connected
function recordStaffChange(staffId, text) { const now = new Date().toLocaleString("fa-IR"); (staffAuditLogs[staffId] ||= []).unshift({ date: now, text: text }); localStorage.setItem("irHesabdarStaffAuditLogs", JSON.stringify(staffAuditLogs)); }
function markStaffRecentlyUpdated(staffId, fields) {
  recentlyUpdatedStaffId = staffId;
  if (fields && fields.length) { recentStaffFieldChanges[staffId] = fields; staffModalReviewChanges[staffId] = fields.slice(); }
  renderStaffTable();
  setTimeout(() => {
    const staff = appState.users.find(user => user && user.id === staffId);
    const pending = pendingStaffProfileChanges[staffId];
    if (staff && pending) {
      const labels = { name: "نام کاربری", email: "ایمیل", phone: "شماره تلفن همراه" };
      Object.keys(pending).forEach(field => { const before = staff[field] || "—"; staff[field] = pending[field]; recordStaffChange(staffId, `${labels[field] || field} خود را از «${before}» به «${pending[field]}» تغییر داد.`); });
      localStorage.setItem("irHesabdarUsers", JSON.stringify(appState.users));
      delete pendingStaffProfileChanges[staffId];
    }
    if (recentlyUpdatedStaffId === staffId) recentlyUpdatedStaffId = null;
    delete recentStaffFieldChanges[staffId];
    refreshStaffModalChangeCues(staffId);
    renderStaffTable();
  }, 8000);
}
function applyStaffProfileChanges(staffId, changes) {
  const staff = appState.users.find(function (user) { return user && user.id === staffId; }); if (!staff) return;
  const changed = {};
  Object.keys(changes || {}).forEach(function (field) { const value = String(changes[field] || "").trim(); if (value && String(staff[field] || "") !== value) changed[field] = value; });
  const fields = Object.keys(changed); if (!fields.length) return;
  // Admin changes are deliberately staged: old values remain visible during the red review indicator.
  if (staff.role === "ادمین") { pendingStaffProfileChanges[staffId] = changed; markStaffRecentlyUpdated(staffId, fields); }
  else { Object.assign(staff, changed); localStorage.setItem("irHesabdarUsers", JSON.stringify(appState.users)); renderStaffTable(); }
}
window.applyStaffProfileChanges = applyStaffProfileChanges;

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
  messages: loadDynamicMessages(),
};

document.addEventListener("DOMContentLoaded", () => {
  // --- MESSAGE SHORTCUT AND PANEL TOGGLES ---
  const messagesHeaderBtn = document.getElementById("messagesHeaderBtn");
  const messagesFloatingPanel = document.getElementById("messagesFloatingPanel");
  const closeFloatingPanelBtn = document.getElementById("closeFloatingPanelBtn");

  if (messagesHeaderBtn && messagesFloatingPanel) {
    messagesHeaderBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isVisible = messagesFloatingPanel.style.display === "block";
      if (isVisible) {
        messagesFloatingPanel.style.display = "none";
      } else {
        renderFloatingMessages();
        messagesFloatingPanel.style.display = "block";
      }
    });
  }

  if (closeFloatingPanelBtn && messagesFloatingPanel) {
    closeFloatingPanelBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      messagesFloatingPanel.style.display = "none";
    });
  }

  // Click anywhere else to close the floating messages panel
  document.addEventListener("click", (e) => {
    if (messagesFloatingPanel && messagesFloatingPanel.style.display === "block") {
      if (!messagesFloatingPanel.contains(e.target) && messagesHeaderBtn && !messagesHeaderBtn.contains(e.target)) {
        messagesFloatingPanel.style.display = "none";
      }
    }
  });

  initNavigation();
  initMobileSidebar();
  initTables();
  // Demo indicator expires after a short review interval.
  if (recentlyUpdatedStaffId) setTimeout(function () { const id = recentlyUpdatedStaffId; recentlyUpdatedStaffId = null; delete recentStaffFieldChanges[id]; renderStaffTable(); }, 8000);
  initNotifications();
  initModals();
  initSearch();

  // Populate System Settings from localStorage
  const sysSettings = loadSystemSettings();

  if (document.getElementById("setSupportEmail")) document.getElementById("setSupportEmail").value = sysSettings.supportEmail || "";
  if (document.getElementById("setSupportPhone")) document.getElementById("setSupportPhone").value = sysSettings.supportPhone || "";
  if (document.getElementById("setMaintenanceMode")) document.getElementById("setMaintenanceMode").checked = sysSettings.maintenanceMode || false;

  if (document.getElementById("setMerchantId")) document.getElementById("setMerchantId").value = sysSettings.merchantId || "";
  if (document.getElementById("setCurrencyUnit")) document.getElementById("setCurrencyUnit").value = sysSettings.currencyUnit || "toman";

  if (document.getElementById("setAdminName")) document.getElementById("setAdminName").value = sysSettings.adminName || "";
  if (document.getElementById("setAdminAvatar")) document.getElementById("setAdminAvatar").value = sysSettings.adminAvatar || "";
  const activeStaff = appState.users.find(u => u.id === currentStaffProfileId) || {};
  if (document.getElementById("profileEmail")) document.getElementById("profileEmail").value = activeStaff.email || "manager@example.com";
  if (document.getElementById("profilePhone")) document.getElementById("profilePhone").value = activeStaff.phone || "09120000000";
  if (document.getElementById("profileAvatarPreview")) document.getElementById("profileAvatarPreview").src = sysSettings.adminAvatar || "https://i.pravatar.cc/150?img=33";
  const roleBadge = document.getElementById("profileRoleBadge");
  if (roleBadge) { const role = activeStaff.role || "مدیر سایت"; roleBadge.textContent = role === "ادمین" ? "ادمین" : "مدیر"; roleBadge.className = "profile-role-badge " + (role === "ادمین" ? "profile-role-badge--admin" : "profile-role-badge--manager"); }

  const sideName = document.getElementById("sidebarUserName");
  const sideAvatar = document.getElementById("sidebarAvatar");
  if (sideName && sysSettings.adminName) sideName.textContent = sysSettings.adminName;
  if (sideAvatar && sysSettings.adminAvatar) sideAvatar.src = sysSettings.adminAvatar;

  // 1. General Settings Form Submission
  const settingsGeneralForm = document.getElementById("settingsGeneralForm");
  if (settingsGeneralForm) {
    settingsGeneralForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("setSupportEmail").value.trim();
      const phone = document.getElementById("setSupportPhone").value.trim();
      const maintenance = document.getElementById("setMaintenanceMode").checked;

      const currentSettings = loadSystemSettings();
      currentSettings.supportEmail = email;
      currentSettings.supportPhone = phone;
      currentSettings.maintenanceMode = maintenance;

      localStorage.setItem("irHesabdarSystemSettings", JSON.stringify(currentSettings));
      localStorage.setItem("irHesabdarMaintenanceMode", maintenance ? "true" : "false");

      showToast("تنظیمات عمومی و پشتیبانی با موفقیت ذخیره شد.", "success");
    });
  }

  // 2. Gateway Settings Form Submission
  const settingsGatewayForm = document.getElementById("settingsGatewayForm");
  if (settingsGatewayForm) {
    settingsGatewayForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const merchant = document.getElementById("setMerchantId").value.trim();
      const currency = document.getElementById("setCurrencyUnit").value;

      const currentSettings = loadSystemSettings();
      currentSettings.merchantId = merchant;
      currentSettings.currencyUnit = currency;

      localStorage.setItem("irHesabdarSystemSettings", JSON.stringify(currentSettings));
      showToast("تنظیمات درگاه مالی با موفقیت ذخیره شد.", "success");
    });
  }

  // Load and populate current password from localStorage
  const savedPassword = localStorage.getItem("irHesabdarAdminPassword") || "123456";
  if (document.getElementById("setAdminCurrentPassword")) {
    document.getElementById("setAdminCurrentPassword").value = savedPassword;
  }

  // Toggle New Password section in Settings
  const toggleNewPasswordBtn = document.getElementById("toggleNewPasswordBtn");
  const newPasswordSection = document.getElementById("newPasswordSection");
  if (toggleNewPasswordBtn && newPasswordSection) {
    toggleNewPasswordBtn.addEventListener("click", () => {
      if (newPasswordSection.style.display === "none") {
        newPasswordSection.style.display = "block";
        document.getElementById("setAdminPassword").required = true;
        document.getElementById("setAdminPasswordConfirm").required = true;
      } else {
        newPasswordSection.style.display = "none";
        document.getElementById("setAdminPassword").required = false;
        document.getElementById("setAdminPasswordConfirm").required = false;
        document.getElementById("setAdminPassword").value = "";
        document.getElementById("setAdminPasswordConfirm").value = "";
      }
    });
  }

  // 3. Admin Profile Settings Form Submission (With safety warning & password verification!)
  const settingsAdminForm = document.getElementById("settingsAdminForm");
  if (settingsAdminForm) {
    settingsAdminForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("setAdminName").value.trim();
      const avatar = document.getElementById("setAdminAvatar").value.trim();
      const profileEmail = document.getElementById("profileEmail").value.trim();
      const profilePhone = document.getElementById("profilePhone").value.trim();
      const currentPasswordInput = document.getElementById("setAdminCurrentPassword").value;
      
      const isChangingPassword = newPasswordSection && newPasswordSection.style.display === "block";
      const newPassword = isChangingPassword ? document.getElementById("setAdminPassword").value : "";
      const confirmPassword = isChangingPassword ? document.getElementById("setAdminPasswordConfirm").value : "";

      if (isChangingPassword) {
        if (newPassword !== confirmPassword) {
          showToast("خطا: رمز عبور جدید با تکرار آن همخوانی ندارد.", "error");
          return;
        }
      }

      const currentProfile = appState.users.find(u => u.id === currentStaffProfileId) || {};
      const existingSettings = loadSystemSettings();
      const profileChanges = [];
      if (name !== (currentProfile.name || existingSettings.adminName || "")) profileChanges.push({ label: "نام کاربری", before: currentProfile.name || existingSettings.adminName || "—", after: name });
      if (profileEmail !== (currentProfile.email || "")) profileChanges.push({ label: "ایمیل", before: currentProfile.email || "—", after: profileEmail });
      if (profilePhone !== (currentProfile.phone || "")) profileChanges.push({ label: "تلفن همراه", before: currentProfile.phone || "—", after: profilePhone });
      if (avatar !== (existingSettings.adminAvatar || "")) profileChanges.push({ label: "تصویر پروفایل", before: "تصویر فعلی", after: "تصویر جدید انتخاب شد" });
      if (isChangingPassword && newPassword) profileChanges.push({ label: "رمز عبور", before: "رمز فعلی", after: "رمز جدید" });
      openProfileChangePreview(profileChanges, () => {
        const currentSettings = loadSystemSettings();
        currentSettings.adminName = name;
        currentSettings.adminAvatar = avatar;

        localStorage.setItem("irHesabdarSystemSettings", JSON.stringify(currentSettings));

        // Live update sidebar display!
        const sideNameEl = document.getElementById("sidebarUserName");
        const sideAvatarEl = document.getElementById("sidebarAvatar");
        if (sideNameEl) sideNameEl.textContent = name;
        if (sideAvatarEl) sideAvatarEl.src = avatar;
        const profileHeading = document.getElementById("profileHeadingName");
        if (profileHeading) profileHeading.textContent = name;
        // Keep the access-management record and its audit trail in sync with profile edits.
        applyStaffProfileChanges(currentStaffProfileId, { name: name, email: profileEmail, phone: profilePhone });

        if (isChangingPassword && newPassword) {
          localStorage.setItem("irHesabdarAdminPassword", newPassword);
          document.getElementById("setAdminCurrentPassword").value = newPassword;
          document.getElementById("setAdminPassword").value = "";
          document.getElementById("setAdminPasswordConfirm").value = "";
          newPasswordSection.style.display = "none";
          
          // Show 10-second disappearing red alert
          const changeAlert = document.getElementById("passwordChangeAlert");
          if (changeAlert) {
            changeAlert.textContent = "⚠️ شما رمز عبور خود را با موفقیت تغییر دادید.";
            changeAlert.style.display = "block";
            setTimeout(() => {
              changeAlert.style.animation = "fadeOut 0.5s ease forwards";
              setTimeout(() => {
                changeAlert.style.display = "none";
                changeAlert.style.animation = "";
              }, 500);
            }, 10000);
          }

          showToast("پروفایل و رمز عبور جدید با موفقیت ذخیره شد.", "success");
        } else {
          showToast("پروفایل کاربری با موفقیت به‌روزرسانی شد.", "success");
        }
      }, () => {
        const latestSettings = loadSystemSettings();
        document.getElementById("setAdminName").value = currentProfile.name || latestSettings.adminName || "";
        document.getElementById("profileEmail").value = currentProfile.email || "";
        document.getElementById("profilePhone").value = currentProfile.phone || "";
        document.getElementById("setAdminAvatar").value = latestSettings.adminAvatar || "";
        document.getElementById("profileAvatarPreview").src = latestSettings.adminAvatar || "https://i.pravatar.cc/150?img=33";
        document.getElementById("setAdminPassword").value = ""; document.getElementById("setAdminPasswordConfirm").value = "";
        showToast("تغییرات اعمال نشد و اطلاعات قبلی بازگردانده شد.", "info");
      });
    });
  }

  // Bind password visibility eye icon toggles for settings page!
  document.querySelectorAll(".toggle-password-settings").forEach(function(icon) {
    icon.addEventListener("click", function() {
      const targetId = icon.getAttribute("data-target");
      const targetInput = document.getElementById(targetId);
      if (targetInput) {
        if (targetInput.type === "password") {
          targetInput.type = "text";
          icon.classList.remove("fa-eye");
          icon.classList.add("fa-eye-slash");
          icon.style.color = "var(--primary)";
        } else {
          targetInput.type = "password";
          icon.classList.remove("fa-eye-slash");
          icon.classList.add("fa-eye");
          icon.style.color = "var(--text-secondary)";
        }
      }
    });
  });

  const avatarInput = document.getElementById("profileAvatarFile");
  const avatarChoose = document.getElementById("profilePhotoChoose");
  if (avatarChoose && avatarInput) avatarChoose.addEventListener("click", () => avatarInput.click());
  if (avatarInput) avatarInput.addEventListener("change", function () { const file = avatarInput.files && avatarInput.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = function (event) { const src = event.target.result; document.getElementById("setAdminAvatar").value = src; document.getElementById("profileAvatarPreview").src = src; }; reader.readAsDataURL(file); });

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
  updateSettingsLockout();
  if (typeof renderAnalyticsView === "function") {
    renderAnalyticsView();
  }
  
  // Render message badges and containers on load
  updateMessagesBadgeCount();
  renderMessages();
  if (typeof renderAnalyticsView === "function") {
    renderAnalyticsView();
  }

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

function updateSettingsLockout() {
  const isLocked = currentAdminUserRole === "admin";
  const settingsView = document.getElementById("view-settings");
  if (!settingsView) return;

  // Only target General Form and Gateway Form for lockout! Leave Admin Profile Form (Card 3) fully active.
  const inputs = settingsView.querySelectorAll("#settingsGeneralForm input, #settingsGeneralForm select, #settingsGeneralForm button, #settingsGatewayForm input, #settingsGatewayForm select, #settingsGatewayForm button");
  inputs.forEach(function(el) {
    if (isLocked) {
      el.disabled = true;
      el.style.opacity = "0.5";
      el.style.cursor = "not-allowed";
      if (el.tagName === "INPUT" || el.tagName === "SELECT") {
        el.style.filter = "blur(3px)";
      }
    } else {
      el.disabled = false;
      el.style.opacity = "1";
      el.style.cursor = "auto";
      el.style.filter = "none";
    }
  });
  
  // Add warning banner inside settings page for Admin
  let warningBanner = document.getElementById("settingsLockWarning");
  if (isLocked) {
    if (!warningBanner) {
      warningBanner = document.createElement("div");
      warningBanner.id = "settingsLockWarning";
      warningBanner.className = "alert alert-error";
      warningBanner.style.background = "rgba(255, 59, 48, 0.08)";
      warningBanner.style.color = "#ff3b30";
      warningBanner.style.border = "1px solid rgba(255, 59, 48, 0.15)";
      warningBanner.style.padding = "12px";
      warningBanner.style.borderRadius = "8px";
      warningBanner.style.marginBottom = "1.5rem";
      warningBanner.style.textAlign = "center";
      warningBanner.style.fontWeight = "bold";
      warningBanner.style.fontSize = "14px";
      warningBanner.style.direction = "rtl";
      warningBanner.innerHTML = `<i class="fas fa-lock" style="margin-left: 6px;"></i> دسترسی مسدود است: تغییر تنظیمات امنیتی، درگاه مالی و عمومی سیستم فقط مخصوص «مدیر کل سایت» می‌باشد.`;
      settingsView.querySelector(".dashboard-content").insertBefore(warningBanner, settingsView.querySelector(".content-grid"));
    }
  } else {
    if (warningBanner) {
      warningBanner.remove();
    }
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

  // Handle settings lockout for Admins
  if (viewName === "settings" && typeof updateSettingsLockout === "function") {
    updateSettingsLockout();
  }

  // Handle rendering of Analytics View
  if (viewName === "analytics" && typeof renderAnalyticsView === "function") {
    renderAnalyticsView();
  }

  if (viewName === "staff") { renderStaffTable(); }

  // Handle rendering and updating messages count when entering Messages tab
  if (viewName === "messages") {
    renderMessages();
  }

  // Handle rendering of Analytics View
  if (viewName === "analytics" && typeof renderAnalyticsView === "function") {
    renderAnalyticsView();
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
  renderStaffTable();
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
  const pendingDeletion = window.pendingUserDeletion || null;
  const users = appState.users.filter(function (user) {
    return user && user.role === "کاربر عادی" && [user.name, user.email, user.phone, user.id].join(" ").toLowerCase().includes(searchQuery);
  });
  tbody.innerHTML = users.map(function (user) {
    const isPending = pendingDeletion && pendingDeletion.id === user.id;
    return `<tr class="${isPending ? "user-pending-delete" : ""}">
      <td>#${toPersianDigits(user.id)}</td>
      <td style="font-weight:500;">${user.name}${isPending ? '<span class="user-pending-delete-note"><i class="fas fa-exclamation-circle"></i> این کاربر حذف شده و تا چند ثانیه دیگر از لیست خارج می‌شود</span>' : ''}</td>
      <td class="user-contact-cell">${user.email || "—"}</td><td class="user-contact-cell">${toPersianDigits(user.phone || "—")}</td>
      <td><span class="status ${user.status === "فعال" ? "success" : "cancelled"}">${user.status}</span></td>
      <td><button class="btn-secondary" style="padding:6px 14px;font-size:12px;cursor:pointer;border-radius:8px;" onclick="editUser(${user.id})" ${isPending ? "disabled" : ""}>بررسی و ویرایش</button></td>
    </tr>`;
  }).join("") || '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-secondary);">کاربر عادی برای نمایش وجود ندارد.</td></tr>';
}
function renderStaffTable() {
  const tbody = document.querySelector("#staffManageTable tbody");
  if (!tbody) return;
  const input = document.getElementById("staffTableSearch");
  const query = input ? input.value.trim().toLowerCase() : "";
  const addStaffBtn = document.querySelector("#view-staff .btn-primary"); if (addStaffBtn) { const locked = currentAdminUserRole === "admin"; addStaffBtn.style.display = locked ? "none" : "inline-flex"; }
  const staffRank = { "مدیر سایت": 1, "مدیر سیستم": 1, "ادمین": 2 };
  const staff = appState.users.filter(function (user) {
    return user && staffRank[user.role] && [user.id, user.name, user.email, user.phone, user.role].join(" ").toLowerCase().includes(query);
  }).sort(function (a, b) { return staffRank[a.role] - staffRank[b.role]; });
  tbody.innerHTML = staff.map(function (user) {
    const locked = currentAdminUserRole === "admin"; const updated = recentlyUpdatedStaffId === user.id; return `<tr class="${window.pendingStaffDeletion && window.pendingStaffDeletion.id === user.id ? 'user-pending-delete' : ''}"><td>#${toPersianDigits(user.id)}${updated ? '<span class="staff-update-dot staff-update-dot--between" title="تغییر جدید ثبت شده"></span>' : ''}</td><td style="font-weight:500;"><span class="staff-field-value ${((recentStaffFieldChanges[user.id] || []).includes('name')) ? 'staff-field-changed' : ''}">${user.name}</span><span class="staff-role-badge ${staffRank[user.role] === 1 ? 'manager' : 'admin'}">${user.role}</span></td><td class="user-contact-cell"><span class="staff-field-value ${((recentStaffFieldChanges[user.id] || []).includes('email')) ? 'staff-field-changed' : ''}">${user.email || '—'}</span></td><td class="user-contact-cell"><span class="staff-field-value ${((recentStaffFieldChanges[user.id] || []).includes('phone')) ? 'staff-field-changed' : ''}">${toPersianDigits(user.phone || '—')}</span></td><td><span class="status ${user.status === 'فعال' ? 'success' : 'cancelled'}">${user.status}</span></td><td><button class="btn-secondary" style="padding:6px 14px;font-size:12px;cursor:pointer;border-radius:8px;${locked?'opacity:.45;pointer-events:none;':''}" onclick="editStaff(${user.id})">بررسی و ویرایش</button></td></tr>`;
  }).join("") || '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-secondary);">مدیر یا ادمینی برای نمایش وجود ندارد.</td></tr>';
}

function refreshStaffModalChangeCues(id) {
  const changed = staffModalReviewChanges[id] || [];
  document.querySelectorAll(".staff-modal-field-dot").forEach(function (dot) { dot.hidden = changed.indexOf(dot.getAttribute("data-staff-field")) === -1; });
}

function editStaff(id) {
  if (currentAdminUserRole === "admin") { showToast("ادمین‌ها فقط اجازه مشاهده فهرست مدیران و ادمین‌ها را دارند.", "error"); return; }
  const staff = appState.users.find(function (user) { return user && user.id === id; });
  if (!staff) return;
  document.getElementById("editStaffId").value = id;
  document.getElementById("staffModalDisplayName").textContent = staff.name || "—";
  document.getElementById("staffIdDisplay").textContent = "#" + toPersianDigits(staff.id);
  document.getElementById("staffNameDisplay").textContent = staff.name || "—";
  document.getElementById("staffEmailDisplay").textContent = staff.email || "—";
  document.getElementById("staffPhoneDisplay").textContent = toPersianDigits(staff.phone || "—");
  document.getElementById("editStaffStatus").value = staff.status || "فعال";
  const modalChanges = staffModalReviewChanges[id] || [];
  refreshStaffModalChangeCues(id);
  // The edit-modal notification has its own timer; it starts only after the manager opens this sheet.
  if (modalChanges.length) setTimeout(function () { delete staffModalReviewChanges[id]; refreshStaffModalChangeCues(id); }, 8000);
  openModal("editStaffModal");
}
function openStaffAuditModal() {
  const id = Number(document.getElementById("editStaffId").value), staff = appState.users.find(u => u.id === id), list = document.getElementById("staffAuditList");
  const entries = staffAuditLogs[id] || [];
  list.innerHTML = entries.length ? entries.map(entry => `<article class="staff-audit-item"><i class="fas fa-pen-to-square"></i><div><p><strong>${staff ? staff.name : "کاربر"}</strong> ${entry.text}</p><time>${entry.date}</time></div></article>`).join("") : '<p class="staff-audit-empty">تغییری برای این حساب ثبت نشده است.</p>';
  openModal("staffAuditModal");
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


// Track recently replied message ID to flash it
let recentlyRepliedMessageId = null;

function isUnanswered(msg) {
  if (!msg) return false;
  
  // Defensive check for legacy/corrupted data
  if (!Array.isArray(msg.history) || msg.history.length === 0) {
    return !msg.reply; // If no reply string, then it is unanswered!
  }
  
  const lastBubble = msg.history[msg.history.length - 1];
  return lastBubble && lastBubble.sender === "user";
}

function updateMessagesBadgeCount() {
  const sidebarBadge = document.getElementById("messages-badge");
  const headerBadge = document.getElementById("messages-header-badge");

  const unreadCount = appState.messages.filter(m => m.unread).length;

  if (unreadCount > 0) {
    const farsiCount = toPersianDigits(unreadCount);
    if (sidebarBadge) {
      sidebarBadge.textContent = farsiCount;
      sidebarBadge.style.display = "inline-flex";
    }
    if (headerBadge) {
      headerBadge.style.display = "block";
    }
  } else {
    if (sidebarBadge) sidebarBadge.style.display = "none";
    if (headerBadge) headerBadge.style.display = "none";
  }
}

function renderFloatingMessages() {
  const container = document.getElementById("floatingMessagesContainer");
  if (!container) return;

  // Sort: Unread/Unanswered messages first (at the top), read/replied ones go to the bottom
  const sortedMsgs = [...appState.messages].sort((a, b) => {
    const aUnanswered = isUnanswered(a);
    const bUnanswered = isUnanswered(b);
    if (a.unread && !b.unread) return -1;
    if (!a.unread && b.unread) return 1;
    if (aUnanswered && !bUnanswered) return -1;
    if (!aUnanswered && bUnanswered) return 1;
    return b.id - a.id; // Newest first
  });

  if (sortedMsgs.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); font-size: 13px; padding: 10px;">صندوق پیام‌ها خالی است.</p>';
    return;
  }

  container.innerHTML = sortedMsgs.map(msg => {
    // Unread indicator is pulsing heartbeat, read is static gray
    const indicator = msg.unread 
      ? '<span class="pulse-indicator" style="margin-left: 6px;"></span>' 
      : '<span class="seen-indicator" style="margin-left: 6px;"></span>';
    
    // Check if unanswered
    const unansweredBadge = isUnanswered(msg) 
      ? '<span style="font-size: 10px; background: rgba(255, 149, 0, 0.1); color: #ff9500; border-radius: 4px; padding: 1px 4px; font-weight: bold; margin-left: 6px;">⚠️ پاسخ داده نشده</span>' 
      : '';

    return `
      <div onclick="openReadMessageModal(${msg.id})" style="padding: 10px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; cursor: pointer; transition: background 0.3s; display: flex; flex-direction: column; gap: 4px;" class="floating-msg-item">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="font-size: 13px; color: var(--text-primary); display: flex; align-items: center; gap: 4px;">${indicator} ${msg.sender}</strong>
          <span style="font-size: 10px; color: var(--text-secondary);">${toPersianDigits(msg.time)}</span>
        </div>
        <p style="font-size: 12px; color: var(--text-secondary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; margin: 0; max-width: 280px;">${unansweredBadge}${msg.text}</p>
      </div>
    `;
  }).join("");
}

function openReadMessageModal(msgId) {
  const msg = appState.messages.find(m => m.id === msgId);
  if (!msg) return;

  // Mark as read (sets unread to false and saves)
  if (msg.unread) {
    msg.unread = false;
    localStorage.setItem("irHesabdarMessages", JSON.stringify(appState.messages));
    updateMessagesBadgeCount();
    renderFloatingMessages();
    renderMessages();
  }

  // Populate modal
  document.getElementById("replyMsgId").value = msgId;
  document.getElementById("readMsgSender").textContent = msg.sender || "ناشناس";
  document.getElementById("readMsgEmail").textContent = msg.email || "---";
  document.getElementById("readMsgDate").textContent = toPersianDigits(msg.time || "---");
  document.getElementById("readMsgBody").textContent = msg.text || "---";
  document.getElementById("replyMsgText").value = "";

  openModal("readMessageModal");
}

function sendInlineReply(msgId) {
  const textarea = document.getElementById("inline-reply-text-" + msgId);
  if (!textarea) return;

  const replyText = textarea.value.trim();
  if (!replyText) {
    alert("لطفاً متن پاسخ را وارد کنید.");
    return;
  }

  const msg = appState.messages.find(m => m.id === msgId);
  if (msg) {
    const sysSettings = loadSystemSettings();
    const adminDisplayName = sysSettings.adminName || "مدیر سایت";

    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const hour = String(today.getHours()).padStart(2, "0");
    const minute = String(today.getMinutes()).padStart(2, "0");
    const replyTime = `۱۴۰۵/${month}/${day} - ${hour}:${minute}`;

    // Push new reply into thread history!
    if (!Array.isArray(msg.history)) msg.history = [];
    msg.history.push({
      sender: "admin",
      name: adminDisplayName,
      text: replyText,
      time: replyTime
    });
    
    msg.unread = false; // Mark as read

    localStorage.setItem("irHesabdarMessages", JSON.stringify(appState.messages));

    recentlyRepliedMessageId = msgId;
    renderMessages();
    updateMessagesBadgeCount();
    showToast("پاسخ شما با موفقیت ارسال شد.", "success");
  }
}

function renderMessages() {
  const container = document.getElementById("messagesListContainer");
  if (!container) return;

  // Sort: Unread and Unanswered messages first (at the top), read/replied ones at the bottom
  const sortedMsgs = [...appState.messages].sort((a, b) => {
    const aUnanswered = isUnanswered(a);
    const bUnanswered = isUnanswered(b);
    if (a.unread && !b.unread) return -1;
    if (!a.unread && b.unread) return 1;
    if (aUnanswered && !bUnanswered) return -1;
    if (!aUnanswered && bUnanswered) return 1;
    return b.id - a.id; // Newest first
  });

  if (sortedMsgs.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">هیچ پیامی در صندوق دریافت نشده است.</p>';
    return;
  }

  container.innerHTML = sortedMsgs
    .map(
      (msg) => {
        const isUnread = msg.unread;
        const unreadClass = isUnread ? "unread" : "";
        
        // Background of unread has soft blue, read is translucent white
        const boxBg = isUnread ? "rgba(0, 122, 255, 0.04)" : "rgba(255, 255, 255, 0.3)";
        const boxBorder = isUnread ? "rgba(0, 122, 255, 0.25)" : "rgba(255, 255, 255, 0.5)";
        const unreadStyle = `background: ${boxBg} !important; border: 1px solid ${boxBorder} !important; box-shadow: var(--shadow-card);`;
        
        // Indicator dot ( pulsing red vs static gray )
        const indicator = isUnread 
          ? '<span class="pulse-indicator" style="margin-left: 8px;"></span>' 
          : '<span class="seen-indicator" style="margin-left: 8px;"></span>';

        // Unanswered banner warning badge
        const unansweredBadge = isUnanswered(msg)
          ? '<span style="font-size: 11px; background: rgba(255, 149, 0, 0.08); color: #ff9500; border: 1px solid rgba(255, 149, 0, 0.15); border-radius: 6px; padding: 4px 8px; font-weight: bold; margin-right: 10px;"><i class="fas fa-reply-all"></i> پاسخ داده نشده</span>'
          : '<span style="font-size: 11px; background: rgba(52, 199, 89, 0.08); color: #34c759; border: 1px solid rgba(52, 199, 89, 0.15); border-radius: 6px; padding: 4px 8px; font-weight: bold; margin-right: 10px;"><i class="fas fa-check-circle"></i> پاسخ داده شده</span>';

        // Render full threaded conversation bubbles!
        const history = msg.history || [];
        const bubblesHtml = history.map(bubble => {
          const isAdmin = bubble.sender === "admin";
          const align = isAdmin ? "left" : "right";
          const bubbleBg = isAdmin ? "rgba(52, 199, 89, 0.06)" : "rgba(255, 255, 255, 0.03)";
          const borderStyle = isAdmin ? "border-right: 3px solid #34c759; margin-right: 40px; margin-left: 0;" : "border-right: 3px solid #007aff; margin-left: 40px; margin-right: 0;";
          const labelColor = isAdmin ? "#34c759" : "var(--primary)";
          
          return `
            <div style="padding: 12px; background: ${bubbleBg}; ${borderStyle} border-radius: 8px; margin-bottom: 10px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <strong style="font-size: 12px; color: ${labelColor};"><i class="fas ${isAdmin ? 'fa-reply' : 'fa-user'}" style="margin-left: 5px;"></i> ${bubble.name} ${isAdmin ? '<span style="font-size: 10px; font-weight: normal; color: var(--text-secondary);">(' + (bubble.name === "مدیر کل سایت" ? "مدیر کل" : "ادمین") + ')</span>' : ''}</strong>
                <span style="font-size: 11px; color: var(--text-secondary);">${toPersianDigits(bubble.time)}</span>
              </div>
              <p style="font-size: 13px; color: var(--text-primary); margin: 0; line-height: 1.8;">${bubble.text}</p>
            </div>
          `;
        }).join("");

        // Highlight replied thread
        let flashStyle = "";
        if (recentlyRepliedMessageId === msg.id) {
          flashStyle = "outline: 3px solid #007aff; animation: flash-border 1s infinite alternate;";
        }

        return `
          <div class="notification-item ${unreadClass}" id="msg-thread-${msg.id}" style="margin-bottom: 2rem; border-radius: 20px; padding: 22px; transition: all 0.3s; display: block; ${unreadStyle} ${flashStyle}">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 12px; margin-bottom: 15px; text-align: right; direction: rtl;">
              <div style="display: flex; align-items: center; gap: 6px;">
                ${indicator}
                <strong style="font-size: 14px; color: var(--text-primary);">گفتگو با ${msg.sender} <span style="font-size: 11px; font-weight: normal; color: var(--text-secondary);">(${msg.email})</span></strong>
                ${unansweredBadge}
              </div>
              <span style="font-size: 11px; color: var(--text-secondary);">شروع گفتگو: ${toPersianDigits(msg.time)}</span>
            </div>

            <!-- Chat History Area -->
            <div style="display: flex; flex-direction: column;">
              ${bubblesHtml}
            </div>

            <!-- Inline Thread Reply Form (RTL, Beautiful) -->
            <div style="margin-top: 15px; border-top: 1px solid rgba(0,0,0,0.04); padding-top: 15px;">
              <div style="display: flex; gap: 10px; align-items: flex-end;">
                <textarea id="inline-reply-text-${msg.id}" class="form-control" rows="1" placeholder="پاسخ خود را بنویسید..." style="flex: 1; padding: 10px; border-radius: 8px; resize: none; min-height: 40px; line-height: 1.8; text-align: right; direction: rtl; background: rgba(255,255,255,0.4); border: 1px solid rgba(0,0,0,0.08);"></textarea>
                <button type="button" class="btn-primary" onclick="sendInlineReply(${msg.id})" style="padding: 10px 20px; border-radius: 8px; font-weight: bold; border: none; cursor: pointer; color: #fff; height: 40px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                  <i class="fas fa-paper-plane"></i> ارسال پاسخ
                </button>
              </div>
            </div>
          </div>
        `;
      }
    )
    .join("");

  if (!document.getElementById("flashKeyframeStyle")) {
    const style = document.createElement("style");
    style.id = "flashKeyframeStyle";
    style.innerHTML = `
      @keyframes flash-border {
        0% { outline-color: #007aff; }
        100% { outline-color: rgba(0, 122, 255, 0.1); }
      }
    `;
    document.head.appendChild(style);
  }

  // Smooth scroll and clear flash after 5 seconds
  if (recentlyRepliedMessageId) {
    setTimeout(() => {
      const el = document.getElementById("msg-thread-" + recentlyRepliedMessageId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setTimeout(() => {
        recentlyRepliedMessageId = null;
        renderMessages();
      }, 5000);
    }, 200);
  }
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
  // Reply Message Form Submission
  const replyMessageForm = document.getElementById("replyMessageForm");
  const messagesFloatingPanelElement = document.getElementById("messagesFloatingPanel");
  if (replyMessageForm) {
    replyMessageForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const msgId = parseInt(document.getElementById("replyMsgId").value);
      const replyText = document.getElementById("replyMsgText").value.trim();

      const msg = appState.messages.find(m => m.id === msgId);
      if (msg) {
        const sysSettings = loadSystemSettings();
        const adminDisplayName = sysSettings.adminName || "مدیر سایت";

        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        const hour = String(today.getHours()).padStart(2, "0");
        const minute = String(today.getMinutes()).padStart(2, "0");
        const replyTime = `۱۴۰۵/${month}/${day} - ${hour}:${minute}`;

        msg.reply = replyText;
        msg.repliedBy = adminDisplayName;
        msg.replyTime = replyTime;
        msg.unread = false;

        localStorage.setItem("irHesabdarMessages", JSON.stringify(appState.messages));

        closeModal("readMessageModal");
        if (messagesFloatingPanelElement) {
          messagesFloatingPanelElement.style.display = "none";
        }

        recentlyRepliedMessageId = msgId;
        switchView("messages");
        renderMessages();
        updateMessagesBadgeCount();

        showToast("پاسخ شما با موفقیت ارسال شد و در تاریخچه پیام‌ها قرار گرفت.", "success");
      }
    });
  }

  // Safety confirmation buttons
  document.getElementById("warningConfirmBtn")?.addEventListener("click", executeWarningAction);
  document.getElementById("warningCancelBtn")?.addEventListener("click", cancelWarningAction);

  // Edit User Form Submission (With safety warning!)
  const editUserForm = document.getElementById("editUserForm");
  if (editUserForm) {
    editUserForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const id = parseInt(document.getElementById("editUserId").value);
      const userForEdit = appState.users.find(u => u.id === id);
      const name = userForEdit ? userForEdit.name : "کاربر";
      const status = document.getElementById("editUserStatus").value;
      triggerSafetyWarning(`آیا از ثبت نهایی تغییرات وضعیت کاربر «${name}» اطمینان دارید؟`, () => {
        const user = appState.users.find(u => u.id === id);
        if (user) {
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
        window.pendingUserDeletion = { id: id };
        closeModal("editUserModal");
        switchView("users");
        renderUsersTable();
        showToast("کاربر حذف شد؛ ردیف قرمز تا ۱۰ ثانیه دیگر از لیست خارج می‌شود.", "error");
        setTimeout(function () {
          appState.users = appState.users.filter(function (u) { return u.id !== id; });
          localStorage.setItem("irHesabdarUsers", JSON.stringify(appState.users));
          window.pendingUserDeletion = null;
          renderUsersTable();
          showToast("کاربر از فهرست کاربران حذف شد.", "success");
        }, 10000);
      });
    });
  }

  const editStaffForm = document.getElementById("editStaffForm");
  if (editStaffForm) editStaffForm.addEventListener("submit", function (e) { e.preventDefault(); const id = Number(document.getElementById("editStaffId").value), staff = appState.users.find(u => u.id === id), status = document.getElementById("editStaffStatus").value; if (!staff) return; triggerSafetyWarning(`آیا از تغییر وضعیت حساب «${staff.name}» اطمینان دارید؟`, function () { staff.status = status; localStorage.setItem("irHesabdarUsers", JSON.stringify(appState.users)); renderStaffTable(); closeModal("editStaffModal"); showToast("وضعیت حساب به‌روزرسانی شد.", "success"); }); });
  document.getElementById("deleteStaffBtn")?.addEventListener("click", function () { const id = Number(document.getElementById("editStaffId").value), staff = appState.users.find(u => u.id === id); if (!staff) return; triggerSafetyWarning(`⚠️ آیا از حذف حساب «${staff.name}» مطمئن هستید؟`, function () { window.pendingStaffDeletion = { id }; closeModal("editStaffModal"); switchView("staff"); renderStaffTable(); showToast("حساب برای ۱۰ ثانیه با هشدار قرمز نمایش داده می‌شود.", "error"); setTimeout(function(){ appState.users = appState.users.filter(u=>u.id!==id); localStorage.setItem("irHesabdarUsers",JSON.stringify(appState.users)); window.pendingStaffDeletion=null; renderStaffTable(); showToast("حساب از فهرست حذف شد.","success");},10000); }); });

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
        id: appState.users.reduce((max, user) => Math.max(max, Number(user.id) || 0), 0) + 1,
        name: name,
        email: email,
        phone: phone,
        contact: `${email} / ${phone}`,
        role: role,
        status: "فعال"
      };

      appState.users.unshift(newUser);

      // Save to localStorage
      localStorage.setItem("irHesabdarUsers", JSON.stringify(appState.users));

      renderUsersTable();
      renderStaffTable();
      closeModal("addUserModal");
      addUserForm.reset();
      showToast("مدیر یا ادمین جدید با موفقیت ثبت شد", "success");
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
      applyStaffProfileChanges(currentStaffProfileId, { name: newName });

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
  const user = appState.users.find(function (u) { return u.id === id && u.role === "کاربر عادی"; });
  if (!user) return;
  document.getElementById("editUserId").value = id;
  document.getElementById("userModalDisplayName").textContent = user.name || "—";
  document.getElementById("editUserIdDisplay").textContent = "#" + toPersianDigits(user.id);
  document.getElementById("editUserNameDisplay").textContent = user.name || "—";
  document.getElementById("editUserEmailDisplay").textContent = user.email || "—";
  document.getElementById("editUserPhoneDisplay").textContent = toPersianDigits(user.phone || "—");
  document.getElementById("editUserStatus").value = user.status || "فعال";
  renderUserOrders(user);
  openModal("editUserModal");
}

function renderUserOrders(user) {
  const list = document.getElementById("userOrdersList");
  const count = document.getElementById("userOrdersCount");
  if (!list || !count) return;
  const orders = appState.orders.filter(function (order) {
    return String(order.customer || "").trim() === String(user.name || "").trim() ||
      (order.buyerEmail && String(order.buyerEmail).toLowerCase() === String(user.email).toLowerCase());
  });
  count.textContent = orders.length ? toPersianDigits(orders.length) + " سفارش · برای مشاهده کلیک کنید" : "سفارشی ثبت نشده است";
  list.innerHTML = orders.length ? orders.map(function (order) {
    return `<article class="user-order-item"><div class="user-order-item__top"><span>${order.id}</span><span class="status ${order.status}">${getStatusText(order.status)}</span></div><p>${order.product || "محصول"}</p><div class="user-order-item__meta"><span>${toPersianDigits(order.date || "—")}</span><strong>${toPersianDigits(order.amount || "—")}</strong></div></article>`;
  }).join("") : '<p style="text-align:center;color:var(--text-secondary);font-size:12px;padding:10px 0;margin:0;">هنوز سفارشی برای این کاربر ثبت نشده است.</p>';
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

  const staffSearch = document.getElementById("staffTableSearch");
  if (staffSearch) staffSearch.addEventListener("input", renderStaffTable);

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


// --- ADVANCED DYNAMIC ANALYTICS SYSTEM ---

function renderAnalyticsView() {
  const chartContainer = document.getElementById("dynamicChartBars");
  const productsContainer = document.getElementById("bestsellingProductsContainer");
  const avgEl = document.getElementById("set-analytics-avg");
  const cancelEl = document.getElementById("set-analytics-cancel");
  const prodCountEl = document.getElementById("set-analytics-products");

  if (!chartContainer || !productsContainer) return;

  // 1. Calculate KPI Metrics
  const totalOrders = appState.orders.length;
  const successfulOrders = appState.orders.filter(o => o.status === "success");
  const cancelledOrders = appState.orders.filter(o => o.status === "cancelled" || o.status === "failed");

  // A. Average Basket Value
  const totalRev = successfulOrders.reduce((sum, o) => {
    const cleanNum = parseFloat(String(o.amount || "").replace(/[^d.]/g, ""));
    return sum + (isNaN(cleanNum) ? 0 : cleanNum);
  }, 0);
  const avgValue = successfulOrders.length > 0 ? Math.round(totalRev / successfulOrders.length) : 0;
  if (avgEl) avgEl.textContent = toPersianDigits(avgValue.toLocaleString()) + " تومان";

  // B. Cancellation Rate
  const cancelRate = totalOrders > 0 ? Math.round((cancelledOrders.length / totalOrders) * 100) : 0;
  if (cancelEl) cancelEl.textContent = toPersianDigits(cancelRate) + "٪";

  // C. Total Products Count
  const totalProdsCount = appState.products.length;
  if (prodCountEl) prodCountEl.textContent = toPersianDigits(totalProdsCount) + " عدد";


  // 2. Render Monthly Revenue Chart (Compact 5 Months View)
  const months = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
  const revenueByMonth = {};
  months.forEach(m => { revenueByMonth[m] = 0; });

  successfulOrders.forEach(order => {
    const dateStr = order.date || "";
    const parts = dateStr.split("/");
    if (parts.length >= 2) {
      const monthIdx = parseInt(parts[1]) - 1;
      if (monthIdx >= 0 && monthIdx < 12) {
        const mName = months[monthIdx];
        const cleanNum = parseFloat(String(order.amount || "").replace(/[^d.]/g, ""));
        revenueByMonth[mName] += (isNaN(cleanNum) ? 0 : cleanNum);
      }
    }
  });

  let maxRevenue = 0;
  months.forEach(m => {
    if (revenueByMonth[m] > maxRevenue) maxRevenue = revenueByMonth[m];
  });
  if (maxRevenue === 0) maxRevenue = 100000;

  const activeMonths = months.filter(m => revenueByMonth[m] > 0);
  const monthsToRender = activeMonths.length >= 3 ? activeMonths : months.slice(0, 5);

  chartContainer.innerHTML = monthsToRender.map(mName => {
    const rev = revenueByMonth[mName];
    const heightPercent = Math.round((rev / maxRevenue) * 100);
    const heightStyle = Math.max(heightPercent, 5);
    return `
      <div class="chart-bar-item" style="display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%;" title="فروش ${mName}: ${rev.toLocaleString()} تومان">
        <span style="font-size: 11px; font-weight: bold; color: var(--success); margin-bottom: 5px;">${rev > 0 ? toPersianDigits(Math.round(rev/1000) + "K") : "۰"}</span>
        <div class="chart-bar" style="height: ${heightStyle}%; width: 35px; background: linear-gradient(180deg, var(--primary) 0%, rgba(0,122,255,0.4) 100%); border-radius: 6px 6px 0 0; transition: height 0.6s cubic-bezier(0.16, 1, 0.3, 1);"></div>
        <span style="font-size: 12px; color: var(--text-primary); margin-top: 8px;">${mName}</span>
      </div>
    `;
  }).join("");


  // 3. Render Bestselling Products (Compact 4 Items View)
  const salesByProduct = {};
  successfulOrders.forEach(order => {
    const pName = order.product;
    if (pName) {
      if (!salesByProduct[pName]) {
        salesByProduct[pName] = { count: 0, revenue: 0 };
      }
      salesByProduct[pName].count++;
      const cleanNum = parseFloat(String(order.amount || "").replace(/[^d.]/g, ""));
      salesByProduct[pName].revenue += (isNaN(cleanNum) ? 0 : cleanNum);
    }
  });

  const sortedProds = Object.keys(salesByProduct).map(pName => {
    return {
      name: pName,
      count: salesByProduct[pName].count,
      revenue: salesByProduct[pName].revenue
    };
  }).sort((a, b) => b.count - a.count);

  if (sortedProds.length === 0) {
    productsContainer.innerHTML = `<p style="text-align: center; color: var(--text-muted); font-size: 13px; padding: 2rem;">هنوز تراکنش موفقی ثبت نشده است.</p>`;
    return;
  }

  const maxSalesCount = sortedProds[0].count || 1;

  productsContainer.innerHTML = sortedProds.slice(0, 4).map(p => {
    const percent = Math.round((p.count / maxSalesCount) * 100);
    return `
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 500;">
          <span style="color: var(--text-primary); font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 250px;">${p.name}</span>
          <span style="color: var(--success); font-weight: bold;">${toPersianDigits(p.count)} فروش (${toPersianDigits(p.revenue.toLocaleString())} تومان)</span>
        </div>
        <div style="height: 8px; width: 100%; background: rgba(0,0,0,0.05); border-radius: 4px; overflow: hidden;">
          <div style="height: 100%; width: ${percent}%; background: linear-gradient(90deg, var(--primary) 0%, #34c759 100%); border-radius: 4px; transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);"></div>
        </div>
      </div>
    `;
  }).join("");
}

// --- EXPANDED ANALYTICS AND PORTAL JUMPERS ---

function focusRevenueChart() {
  const chartCard = document.querySelector("#view-analytics .content-grid .glass-card");
  if (chartCard) {
    chartCard.scrollIntoView({ behavior: "smooth", block: "center" });
    chartCard.style.outline = "2px solid var(--primary)";
    setTimeout(() => { chartCard.style.outline = "none"; }, 1500);
  }
}

function jumpToCancelledOrders() {
  switchView("orders");
  const filter = document.getElementById("orderStatusFilter");
  if (filter) {
    filter.value = "cancelled";
    if (typeof filter.onchange === "function") {
      filter.onchange();
    } else {
      renderOrdersTable();
    }
  }
}

function openExpandedChartModal() {
  const chartBars = document.getElementById("expandedChartBars");
  if (!chartBars) return;

  const successfulOrders = appState.orders.filter(o => o.status === "success");
  const months = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
  
  const revenueByMonth = {};
  months.forEach(m => { revenueByMonth[m] = 0; });

  successfulOrders.forEach(order => {
    const dateStr = order.date || "";
    const parts = dateStr.split("/");
    if (parts.length >= 2) {
      const monthIdx = parseInt(parts[1]) - 1;
      if (monthIdx >= 0 && monthIdx < 12) {
        const mName = months[monthIdx];
        const cleanNum = parseFloat(String(order.amount || "").replace(/[^d.]/g, ""));
        revenueByMonth[mName] += (isNaN(cleanNum) ? 0 : cleanNum);
      }
    }
  });

  let maxRevenue = 0;
  months.forEach(m => {
    if (revenueByMonth[m] > maxRevenue) maxRevenue = revenueByMonth[m];
  });
  if (maxRevenue === 0) maxRevenue = 100000;

  chartBars.innerHTML = months.map(mName => {
    const rev = revenueByMonth[mName];
    const heightPercent = Math.round((rev / maxRevenue) * 100);
    const heightStyle = Math.max(heightPercent, 5);
    return `
      <div class="chart-bar-item" style="display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; flex: 1;" title="فروش ${mName}: ${rev.toLocaleString()} تومان">
        <span style="font-size: 10px; font-weight: bold; color: var(--success); margin-bottom: 5px;">${rev > 0 ? toPersianDigits(Math.round(rev/1000) + "K") : "۰"}</span>
        <div class="chart-bar" style="height: ${heightStyle}%; width: 22px; background: linear-gradient(180deg, var(--primary) 0%, rgba(0,122,255,0.4) 100%); border-radius: 4px 4px 0 0;"></div>
        <span style="font-size: 11px; color: var(--text-primary); margin-top: 8px;">${mName}</span>
      </div>
    `;
  }).join("");

  openModal("expandedChartModal");
}

function downloadDetailedRevenueReport() {
  const successfulOrders = appState.orders.filter(o => o.status === "success");
  const months = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
  
  const revenueByMonth = {};
  months.forEach(m => { revenueByMonth[m] = 0; });

  successfulOrders.forEach(order => {
    const dateStr = order.date || "";
    const parts = dateStr.split("/");
    if (parts.length >= 2) {
      const monthIdx = parseInt(parts[1]) - 1;
      if (monthIdx >= 0 && monthIdx < 12) {
        const mName = months[monthIdx];
        const cleanNum = parseFloat(String(order.amount || "").replace(/[^d.]/g, ""));
        revenueByMonth[mName] += (isNaN(cleanNum) ? 0 : cleanNum);
      }
    }
  });

  let csvContent = "\uFEFF";
  csvContent += "گزارش مالی سالانه حسابیار - تفکیک ۱۲ ماه\n\n";
  csvContent += "نام ماه,مبلغ کل فروش (تومان)\n";

  months.forEach(m => {
    csvContent += `"${m}","${toPersianDigits(revenueByMonth[m].toLocaleString())}"\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `annual_revenue_report_${toPersianDigits(Date.now())}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("گزارش سالانه فروش با موفقیت دانلود شد.", "success");
}

function openExpandedBestsellersModal() {
  const container = document.getElementById("expandedBestsellersList");
  if (!container) return;

  const successfulOrders = appState.orders.filter(o => o.status === "success");
  const salesByProduct = {};
  
  successfulOrders.forEach(order => {
    const pName = order.product;
    if (pName) {
      if (!salesByProduct[pName]) {
        salesByProduct[pName] = { count: 0, revenue: 0 };
      }
      salesByProduct[pName].count++;
      const cleanNum = parseFloat(String(order.amount || "").replace(/[^d.]/g, ""));
      salesByProduct[pName].revenue += (isNaN(cleanNum) ? 0 : cleanNum);
    }
  });

  const sortedProds = Object.keys(salesByProduct).map(pName => {
    return {
      name: pName,
      count: salesByProduct[pName].count,
      revenue: salesByProduct[pName].revenue
    };
  }).sort((a, b) => b.count - a.count);

  if (sortedProds.length === 0) {
    container.innerHTML = `<p style="text-align: center; color: var(--text-muted); font-size: 13px; padding: 2rem;">هنوز تراکنش موفقی ثبت نشده است.</p>`;
    openModal("expandedBestsellersModal");
    return;
  }

  const maxSalesCount = sortedProds[0].count || 1;

  container.innerHTML = sortedProds.slice(0, 12).map(p => {
    const percent = Math.round((p.count / maxSalesCount) * 100);
    return `
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 500;">
          <span style="color: var(--text-primary); font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 320px;">${p.name}</span>
          <span style="color: var(--success); font-weight: bold;">${toPersianDigits(p.count)} فروش (${toPersianDigits(p.revenue.toLocaleString())} تومان)</span>
        </div>
        <div style="height: 10px; width: 100%; background: rgba(0,0,0,0.05); border-radius: 5px; overflow: hidden;">
          <div style="height: 100%; width: ${percent}%; background: linear-gradient(90deg, var(--primary) 0%, #34c759 100%); border-radius: 5px;"></div>
        </div>
      </div>
    `;
  }).join("");

  openModal("expandedBestsellersModal");
}

function downloadDetailedBestsellersReport() {
  const successfulOrders = appState.orders.filter(o => o.status === "success");
  const salesByProduct = {};
  
  successfulOrders.forEach(order => {
    const pName = order.product;
    if (pName) {
      if (!salesByProduct[pName]) {
        salesByProduct[pName] = { count: 0, revenue: 0 };
      }
      salesByProduct[pName].count++;
      const cleanNum = parseFloat(String(order.amount || "").replace(/[^d.]/g, ""));
      salesByProduct[pName].revenue += (isNaN(cleanNum) ? 0 : cleanNum);
    }
  });

  const sortedProds = Object.keys(salesByProduct).map(pName => {
    return {
      name: pName,
      count: salesByProduct[pName].count,
      revenue: salesByProduct[pName].revenue
    };
  }).sort((a, b) => b.count - a.count);

  let csvContent = "\uFEFF";
  csvContent += "گزارش تفکیکی پرفروش ترین دوره ها و فایل ها\n\n";
  csvContent += "نام محصول,تعداد فروش کل,مجموع درآمد تولید شده (تومان)\n";

  sortedProds.forEach(p => {
    csvContent += `"${p.name}","${toPersianDigits(p.count)}","${toPersianDigits(p.revenue.toLocaleString())}"\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `bestselling_products_report_${toPersianDigits(Date.now())}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("گزارش پرفروش‌ترین محصولات با موفقیت دانلود شد.", "success");
}
