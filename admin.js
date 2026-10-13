"use strict";

const ADMIN_TEXT = {
  ur: {
    brand: "رفاہ بلڈ ڈونیشن", languageLabel: "زبان", backHome: "ہوم پیج پر واپس",
    adminLabel: "منتظم پورٹل", loginTitle: "منتظم لاگ اِن",
    loginIntro: "درخواستوں اور ڈونرز کا محفوظ انتظام کرنے کے لیے سائن اِن کریں۔",
    emailLabel: "ای میل", passwordLabel: "پاس ورڈ", loginButton: "محفوظ طریقے سے لاگ اِن کریں",
    loginNotice: "منتظم کی رسائی صرف مجاز فرد کے لیے ہے۔ پاس ورڈ صرف محفوظ hash کی صورت میں محفوظ ہوتا ہے۔",
    dashboardLabel: "منتظم ڈیش بورڈ", dashboardTitle: "درخواستیں اور ڈونرز", logout: "لاگ آؤٹ",
    newRequests: "نئی درخواستیں", totalRequests: "کل درخواستیں", registeredDonors: "رجسٹرڈ ڈونرز",
    completedRequests: "مکمل درخواستیں", inboxLabel: "منظور شدہ درخواستیں", incomingRequests: "ڈیش بورڈ کی درخواستیں",
    notifications: "نئی درخواستیں", notificationInfo: "نئی درخواست قبول یا منسوخ کرنے کے لیے یہاں دیکھیں۔",
    acceptedInfo: "صرف منظور شدہ درخواستیں یہاں دکھائی جاتی ہیں۔",
    noPending: "کوئی نئی درخواست زیرِ جائزہ نہیں۔",
    noAccepted: "ابھی کوئی منظور شدہ درخواست نہیں۔ نئی درخواستیں گھنٹی میں دیکھیں۔",
    acceptRequest: "قبول کریں", cancelRequest: "منسوخ کریں",
    donorLabel: "ڈونر ڈائریکٹری",
    donorListTitle: "رجسٹرڈ خون کے عطیہ دہندگان", filterGroup: "بلڈ گروپ کے مطابق فلٹر",
    allGroups: "تمام بلڈ گروپس", noDonors: "ابھی کوئی ڈونر رجسٹر نہیں ہوا۔",
    addDonor: "نیا ڈونر شامل کریں", addDonorButton: "ڈونر شامل کریں", donorName: "نام",
    donorAdded: "ڈونر کامیابی سے شامل ہوگیا۔", donorAddError: "ڈونر شامل نہیں ہو سکا۔ دوبارہ کوشش کریں۔",
    adminSecurityNote: "حساس مریض اور ڈونر معلومات صرف مجاز ٹیم تک محدود رکھیں۔ اس مقامی سرور کو HTTPS کے بغیر انٹرنیٹ پر شائع نہ کریں۔",
    footerSociety: "رفاہ ویلفیئر سوسائٹی، چکنمبر 116/ڈبلیو بی",
    statusPending: "نئی — زیرِ جائزہ", statusAccepted: "منظور", statusMatched: "ڈونر مل گیا",
    statusFulfilled: "مکمل", statusCancelled: "منسوخ",
    patient: "مریض", phone: "رابطہ نمبر", bloodGroup: "بلڈ گروپ", area: "علاقہ",
    statusLabel: "درخواست کا اسٹیٹس", condition: "طبی تفصیل", extraInfo: "اضافی معلومات",
    hospital: "ہسپتال", neededBy: "خون درکار", submitted: "درخواست موصول",
    adminNote: "منتظم کا نوٹ", notePlaceholder: "مثلاً ڈونر سے رابطہ کر لیا گیا",
    updateStatus: "اسٹیٹس محفوظ کریں", downloadReport: "میڈیکل رپورٹ ڈاؤن لوڈ",
    downloadWord: "مکمل درخواست کی Word فائل", donor: "ڈونر", age: "عمر",
    lastDonation: "آخری عطیہ", noLastDonation: "درج نہیں", donorPhone: "ڈونر سے رابطہ",
    loginError: "لاگ اِن نہیں ہو سکا۔ ای میل/پاس ورڈ چیک کریں، سرور چلنے کی تصدیق کریں اور دوبارہ کوشش کریں۔",
    loadError: "ڈیش بورڈ ڈیٹا لوڈ نہیں ہو سکا۔ نیٹ ورک چیک کرکے دوبارہ کوشش کریں۔",
    statusSaved: "درخواست کا اسٹیٹس اپ ڈیٹ ہوگیا۔", statusError: "اسٹیٹس محفوظ نہیں ہوا۔ دوبارہ کوشش کریں۔",
    sessionExpired: "آپ کا سیشن ختم ہوگیا۔ دوبارہ لاگ اِن کریں۔", loggedOut: "آپ لاگ آؤٹ ہو چکے ہیں۔",
    wordPending: "Word رپورٹ ڈاؤن لوڈ کرنے سے پہلے درخواست کو مکمل نشان زد کریں۔",
    dashboardTitleText: "رفاہ بلڈ ڈونیشن | منتظم", ageYears: "{age} سال",
    requestId: "ٹریکنگ آئی ڈی", logoutError: "لاگ آؤٹ مکمل نہیں ہو سکا۔ دوبارہ کوشش کریں۔"
  },
  en: {
    brand: "Rifah Blood Donation", languageLabel: "Language", backHome: "Back to home",
    adminLabel: "Admin portal", loginTitle: "Admin sign in",
    loginIntro: "Sign in to securely manage blood requests and donor registrations.",
    emailLabel: "Email", passwordLabel: "Password", loginButton: "Sign in securely",
    loginNotice: "Admin access is for authorized staff only. Passwords are stored as secure hashes.",
    dashboardLabel: "Admin dashboard", dashboardTitle: "Requests and donors", logout: "Sign out",
    newRequests: "New requests", totalRequests: "Total requests", registeredDonors: "Registered donors",
    completedRequests: "Fulfilled requests", inboxLabel: "Accepted requests", incomingRequests: "Dashboard requests",
    notifications: "New requests", notificationInfo: "Review new requests here and accept or cancel them.",
    acceptedInfo: "Only accepted requests are shown here.",
    noPending: "There are no new requests awaiting review.",
    noAccepted: "No accepted requests yet. Check the notification bell for new requests.",
    acceptRequest: "Accept", cancelRequest: "Cancel",
    donorLabel: "Donor directory",
    donorListTitle: "Registered blood donors", filterGroup: "Filter by blood group",
    allGroups: "All blood groups", noDonors: "No donors have registered yet.",
    addDonor: "Add a donor", addDonorButton: "Add donor", donorName: "Name",
    donorAdded: "Donor added successfully.", donorAddError: "Could not add the donor. Please try again.",
    adminSecurityNote: "Restrict patient and donor information to authorized staff. Never expose this local server to the internet without HTTPS.",
    footerSociety: "Rifah Welfare Society, Chak No. 116/WB",
    statusPending: "New — awaiting review", statusAccepted: "Accepted", statusMatched: "Donor matched",
    statusFulfilled: "Fulfilled", statusCancelled: "Cancelled",
    patient: "Patient", phone: "Contact number", bloodGroup: "Blood group", area: "Area",
    statusLabel: "Request status", condition: "Medical details", extraInfo: "Additional information",
    hospital: "Hospital", neededBy: "Blood needed by", submitted: "Received",
    adminNote: "Admin note", notePlaceholder: "e.g. Donor has been contacted",
    updateStatus: "Save status", downloadReport: "Download medical report",
    downloadWord: "Download completed request as Word", donor: "Donor", age: "Age",
    lastDonation: "Last donation", noLastDonation: "Not provided", donorPhone: "Contact donor",
    loginError: "Could not sign in. Check the email/password, make sure the server is running, and try again.",
    loadError: "Could not load dashboard data. Check your connection and try again.",
    statusSaved: "Request status updated.", statusError: "Could not save the status. Please try again.",
    sessionExpired: "Your session expired. Please sign in again.", loggedOut: "You have been signed out.",
    wordPending: "Mark this request fulfilled before downloading its Word report.",
    dashboardTitleText: "Rifah Blood Donation | Admin", ageYears: "{age} years",
    requestId: "Tracking ID", logoutError: "Could not sign out. Please try again."
  }
};

