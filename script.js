let webhookUrl = "", displayName = "", avatarUrl = "";

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  // Login
  document.querySelector("#loginScreen button").addEventListener("click", login);

  // Chat Send Button
  document.querySelector("#chatScreen .chat-input button").addEventListener("click", sendMessage);

  // Embed Popup Buttons
  document.querySelector("#chatScreen .chat-header .open-embed").addEventListener("click", openEmbedPopup);
  document.querySelector("#embedPopup .send").addEventListener("click", sendEmbed);
  document.querySelector("#embedPopup .cancel").addEventListener("click", closeEmbedPopup);
  document.querySelector("#embedPopup .open-edit").addEventListener("click", openEmbedEditSection);
  document.querySelector("#embedPopup .edit-embed").addEventListener("click", editEmbedMessage);

  // Normal Message Edit Popup
  document.querySelector("#chatScreen .edit-message-btn").addEventListener("click", openEditPopup);
  document.querySelector("#editMessagePopup .send").addEventListener("click", editNormalMessage);
  document.querySelector("#editMessagePopup .cancel").addEventListener("click", closeEditPopup);
});

// --- LOGIN ---
function login() {
  const input = document.getElementById("webhookInput").value.trim();
  displayName = document.getElementById("nameInput").value.trim();
  avatarUrl = document.getElementById("avatarInput").value.trim();
  if (!input.startsWith("https://discord.com/api/webhooks/")) return alert("Invalid Webhook URL!");
  webhookUrl = input;
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("chatScreen").classList.remove("hidden");
}

// --- SEND MESSAGE (TEXT + IMAGE) ---
async function sendMessage() {
  const msg = document.getElementById("msgInput").value.trim();
  const file = document.getElementById("fileInput").files[0];
  if (!msg && !file) return;

  const formData = new FormData();
  formData.append("payload_json", JSON.stringify({
    content: msg || "",
    username: displayName || "Webhook User",
    avatar_url: avatarUrl || undefined
  }));
  if (file) formData.append("file", file, file.name);

  try {
    const res = await fetch(webhookUrl, { method: "POST", body: formData });
    if (!res.ok) throw new Error("Failed to send message");
    appendMessage((displayName || "You") + ": " + (msg || "[Image]"));
    document.getElementById("msgInput").value = "";
    document.getElementById("fileInput").value = "";
  } catch (err) {
    alert(err);
  }
}

// --- APPEND MESSAGE ---
function appendMessage(text) {
  const div = document.createElement("div");
  div.textContent = text;
  document.getElementById("messages").appendChild(div);
}

// --- NORMAL MESSAGE EDIT POPUP ---
function openEditPopup() {
  document.getElementById("editMessagePopup").style.display = "flex";
}
function closeEditPopup() {
  document.getElementById("editMessagePopup").style.display = "none";
}
async function editNormalMessage() {
  const msgId = document.getElementById("editMsgIdInput").value.trim();
  const newContent = document.getElementById("editMsgContent").value.trim();
  if (!msgId || !newContent) return alert("Message ID und Inhalt benötigt!");

  try {
    await fetch(`${webhookUrl}/messages/${msgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newContent })
    });
    alert("Message edited successfully!");
    closeEditPopup();
  } catch (err) {
    alert("Failed to edit message: " + err);
  }
}

// --- EMBED POPUP ---
function openEmbedPopup() {
  document.getElementById("embedPopup").style.display = "flex";
  updatePreview();
}
function closeEmbedPopup() {
  document.getElementById("embedPopup").style.display = "none";
}

// --- LIVE EMBED PREVIEW ---
function updatePreview() {
  const title = document.getElementById("embedTitle").value.trim();
  const desc = document.getElementById("embedDesc").value.trim();
  const color = document.getElementById("embedColor").value;
  const footer = document.getElementById("embedFooter").value.trim();

  const box = document.querySelector(".embed-box");
  box.style.borderLeftColor = color;

  document.getElementById("previewTitle").textContent = title;
  document.getElementById("previewDesc").textContent = desc;
  document.getElementById("previewFooter").textContent = footer;
}

// --- SEND EMBED ---
async function sendEmbed() {
  const title = document.getElementById("embedTitle").value.trim();
  const desc = document.getElementById("embedDesc").value.trim();
  const color = document.getElementById("embedColor").value.replace("#", "");
  const footer = document.getElementById("embedFooter").value.trim();

  if (!title && !desc) return alert("Embed must have a title or description!");

  const payload = {
    username: displayName || "Webhook User",
    avatar_url: avatarUrl || undefined,
    embeds: [{
      title: title || undefined,
      description: desc || undefined,
      color: parseInt(color,16),
      footer: footer ? { text: footer } : undefined
    }]
  };

  try {
    const res = await fetch(webhookUrl, { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error("Failed to send embed");
    alert("Embed sent successfully!");
    closeEmbedPopup();
  } catch(err) {
    alert(err);
  }
}

// --- EMBED EDIT SECTION ---
function openEmbedEditSection() {
  document.getElementById("embedEditSection").classList.remove("hidden");
}

async function editEmbedMessage() {
  const msgId = document.getElementById("embedEditMsgId").value.trim();
  const title = document.getElementById("embedTitle").value.trim();
  const desc = document.getElementById("embedDesc").value.trim();
  const color = document.getElementById("embedColor").value.replace("#", "");
  const footer = document.getElementById("embedFooter").value.trim();

  if (!msgId) return alert("Message ID benötigt!");

  const payload = {
    embeds: [{
      title: title || undefined,
      description: desc || undefined,
      color: parseInt(color,16),
      footer: footer ? { text: footer } : undefined
    }]
  };

  try {
    await fetch(`${webhookUrl}/messages/${msgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    alert("Embed edited successfully!");
  } catch(err) {
    alert("Failed to edit embed: " + err);
  }
}