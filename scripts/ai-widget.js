// ai widget

const widget = document.getElementById("aiWidget");
const toggleBtn = document.getElementById("aiToggleBtn");
const closeBtn = document.getElementById("aiCloseBtn");
const messagesEl = document.getElementById("aiMessages");
const inputEl = document.getElementById("aiInput");
const sendBtn = document.getElementById("aiSendBtn");

function openChat() {
  widget.classList.add("open");
  inputEl.focus();
}
function closeChat() {
  widget.classList.remove("open");
}
toggleBtn.addEventListener("click", () =>
  widget.classList.contains("open") ? closeChat() : openChat(),
);
closeBtn.addEventListener("click", closeChat);

function addMessage(text, who = "bot") {
  const div = document.createElement("div");
  div.className = `ai-message ${who}`;
  div.innerHTML = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ===== اینجا هوش مصنوعی واقعی رو وصل میکنی =====
async function askAI(question) {
  // TODO: اینو بعدا به API خودت وصل کن:
  // const res = await fetch('/api/ai', {method:'POST', body:JSON.stringify({question})});
  // const data = await res.json(); return data.answer;

  // فعلا دمو:
  await new Promise((r) => setTimeout(r, 1000));
  return `جواب هوش مصنوعی برای: "${question}" - اینجا بعدا به API واقعی وصل میشه.`;
}

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;
  addMessage(text, "user");
  inputEl.value = "";
  const typing = document.createElement("div");
  typing.textContent = "...";
  messagesEl.appendChild(typing);
  const answer = await askAI(text);
  typing.remove();
  addMessage(answer, "bot");
}
sendBtn.addEventListener("click", sendMessage);
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("ai-suggestion")) {
    inputEl.value = e.target.textContent;
    sendMessage();
  }
});