const languageKey = "rifahLanguage";
const loginSection = document.querySelector("#admin-login");
const dashboard = document.querySelector("#admin-dashboard");
const loginForm = document.querySelector("#login-form");
const loginMessage = document.querySelector("#login-message");
const dashboardMessage = document.querySelector("#dashboard-message");
const requestList = document.querySelector("#request-list");
const donorList = document.querySelector("#donor-list");
const donorFilter = document.querySelector("#donor-filter");
const notificationControl = document.querySelector(".notification-control");
const notificationTrigger = document.querySelector("#notification-trigger");
const notificationPanel = document.querySelector("#notification-panel");
const notificationList = document.querySelector("#notification-list");
const donorForm = document.querySelector("#admin-donor-form");
const donorMessage = document.querySelector("#admin-donor-message");
let language = localStorage.getItem(languageKey) === "en" ? "en" : "ur";
let csrfToken = null;
let requests = [];
let donors = [];
let isAuthenticated = false;
let refreshTimer = null;

function t(key, values = {}) {
  let value = ADMIN_TEXT[language][key] || ADMIN_TEXT.ur[key] || key;
  Object.entries(values).forEach(([name, replacement]) => {
    value = value.replaceAll(`{${name}}`, String(replacement));
  });
  return value;
}

function localize() {
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ur" ? "rtl" : "ltr";
  document.title = t("dashboardTitleText");
  document.querySelectorAll(".language-select").forEach((select) => { select.value = language; });
  document.querySelectorAll("[data-admin-text]").forEach((element) => {
    element.textContent = t(element.dataset.adminText);
  });
  if (donorFilter.options[0]) donorFilter.options[0].textContent = t("allGroups");
  notificationTrigger.setAttribute("aria-label", t("notifications"));
  renderRequests();
  renderNotifications();
  renderDonors();
}

