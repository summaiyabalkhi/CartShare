const STORAGE_KEY = "cartshare_rooms_v1";
const SESSION_KEY = "cartshare_session_v1";
const DELIVERY_TARGET = 5000;

const accessPanel = document.getElementById("accessPanel");
const appPanel = document.getElementById("appPanel");
const loginForm = document.getElementById("loginForm");
const roomActions = document.getElementById("roomActions");
const accessMessage = document.getElementById("accessMessage");
let currentUser = "";
let currentRoom = "";
let rooms = loadRooms();

function loadRooms() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch (error) { return {}; }
}
function saveRooms() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
}
function makeRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}
function ensureRoom(code) {
  if (!rooms[code]) rooms[code] = { items: [], activity: [], members: [] };
  return rooms[code];
}
function logActivity(message, icon = "📝") {
  const room = ensureRoom(currentRoom);
  room.activity.unshift({ message, icon, user: currentUser, time: new Date().toISOString() });
  room.activity = room.activity.slice(0, 40);
}
function enterRoom(code) {
  code = code.trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code) || !rooms[code]) {
    accessMessage.textContent = "Room not found. Check the code or create a new room.";
    return;
  }
  currentRoom = code;
  const room = ensureRoom(code);
  if (!room.members.some(member => member.name === currentUser)) {
    room.members.push({ name: currentUser, joinedAt: new Date().toISOString() });
    logActivity(`${currentUser} joined the room`, "👋");
  } else {
    logActivity(`${currentUser} opened the room`, "👋");
  }
  saveRooms();
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ name: currentUser, room: currentRoom }));
  showApp();
}
function showApp() {
  accessPanel.classList.add("d-none");
  appPanel.classList.remove("d-none");
  document.getElementById("welcomeName").textContent = currentUser;
  document.getElementById("roomCodeDisplay").textContent = currentRoom;
  render();
}
function render() {
  rooms = loadRooms();
  const room = ensureRoom(currentRoom);
  const total = room.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = room.items.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("cartTotal").textContent = money(total);
  document.getElementById("itemCount").textContent = count;
  document.getElementById("thresholdAmount").textContent = money(DELIVERY_TARGET);
  const progress = Math.min(100, total / DELIVERY_TARGET * 100);
  document.getElementById("thresholdProgress").style.width = `${progress}%`;
  document.getElementById("thresholdMessage").textContent =
    total >= DELIVERY_TARGET ? "🎉 Free delivery target reached!" : `${money(DELIVERY_TARGET - total)} more to reach the target`;

  const cartList = document.getElementById("cartList");
  if (!room.items.length) {
    cartList.innerHTML = '<div class="empty-state"><div class="empty-icon">🧺</div><h3 class="h6 fw-bold">Your cart is empty</h3><p class="small text-secondary mb-0">Add the first item to get started.</p></div>';
  } else {
    cartList.innerHTML = room.items.map(item => `
      <div class="cart-row">
        <div class="item-symbol">🛒</div>
        <div class="item-info">
          <div class="item-name">${escapeHTML(item.name)}</div>
          <div class="item-meta">${money(item.price)} × ${item.quantity} · Added by ${escapeHTML(item.addedBy)}</div>
        </div>
        <div class="text-end">
          <div class="item-total">${money(item.price * item.quantity)}</div>
          <button class="remove-btn btn-sm mt-1" data-remove="${item.id}" aria-label="Remove ${escapeHTML(item.name)}">Remove</button>
        </div>
      </div>`).join("");
  }
  document.getElementById("activityCount").textContent = room.activity.length;
  const activityList = document.getElementById("activityList");
  activityList.innerHTML = room.activity.length ? room.activity.map(entry => `
    <div class="activity-entry">
      <div class="activity-icon">${entry.icon}</div>
      <div><div class="activity-text"><strong>${escapeHTML(entry.user)}</strong> ${escapeHTML(entry.message)}</div>
      <div class="activity-time">${formatTime(entry.time)}</div></div>
    </div>`).join("") : '<p class="small text-secondary mb-0">No activity yet.</p>';
  document.getElementById("memberList").innerHTML = room.members.map(member => `
    <span class="member-chip"><span class="member-avatar">${escapeHTML(member.name.charAt(0).toUpperCase())}</span>${escapeHTML(member.name)}</span>`).join("");
}
function money(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value || 0);
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}
function formatTime(value) {
  return new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

loginForm.addEventListener("submit", event => {
  event.preventDefault();
  currentUser = document.getElementById("userName").value.trim();
  if (!currentUser) return;
  roomActions.classList.remove("d-none");
  accessMessage.textContent = "";
  loginForm.classList.add("d-none");
});
document.getElementById("createRoomBtn").addEventListener("click", () => {
  let code = makeRoomCode();
  while (rooms[code]) code = makeRoomCode();
  rooms[code] = { items: [], activity: [], members: [] };
  currentRoom = code;
  rooms[code].members.push({ name: currentUser, joinedAt: new Date().toISOString() });
  logActivity(`${currentUser} created the room`, "✨");
  saveRooms();
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ name: currentUser, room: currentRoom }));
  showApp();
});
document.getElementById("joinRoomForm").addEventListener("submit", event => {
  event.preventDefault();
  enterRoom(document.getElementById("roomCodeInput").value);
});
document.getElementById("addItemForm").addEventListener("submit", event => {
  event.preventDefault();
  const name = document.getElementById("itemName").value.trim();
  const price = Number(document.getElementById("itemPrice").value);
  const quantity = Number(document.getElementById("itemQuantity").value);
  if (!name || !Number.isFinite(price) || price <= 0 || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) return;
  rooms = loadRooms();
  const room = ensureRoom(currentRoom);
  room.items.push({ id: `${Date.now()}_${Math.random().toString(16).slice(2)}`, name, price, quantity, addedBy: currentUser });
  logActivity(`added ${quantity} × ${name} to the cart`, "➕");
  saveRooms();
  event.target.reset();
  document.getElementById("itemQuantity").value = 1;
  render();
});
document.getElementById("cartList").addEventListener("click", event => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;
  rooms = loadRooms();
  const room = ensureRoom(currentRoom);
  const item = room.items.find(entry => entry.id === button.dataset.remove);
  if (!item) return;
  room.items = room.items.filter(entry => entry.id !== button.dataset.remove);
  logActivity(`removed ${item.name} from the cart`, "➖");
  saveRooms();
  render();
});
document.getElementById("clearCartBtn").addEventListener("click", () => {
  rooms = loadRooms();
  const room = ensureRoom(currentRoom);
  if (!room.items.length) return;
  if (!confirm("Are you sure you want to clear the entire cart?")) return;
  room.items = [];
  logActivity("cleared the shopping cart", "🧹");
  saveRooms();
  render();
});
document.getElementById("copyCodeBtn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(currentRoom);
    document.getElementById("copyCodeBtn").textContent = "Copied!";
    setTimeout(() => document.getElementById("copyCodeBtn").textContent = "Copy", 1400);
  } catch (error) {
    alert(`Room code: ${currentRoom}`);
  }
});
document.getElementById("printReceiptBtn").addEventListener("click", () => {
  rooms = loadRooms();
  const room = ensureRoom(currentRoom);
  const total = room.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const receipt = document.createElement("section");
  receipt.id = "printReceipt";
  receipt.innerHTML = `
    <h1>CartShare – Group Shopping Receipt</h1>
    <p><strong>Room code:</strong> ${escapeHTML(currentRoom)}<br>
    <strong>Prepared by:</strong> ${escapeHTML(currentUser)}<br>
    <strong>Date:</strong> ${new Date().toLocaleString("en-IN")}</p>
    <table><thead><tr><th>Item</th><th>Qty</th><th>Unit price</th><th>Added by</th><th>Amount</th></tr></thead>
    <tbody>${room.items.map(item => `<tr><td>${escapeHTML(item.name)}</td><td>${item.quantity}</td><td>${money(item.price)}</td><td>${escapeHTML(item.addedBy)}</td><td>${money(item.price * item.quantity)}</td></tr>`).join("")}</tbody></table>
    <div class="receipt-total">Grand total: ${money(total)}</div>
    <p>Members: ${room.members.map(member => escapeHTML(member.name)).join(", ") || "—"}</p>
    <p>Generated by CartShare. Keep this receipt for your group expense records.</p>`;
  const old = document.getElementById("printReceipt");
  if (old) old.remove();
  document.body.appendChild(receipt);
  window.print();
  receipt.remove();
});
document.getElementById("leaveRoomBtn").addEventListener("click", () => {
  sessionStorage.removeItem(SESSION_KEY);
  currentRoom = "";
  currentUser = "";
  appPanel.classList.add("d-none");
  accessPanel.classList.remove("d-none");
  loginForm.classList.remove("d-none");
  roomActions.classList.add("d-none");
  loginForm.reset();
  document.getElementById("joinRoomForm").reset();
});
window.addEventListener("storage", event => {
  if (event.key === STORAGE_KEY && currentRoom) render();
});

// Restore this tab's previous room after refresh.
try {
  const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY));
  if (saved && saved.name && saved.room) {
    rooms = loadRooms();
    if (rooms[saved.room]) {
      currentUser = saved.name;
      currentRoom = saved.room;
      showApp();
    }
  }
} catch (error) {
  sessionStorage.removeItem(SESSION_KEY);
}
