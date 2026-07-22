const APP_API_STORAGE = "hesabyarApiState";
const APP_SESSION_STORAGE = "hesabyarSession";
const APP_LOCAL_STORAGE =
  typeof localStorage !== "undefined" ? localStorage : null;

const APP_API_CONFIG = {
  baseUrl:
    (typeof window !== "undefined" && window.APP_CONFIG?.apiBaseUrl) ||
    APP_LOCAL_STORAGE?.getItem("hesabyarApiBaseUrl") ||
    "",
  mode:
    (typeof window !== "undefined" && window.APP_CONFIG?.apiMode) ||
    APP_LOCAL_STORAGE?.getItem("hesabyarApiMode") ||
    "mock",
  timeout: 10000,
};

class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status || 0;
    this.details = details || null;
  }
}

function readStorage(key, fallback) {
  try {
    const value = APP_LOCAL_STORAGE?.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  APP_LOCAL_STORAGE?.setItem(key, JSON.stringify(value));
}

function createId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return prefix + "-" + crypto.randomUUID();
  }
  return prefix + "-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

function getSession() {
  return readStorage(APP_SESSION_STORAGE, null);
}

function setSession(session) {
  if (session) {
    writeStorage(APP_SESSION_STORAGE, session);
  } else {
    APP_LOCAL_STORAGE?.removeItem(APP_SESSION_STORAGE);
  }
}

function getApiState() {
  const saved = readStorage(APP_API_STORAGE, {});
  return {
    ...saved,
    users: Array.isArray(saved.users) ? saved.users : [],
    messages: Array.isArray(saved.messages) ? saved.messages : [],
    newsletter: Array.isArray(saved.newsletter) ? saved.newsletter : [],
    orders: Array.isArray(saved.orders) ? saved.orders : [],
    profiles: saved.profiles && typeof saved.profiles === "object" ? saved.profiles : {},
    content: saved.content && typeof saved.content === "object" ? saved.content : {},
  };
}

function saveApiState(state) {
  writeStorage(APP_API_STORAGE, state);
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function validateRequired(value, message) {
  if (!String(value || "").trim()) {
    throw new ApiError(message, 422);
  }
}

async function request(path, options) {
  const settings = options || {};

  if (APP_API_CONFIG.mode === "mock" || !APP_API_CONFIG.baseUrl) {
    return mockRequest(path, settings);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), APP_API_CONFIG.timeout);
  const headers = new Headers(settings.headers || {});
  headers.set("Accept", "application/json");

  if (settings.body && typeof settings.body !== "string") {
    headers.set("Content-Type", "application/json");
    settings.body = JSON.stringify(settings.body);
  }

  const session = getSession();
  if (session?.token) {
    headers.set("Authorization", "Bearer " + session.token);
  }

  try {
    const response = await fetch(
      APP_API_CONFIG.baseUrl.replace(/\/$/, "") + "/" + path.replace(/^\//, ""),
      {
        method: settings.method || "GET",
        headers: headers,
        body: settings.body,
        signal: controller.signal,
      },
    );
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new ApiError(
        payload?.message || "ارتباط با سرور ناموفق بود.",
        response.status,
        payload,
      );
    }

    return payload;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new ApiError("زمان پاسخ‌گویی سرور به پایان رسید.", 408);
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("امکان برقراری ارتباط با سرور وجود ندارد.", 0, error);
  } finally {
    clearTimeout(timeout);
  }
}