document.querySelectorAll(".language-select").forEach((select) => {
  select.addEventListener("change", () => {
    language = select.value === "en" ? "en" : "ur";
    localStorage.setItem(languageKey, language);
    localize();
  });
});
localize();

function setMessage(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle("error", isError);
}

async function api(url, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (options.method && options.method !== "GET" && csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
  }
  const response = await fetch(url, { ...options, headers, credentials: "same-origin" });
  if (response.status === 401 && isAuthenticated) {
    isAuthenticated = false;
    csrfToken = null;
    showLogin();
    throw new Error(t("sessionExpired"));
  }
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await response.json() : null;
  if (!response.ok) throw new Error(body?.error || t("loadError"));
  return body;
}

function showLogin() {
  loginSection.hidden = false;
  dashboard.hidden = true;
  clearInterval(refreshTimer);
}

function showDashboard() {
  loginSection.hidden = true;
  dashboard.hidden = false;
  clearInterval(refreshTimer);
  refreshDashboard();
  refreshTimer = setInterval(refreshDashboard, 20_000);
}

function formatDate(value) {
  if (!value) return t("noLastDonation");
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return date.toLocaleString(language === "ur" ? "ur-PK" : "en-PK", { dateStyle: "medium", timeStyle: "short" });
}

const statusKeys = {
  pending: "statusPending",
  accepted: "statusAccepted",
  matched: "statusMatched",
  fulfilled: "statusFulfilled",
  cancelled: "statusCancelled"
};

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text != null) element.textContent = text;
  return element;
}

function statusPill(status) {
  const pill = makeElement("span", `status-pill status-${status}`, t(statusKeys[status] || "statusPending"));
  if (status === "accepted" || status === "matched" || status === "fulfilled") pill.classList.add("is-complete");
  if (status === "cancelled") pill.classList.add("is-cancelled");
  return pill;
}

function labelledValue(label, value) {
  const line = makeElement("p", "admin-detail");
  const strong = makeElement("strong", "", `${label}: `);
  line.append(strong, document.createTextNode(value || "—"));
  return line;
}

