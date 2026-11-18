// BloomCraft - Unit 4: JavaScript variables, arrays, objects, functions and DOM manipulation
"use strict";

// Product data is stored in an array of objects.
const flowers = [
  { id: "roses", name: "Red Roses", price: 80, quantity: 0 },
  { id: "lilies", name: "White Lilies", price: 120, quantity: 0 },
  { id: "carnations", name: "Pink Carnations", price: 60, quantity: 0 },
  { id: "sunflowers", name: "Yellow Sunflowers", price: 90, quantity: 0 }
];

const wrappingOptions = {
  kraft: { name: "Kraft Paper Rustic", price: 40 },
  black: { name: "Luxury Matte Black", price: 70 },
  vase: { name: "Glass Vase", price: 150 },
  basket: { name: "Woven Basket", price: 110 }
};

let selectedWrapping = "kraft";
let orders = [];
let toastTimeout;

const getElement = (id) => document.getElementById(id);
const formatCurrency = (amount) => `₹${amount.toLocaleString("en-IN")}`;

function showToast(message) {
  const toast = getElement("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2800);
}

function getFlowerTotal() {
  return flowers.reduce((sum, flower) => sum + flower.price * flower.quantity, 0);
}

function getStemCount() {
  return flowers.reduce((sum, flower) => sum + flower.quantity, 0);
}

function getGrandTotal() {
  return getFlowerTotal() + wrappingOptions[selectedWrapping].price;
}

function updateSummary() {
  const summaryItems = getElement("summaryItems");
  const selectedFlowers = flowers.filter((flower) => flower.quantity > 0);
  summaryItems.innerHTML = "";

  if (selectedFlowers.length === 0) {
    summaryItems.innerHTML = '<p class="empty-summary">Add flowers to see your selection.</p>';
  } else {
    selectedFlowers.forEach((flower) => {
      const item = document.createElement("div");
      item.className = "summary-item";
      item.innerHTML = `<span>${flower.name} × ${flower.quantity}</span><strong>${formatCurrency(flower.price * flower.quantity)}</strong>`;
      summaryItems.appendChild(item);
    });
  }

  const stemCount = getStemCount();
  getElement("summaryStemCount").textContent = stemCount
    ? `${stemCount} stem${stemCount === 1 ? "" : "s"} selected`
    : "Your bouquet is waiting";

  getElement("summaryWrapping").textContent =
    `${wrappingOptions[selectedWrapping].name} · ${formatCurrency(wrappingOptions[selectedWrapping].price)}`;

  const occasion = getElement("occasion").value;
  getElement("summaryCard").textContent = occasion || "Not added";
  getElement("totalPrice").textContent = formatCurrency(getGrandTotal());
}

function updateQuantities() {
  flowers.forEach((flower) => {
    getElement(`qty-${flower.id}`).textContent = flower.quantity;
  });
  updateSummary();
}

// Event delegation: one listener handles all plus/minus buttons.
getElement("flowerGrid").addEventListener("click", (event) => {
  const button = event.target.closest(".qty-btn");
  if (!button) return;

  const card = button.closest(".flower-card");
  const flower = flowers.find((item) => item.id === card.dataset.flower);
  if (!flower) return;

  if (button.dataset.action === "plus" && flower.quantity < 30) {
    flower.quantity += 1;
  } else if (button.dataset.action === "minus" && flower.quantity > 0) {
    flower.quantity -= 1;
  }
  updateQuantities();
});

getElement("wrapOptions").addEventListener("change", (event) => {
  if (event.target.name !== "wrapping") return;
  selectedWrapping = event.target.value;
  document.querySelectorAll(".wrap-option").forEach((option) => {
    option.classList.toggle("selected", option.contains(event.target));
  });
  updateSummary();
});

getElement("occasion").addEventListener("change", updateSummary);
getElement("greetingMessage").addEventListener("input", (event) => {
  const message = event.target.value;
  getElement("charCount").textContent = message.length;
  getElement("previewMessage").textContent = message.trim() || "Your lovely message will appear here.";
});

getElement("continueButton").addEventListener("click", () => {
  if (getStemCount() === 0) {
    showToast("Please add at least one flower to your bouquet.");
    getElement("flowerGrid").scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  getElement("delivery").scrollIntoView({ behavior: "smooth" });
  getElement("customerName").focus({ preventScroll: true });
});

// Set the minimum delivery date to today.
const today = new Date();
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0];
getElement("deliveryDate").min = localToday;

function createOrderId() {
  // A readable demo ID generated using the current timestamp and a random number.
  return `BC${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
}

function renderOrders(list = orders) {
  const tableBody = getElement("ordersTable");
  tableBody.innerHTML = "";

  if (list.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" class="empty-table">No matching orders found.</td></tr>';
    return;
  }

  list.forEach((order) => {
    const row = document.createElement("tr");
    const nextStatus = {
      Received: "Preparing",
      Preparing: "Ready",
      Ready: "Delivered",
      Delivered: "Received"
    };
    row.innerHTML = `
      <td><strong>${order.id}</strong></td>
      <td>${escapeHTML(order.customer)}</td>
      <td>${order.date}</td>
      <td>${formatCurrency(order.total)}</td>
      <td><span class="status-pill">${order.status}</span></td>
      <td><button class="status-action" type="button" data-order-id="${order.id}">Set ${nextStatus[order.status]}</button></td>
    `;
    tableBody.appendChild(row);
  });
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

getElement("deliveryForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const errorBox = getElement("formError");
  errorBox.textContent = "";

  if (getStemCount() === 0) {
    errorBox.textContent = "Please select at least one flower before placing your request.";
    return;
  }

  if (!form.checkValidity()) {
    form.reportValidity();
    errorBox.textContent = "Please check the highlighted fields and enter valid details.";
    return;
  }

  const order = {
    id: createOrderId(),
    customer: getElement("customerName").value.trim(),
    phone: getElement("customerPhone").value.trim(),
    address: getElement("deliveryAddress").value.trim(),
    date: getElement("deliveryDate").value,
    pincode: getElement("pincode").value.trim(),
    total: getGrandTotal(),
    status: "Received",
    flowers: flowers.filter((flower) => flower.quantity > 0).map((flower) => ({
      name: flower.name, quantity: flower.quantity, price: flower.price
    })),
    wrapping: wrappingOptions[selectedWrapping].name,
    occasion: getElement("occasion").value,
    message: getElement("greetingMessage").value.trim()
  };

  orders.unshift(order);
  renderOrders();
  form.reset();
  flowers.forEach((flower) => { flower.quantity = 0; });
  selectedWrapping = "kraft";
  document.querySelector('input[name="wrapping"][value="kraft"]').checked = true;
  document.querySelectorAll(".wrap-option").forEach((option, index) => option.classList.toggle("selected", index === 0));
  getElement("greetingMessage").value = "";
  getElement("charCount").textContent = "0";
  getElement("previewMessage").textContent = "Your lovely message will appear here.";
  updateQuantities();
  errorBox.textContent = "";
  showToast(`Request placed! Your order ID is ${order.id}`);
  getElement("orders").scrollIntoView({ behavior: "smooth" });
});

getElement("ordersTable").addEventListener("click", (event) => {
  const button = event.target.closest(".status-action");
  if (!button) return;
  const order = orders.find((item) => item.id === button.dataset.orderId);
  if (!order) return;

  const progression = ["Received", "Preparing", "Ready", "Delivered"];
  order.status = progression[(progression.indexOf(order.status) + 1) % progression.length];
  filterOrders();
  showToast(`${order.id} status updated to ${order.status}.`);
});

function filterOrders() {
  const searchText = getElement("orderSearch").value.trim().toLowerCase();
  const status = getElement("statusFilter").value;
  const filtered = orders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchText) ||
      order.customer.toLowerCase().includes(searchText);
    const matchesStatus = status === "all" || order.status === status;
    return matchesSearch && matchesStatus;
  });
  renderOrders(filtered);
}

getElement("orderSearch").addEventListener("input", filterOrders);
getElement("statusFilter").addEventListener("change", filterOrders);
getElement("showAllOrders").addEventListener("click", () => {
  getElement("orderSearch").value = "";
  getElement("statusFilter").value = "all";
  renderOrders();
});

getElement("feedbackForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const name = getElement("feedbackName").value.trim();
  const rating = Number(getElement("rating").value);
  getElement("feedbackMessage").textContent = `Thank you, ${name}! Your ${rating}-star feedback has been recorded for this demo.`;
  form.reset();
});

// Mobile navigation
getElement("menuToggle").addEventListener("click", () => {
  const nav = getElement("mainNav");
  const isOpen = nav.classList.toggle("open");
  getElement("menuToggle").setAttribute("aria-expanded", String(isOpen));
});
document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    getElement("mainNav").classList.remove("open");
    getElement("menuToggle").setAttribute("aria-expanded", "false");
  });
});

// Initial render
updateQuantities();
renderOrders();