async function mockRequest(path, options) {
  const body = options.body || {};
  const state = getApiState();

  if (path === "/auth/register") {
    const email = normalizeEmail(body.email);
    validateRequired(body.name, "نام را وارد کنید.");
    validateRequired(email, "ایمیل را وارد کنید.");
    validateRequired(body.password, "رمز عبور را وارد کنید.");

    if (String(body.password).length < 6) {
      throw new ApiError("رمز عبور باید حداقل ۶ کاراکتر باشد.", 422);
    }

    if (state.users.some((user) => user.email === email)) {
      throw new ApiError("این ایمیل قبلاً ثبت‌نام کرده است.", 409);
    }

    const user = {
      id: createId("user"),
      name: String(body.name).trim(),
      email: email,
      phone: String(body.phone || "").trim(),
      createdAt: new Date().toISOString(),
    };
    state.users.push({ ...user, password: String(body.password) });
    state.profiles[user.id] = user;
    saveApiState(state);
    const session = { token: createId("token"), user: user };
    setSession(session);
    return session;
  }

  if (path === "/auth/login") {
    const email = normalizeEmail(body.email);
    const user = state.users.find((entry) => entry.email === email);

    if (!user || user.password !== String(body.password || "")) {
      throw new ApiError("ایمیل یا رمز عبور صحیح نیست.", 401);
    }

    const session = {
      token: createId("token"),
      user: state.profiles[user.id] || {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
    setSession(session);
    return session;
  }

  if (path === "/auth/logout") {
    setSession(null);
    return { success: true };
  }

  if (path === "/auth/me") {
    const session = getSession();
    if (!session) {
      throw new ApiError("کاربر وارد نشده است.", 401);
    }
    return session.user;
  }

  if (path === "/auth/forgot-password") {
    validateRequired(body.email, "ایمیل را وارد کنید.");
    return { success: true, message: "لینک بازیابی ارسال شد." };
  }

  if (path === "/support/messages") {
    validateRequired(body.name, "نام را وارد کنید.");
    validateRequired(body.email, "ایمیل را وارد کنید.");
    validateRequired(body.subject, "موضوع را انتخاب کنید.");
    validateRequired(body.message, "پیام را وارد کنید.");
    state.messages.push({ ...body, id: createId("message"), createdAt: new Date().toISOString() });
    saveApiState(state);
    return { success: true, message: "پیام شما با موفقیت ارسال شد." };
  }

  if (path === "/newsletter/subscribe") {
    const email = normalizeEmail(body.email);
    validateRequired(email, "ایمیل را وارد کنید.");
    if (!state.newsletter.includes(email)) {
      state.newsletter.push(email);
      saveApiState(state);
    }
    return { success: true, message: "عضویت شما در خبرنامه ثبت شد." };
  }

  if (path === "/profile/update") {
    const session = getSession();
    if (!session) {
      throw new ApiError("برای ویرایش پروفایل وارد شوید.", 401);
    }
    const profile = { ...session.user, ...body };
    state.profiles[profile.id] = profile;
    saveApiState(state);
    setSession({ ...session, user: profile });
    return profile;
  }

  if (path === "/profile/password") {
    const session = getSession();
    if (!session) {
      throw new ApiError("برای تغییر رمز وارد شوید.", 401);
    }
    const user = state.users.find((entry) => entry.id === session.user.id);
    if (!user || user.password !== String(body.currentPassword || "")) {
      throw new ApiError("رمز عبور فعلی صحیح نیست.", 422);
    }
    if (String(body.newPassword || "").length < 6) {
      throw new ApiError("رمز عبور جدید باید حداقل ۶ کاراکتر باشد.", 422);
    }
    user.password = String(body.newPassword);
    saveApiState(state);
    return { success: true };
  }

  if (path === "/commerce/coupon") {
    const code = String(body.code || "").trim().toUpperCase();
    if (code !== "DISCOUNT10" && code !== "OFF10") {
      throw new ApiError("کد تخفیف نامعتبر یا منقضی شده است.", 422);
    }
    return { code: code, percent: 10, message: "۱۰٪ تخفیف اعمال شد." };
  }

  if (path === "/commerce/payment") {
    const order = {
      id: createId("order"),
      amount: Number(body.amount || 0),
      status: "success",
      createdAt: new Date().toISOString(),
    };
    state.orders.push(order);
    saveApiState(state);
    return { success: true, orderId: order.id, status: order.status };
  }

  if (path.startsWith("/content/items/")) {
    const itemId = decodeURIComponent(path.replace("/content/items/", ""));
    if (options.method === "GET") {
      return state.content[itemId] || null;
    }
    if (options.method === "DELETE") {
      delete state.content[itemId];
      saveApiState(state);
      return { success: true };
    }
    state.content[itemId] = body;
    saveApiState(state);
    return state.content[itemId];
  }

  throw new ApiError("مسیر API در حالت محلی تعریف نشده است.", 404);
}

const appApi = {
  config: APP_API_CONFIG,
  request: request,
  auth: {
    login: (payload) => request("/auth/login", { method: "POST", body: payload }),
    register: (payload) => request("/auth/register", { method: "POST", body: payload }),
    logout: () => request("/auth/logout", { method: "POST" }),
    me: () => request("/auth/me"),
    forgotPassword: (payload) => request("/auth/forgot-password", { method: "POST", body: payload }),
  },
  support: {
    sendMessage: (payload) => request("/support/messages", { method: "POST", body: payload }),
  },
  newsletter: {
    subscribe: (payload) => request("/newsletter/subscribe", { method: "POST", body: payload }),
  },
  profile: {
    update: (payload) => request("/profile/update", { method: "PATCH", body: payload }),
    changePassword: (payload) => request("/profile/password", { method: "POST", body: payload }),
  },
  commerce: {
    validateCoupon: (payload) => request("/commerce/coupon", { method: "POST", body: payload }),
    createPayment: (payload) => request("/commerce/payment", { method: "POST", body: payload }),
  },
  content: {
    get: (itemId) => request("/content/items/" + encodeURIComponent(itemId)),
    update: (itemId, payload) => request("/content/items/" + encodeURIComponent(itemId), { method: "PATCH", body: payload }),
    remove: (itemId) => request("/content/items/" + encodeURIComponent(itemId), { method: "DELETE" }),
  },
};

if (typeof window !== "undefined") {
  window.appApi = appApi;
  window.ApiError = ApiError;
}

if (typeof module !== "undefined") {
  module.exports = { appApi, ApiError, APP_API_CONFIG };
}