function renderRequests() {
  requestList.replaceChildren();
  const dashboardRequests = requests.filter((request) =>
    ["accepted", "matched", "fulfilled"].includes(request.status)
  );
  document.querySelector("#request-empty").hidden = dashboardRequests.length > 0;

  dashboardRequests.forEach((request) => {
    const card = makeElement("article", "admin-record-card");
    const heading = makeElement("div", "admin-record-heading");
    const title = makeElement("h3", "", request.patientName);
    const tracking = makeElement("span", "tracking-code", request.trackingId);
    const meta = makeElement("div", "admin-card-status");
    meta.append(statusPill(request.status), makeElement("span", "admin-record-date", `${t("submitted")}: ${formatDate(request.createdAt)}`));
    heading.append(title, tracking, meta);

    const detailGrid = makeElement("div", "admin-detail-grid");
    detailGrid.append(
      labelledValue(t("phone"), request.phone),
      labelledValue(t("bloodGroup"), request.bloodGroup),
      labelledValue(t("area"), request.city),
      labelledValue(t("hospital"), request.hospital),
      labelledValue(t("neededBy"), formatDate(request.neededBy))
    );
    if (request.hemoglobin) detailGrid.append(labelledValue("Hb", request.hemoglobin));
    if (request.condition) detailGrid.append(labelledValue(t("condition"), request.condition));
    if (request.extraInfo) detailGrid.append(labelledValue(t("extraInfo"), request.extraInfo));

    const actions = makeElement("div", "admin-record-actions");
    const statusLabel = makeElement("label", "admin-status-label", t("statusLabel"));
    const statusSelect = document.createElement("select");
    statusSelect.className = "admin-status-select";
    statusSelect.setAttribute("aria-label", t("statusLabel"));
    Object.entries(statusKeys).forEach(([value, key]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = t(key);
      statusSelect.append(option);
    });
    statusSelect.value = request.status;
    statusLabel.append(statusSelect);
    const note = document.createElement("input");
    note.className = "admin-note-input";
    note.type = "text";
    note.maxLength = 500;
    note.placeholder = t("notePlaceholder");
    note.value = request.adminNote || "";
    const update = makeElement("button", "button button-primary admin-save-status", t("updateStatus"));
    update.type = "button";
    update.disabled = request.status === "fulfilled";
    update.addEventListener("click", () => updateStatus(request, statusSelect.value, note.value, update));
    actions.append(statusLabel, note, update);

    if (request.hasReport) {
      const report = makeElement("a", "text-link", t("downloadReport"));
      report.href = `/api/admin/requests/${request.id}/report`;
      report.setAttribute("download", `report-${request.trackingId}`);
      actions.append(report);
    }
    if (request.status === "fulfilled") {
      const documentLink = makeElement("a", "button button-dark word-download", t("downloadWord"));
      documentLink.href = `/api/admin/requests/${request.id}/document`;
      documentLink.setAttribute("download", `rifah-request-${request.trackingId}.doc`);
      actions.append(documentLink);
    }

    card.append(heading, detailGrid);
    if (request.adminNote) card.append(labelledValue(t("adminNote"), request.adminNote));
    card.append(actions);
    requestList.append(card);
  });
}

function renderNotifications() {
  notificationList.replaceChildren();
  const pendingRequests = requests.filter((request) => request.status === "pending");
  const badge = document.querySelector("#new-badge");
  badge.textContent = String(pendingRequests.length);
  badge.hidden = pendingRequests.length === 0;
  document.querySelector("#notification-empty").hidden = pendingRequests.length > 0;
  notificationTrigger.setAttribute("aria-label", `${t("notifications")}: ${pendingRequests.length}`);

  pendingRequests.forEach((request) => {
    const card = makeElement("article", "admin-record-card notification-card");
    const heading = makeElement("div", "admin-record-heading");
    heading.append(
      makeElement("h3", "", request.patientName),
      makeElement("span", "tracking-code", request.trackingId),
      statusPill(request.status)
    );
    const details = makeElement("div", "admin-detail-grid");
    details.append(
      labelledValue(t("bloodGroup"), request.bloodGroup),
      labelledValue(t("area"), request.city),
      labelledValue(t("hospital"), request.hospital),
      labelledValue(t("phone"), request.phone),
      labelledValue(t("neededBy"), formatDate(request.neededBy))
    );
    const actions = makeElement("div", "admin-record-actions");
    const accept = makeElement("button", "button button-primary notification-action", t("acceptRequest"));
    accept.type = "button";
    accept.addEventListener("click", () => updateStatus(request, "accepted", request.adminNote || "", accept));
    const cancel = makeElement("button", "button button-dark notification-action", t("cancelRequest"));
    cancel.type = "button";
    cancel.addEventListener("click", () => updateStatus(request, "cancelled", request.adminNote || "", cancel));
    actions.append(accept, cancel);
    card.append(heading, details, actions);
    notificationList.append(card);
  });
}

function renderDonors() {
  donorList.replaceChildren();
  const selectedGroup = donorFilter.value;
  const visibleDonors = donors.filter((donor) => selectedGroup === "all" || donor.bloodGroup === selectedGroup);
  document.querySelector("#donor-empty").hidden = visibleDonors.length > 0;
  visibleDonors.forEach((donor) => {
    const card = makeElement("article", "admin-record-card donor-record-card");
    const heading = makeElement("div", "admin-record-heading");
    heading.append(makeElement("h3", "", donor.name), makeElement("span", "donor-blood-group", donor.bloodGroup));
    const details = makeElement("div", "admin-detail-grid");
    details.append(
      labelledValue(t("phone"), donor.phone),
      labelledValue(t("area"), donor.city),
      labelledValue(t("age"), t("ageYears", { age: donor.age })),
      labelledValue(t("lastDonation"), formatDate(donor.lastDonation))
    );
    const call = makeElement("a", "button button-primary donor-call", t("donorPhone"));
    call.href = `tel:${donor.phone.replace(/[^\d+]/g, "")}`;
    card.append(heading, details, call);
    donorList.append(card);
  });
}

async function refreshDashboard() {
  try {
    const [overview, requestData, donorData] = await Promise.all([
      api("/api/admin/overview"),
      api("/api/admin/requests"),
      api("/api/admin/donors")
    ]);
    requests = requestData.requests;
    donors = donorData.donors;
    document.querySelector("#admin-welcome").textContent = overview.email;
    document.querySelector("#stat-new").textContent = String(overview.new_requests);
    document.querySelector("#stat-requests").textContent = String(overview.total_requests);
    document.querySelector("#stat-donors").textContent = String(overview.total_donors);
    document.querySelector("#stat-fulfilled").textContent = String(overview.fulfilled_requests);
    renderRequests();
    renderNotifications();
    renderDonors();
  } catch (error) {
    if (isAuthenticated) {
      setMessage(dashboardMessage, error.message || t("loadError"), true);
    } else {
      setMessage(loginMessage, error.message || t("loadError"), true);
    }
  }
}

async function updateStatus(request, status, note, button) {
  button.disabled = true;
  try {
    await api(`/api/admin/requests/${request.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, note })
    });
    setMessage(dashboardMessage, t("statusSaved"));
    await refreshDashboard();
  } catch (error) {
    setMessage(dashboardMessage, error.message || t("statusError"), true);
    button.disabled = false;
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = loginForm.querySelector("button[type=submit]");
  button.disabled = true;
  setMessage(loginMessage, "");
  const form = new FormData(loginForm);
  try {
    const result = await api("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") })
    });
    csrfToken = result.csrfToken;
    isAuthenticated = true;
    loginForm.reset();
    loginForm.elements.namedItem("email").value = result.email;
    showDashboard();
  } catch (error) {
    setMessage(loginMessage, error.message || t("loginError"), true);
  } finally {
    button.disabled = false;
  }
});

document.querySelector("#logout-button").addEventListener("click", async () => {
  try {
    await api("/api/admin/logout", { method: "POST", body: "{}" });
    csrfToken = null;
    isAuthenticated = false;
    showLogin();
    setMessage(loginMessage, t("loggedOut"));
  } catch (error) {
    setMessage(dashboardMessage, error.message || t("logoutError"), true);
  }
});

donorFilter.addEventListener("change", renderDonors);

notificationTrigger.addEventListener("click", () => {
  notificationPanel.hidden = !notificationPanel.hidden;
  notificationTrigger.setAttribute("aria-expanded", String(!notificationPanel.hidden));
});
document.addEventListener("click", (event) => {
  if (!notificationPanel.hidden && !notificationControl.contains(event.target)) {
    notificationPanel.hidden = true;
    notificationTrigger.setAttribute("aria-expanded", "false");
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !notificationPanel.hidden) {
    notificationPanel.hidden = true;
    notificationTrigger.setAttribute("aria-expanded", "false");
    notificationTrigger.focus();
  }
});

donorForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = donorForm.querySelector('button[type="submit"]');
  button.disabled = true;
  setMessage(donorMessage, "");
  const values = new FormData(donorForm);
  try {
    await api("/api/admin/donors", {
      method: "POST",
      body: JSON.stringify({
        name: values.get("name"),
        phone: values.get("phone"),
        bloodGroup: values.get("bloodGroup"),
        city: values.get("city"),
        age: Number(values.get("age")),
        lastDonation: values.get("lastDonation")
      })
    });
    donorForm.reset();
    donorFilter.value = "all";
    setMessage(donorMessage, t("donorAdded"));
    await refreshDashboard();
  } catch (error) {
    setMessage(donorMessage, error.message || t("donorAddError"), true);
  } finally {
    button.disabled = false;
  }
});

async function checkSession() {
  try {
    const session = await api("/api/admin/session");
    if (session.authenticated) {
      csrfToken = session.csrfToken;
      isAuthenticated = true;
      loginForm.elements.namedItem("email").value = session.email;
      showDashboard();
    } else {
      showLogin();
    }
  } catch (error) {
    setMessage(loginMessage, error.message || t("loadError"), true);
    showLogin();
  }
}

checkSession();
