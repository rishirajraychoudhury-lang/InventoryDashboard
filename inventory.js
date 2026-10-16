"use strict";

// 1. DATA & INPUT INITIALIZATION
// The initial inventory is an array of objects.
const inventory = [
  { id: 1, name: "Laptop", price: 800, category: "Electronics" },
  { id: 2, name: "Mouse", price: 25, category: "Accessories" }
];
let nextId = 3;

const $ = (selector) => document.querySelector(selector);
const currency = (value) => "$" + Number(value).toLocaleString("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

// 2. CONTROL FLOW & CONDITIONAL EVALUATION
// Dynamic price tiers using if...else.
const getPriceCategory = (price) => {
  if (price < 50) return "Budget";
  else if (price < 200) return "Standard";
  else return "Premium";
};

// switch statement for product-type labels.
function getProductType(category) {
  switch (category) {
    case "Electronics": return "Electronic item";
    case "Accessories": return "Accessory";
    case "Office": return "Office item";
    default: return "General item";
  }
}

function showNotice(message, type = "success") {
  const notice = $("#notice");
  notice.textContent = message;
  notice.className = "notice " + type;
  if (type === "success") {
    // Keep the feedback visible until the next action.
  }
}

// 3. LOOPS & FLOW CONTROL
function renderInventory() {
  const searchTerm = $("#searchInput").value.trim().toLowerCase();
  const selectedTier = $("#categoryFilter").value;

  // filter() isolates products matching the user's search and selected tier.
  const visibleItems = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm);
    const matchesTier = selectedTier === "all" ||
      getPriceCategory(item.price) === selectedTier;
    return matchesSearch && matchesTier;
  });

  const body = $("#inventoryBody");
  body.innerHTML = "";

  // for...of loop demonstrates continue and break flow control.
  for (const item of visibleItems) {
    if (!item.name || !Number.isFinite(item.price) || item.price < 0) continue;
    if (item.price > 100000000) {
      showNotice("A product exceeds the display limit.", "error");
      break;
    }

    const row = document.createElement("tr");
    const tier = getPriceCategory(item.price);
    const tierClass = tier.toLowerCase();
    row.innerHTML = `
      <td><div class="product-name">${escapeHTML(item.name)}</div>
          <div class="product-sub">${escapeHTML(getProductType(item.category))}</div></td>
      <td><span class="badge category">${escapeHTML(item.category)}</span></td>
      <td><strong>${currency(item.price)}</strong></td>
      <td><span class="badge ${tierClass}">${tier}</span></td>
      <td><button class="delete-btn" data-delete-id="${item.id}" aria-label="Delete ${escapeHTML(item.name)}">Delete</button></td>
    `;
    body.appendChild(row);
  }

  $("#emptyState").hidden = visibleItems.length !== 0;
  renderAnalytics();
  renderReport();
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

// 4. FUNCTIONS, SCOPE & FINANCIAL ANALYTICS
// Regular function calculates total inventory value.
function calculateTotal(items) {
  let total = 0;
  items.forEach((item) => { total += item.price; });
  return total;
}

// Arrow function calculates discount first, then tax on the discounted amount.
const calculateFinalPrice = (price, taxPercent, discountPercent) => {
  const discount = price * (discountPercent / 100);
  const discountedPrice = price - discount;
  const tax = discountedPrice * (taxPercent / 100);
  return { discount, tax, final: discountedPrice + tax };
};

function renderAnalytics() {
  const total = calculateTotal(inventory);
  const average = inventory.length ? total / inventory.length : 0;
  const affordableItems = inventory.filter((item) => item.price < 200);

  $("#totalValue").textContent = currency(total);
  $("#productCount").textContent = inventory.length;
  $("#averagePrice").textContent = currency(average);
  $("#affordableCount").textContent = affordableItems.length;
}

// Console output for assignment demonstration and debugging.
function logInventorySummary(action = "Current inventory") {
  const total = calculateTotal(inventory);
  const average = inventory.length ? total / inventory.length : 0;
  const affordableItems = inventory.filter((item) => item.price < 200);

  console.group(`Inventory Dashboard — ${action}`);
  console.log("Products:", inventory.length);
  console.log("Total inventory value:", currency(total));
  console.log("Average product price:", currency(average));
  console.log("Affordable items (below $200):", affordableItems.map((item) => item.name));
  console.table(inventory.map((item) => ({
    ID: item.id,
    Product: item.name,
    Category: item.category,
    Price: currency(item.price),
    Tier: getPriceCategory(item.price)
  })));
  console.groupEnd();
}

function updateCalculator() {
  const price = Number($("#calcPrice").value);
  const discount = Number($("#discountRate").value);
  const tax = Number($("#taxRate").value);

  const valid = [price, discount, tax].every(Number.isFinite) &&
    price >= 0 && discount >= 0 && discount <= 100 && tax >= 0 && tax <= 100;

  if (!valid) {
    $("#discountAmount").textContent = "—";
    $("#taxAmount").textContent = "—";
    $("#finalPrice").textContent = "Check inputs";
    return;
  }

  const result = calculateFinalPrice(price, tax, discount);
  $("#discountAmount").textContent = currency(result.discount);
  $("#taxAmount").textContent = currency(result.tax);
  $("#finalPrice").textContent = currency(result.final);
}

// 5. ARRAY METHODS & ITERATION
function renderReport() {
  const report = $("#reportList");
  report.innerHTML = "";

  // map() transforms inventory objects into formatted report strings.
  const formattedReport = inventory.map((item) =>
    `${item.name.toUpperCase()}: ${currency(item.price)}`
  );

  // forEach() displays each formatted report line.
  formattedReport.forEach((line) => {
    const item = document.createElement("div");
    item.className = "report-item";
    const [name, price] = line.split(": ");
    item.innerHTML = `<span>${escapeHTML(name)}</span><strong>${escapeHTML(price)}</strong>`;
    report.appendChild(item);
  });
}

// Add product through the dashboard form.
$("#productForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = $("#productName").value.trim();
  const priceText = $("#productPrice").value.trim();
  const price = Number(priceText);
  const category = $("#productCategory").value;

  if (!name || !priceText || !Number.isFinite(price) || price < 0) {
    showNotice("Enter a product name and a valid non-negative price.", "error");
    return;
  }

  inventory.push({ id: nextId++, name, price, category });
  $("#productForm").reset();
  $("#searchInput").value = "";
  $("#categoryFilter").value = "all";
  renderInventory();
  showNotice(`${name} was added to the inventory.`);
  logInventorySummary(`Added ${name}`);
});

// Assignment requirement: prompt() input is available through Quick Add.
$("#quickAddBtn").addEventListener("click", () => {
  const nameInput = prompt("Enter the new product name:");
  if (nameInput === null) return;

  const name = nameInput.trim();
  if (!name) {
    showNotice("Product name cannot be empty.", "error");
    return;
  }

  const priceInput = prompt("Enter the product price:");
  if (priceInput === null) return;

  const priceText = priceInput.trim();
  const price = Number(priceText);
  if (!priceText || !Number.isFinite(price) || price < 0) {
    showNotice("Enter a valid non-negative price.", "error");
    return;
  }

  inventory.push({ id: nextId++, name, price, category: "General" });
  renderInventory();
  showNotice(`${name} was added using Quick Add.`);
  logInventorySummary(`Quick-added ${name}`);
});

$("#inventoryBody").addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-id]");
  if (!button) return;
  const id = Number(button.dataset.deleteId);
  const index = inventory.findIndex((item) => item.id === id);
  if (index === -1) return;
  const removed = inventory.splice(index, 1)[0];
  renderInventory();
  showNotice(`${removed.name} was removed from the inventory.`);
  logInventorySummary(`Removed ${removed.name}`);
});

$("#searchInput").addEventListener("input", renderInventory);
$("#categoryFilter").addEventListener("change", renderInventory);
["calcPrice", "discountRate", "taxRate"].forEach((id) => {
  $("#" + id).addEventListener("input", updateCalculator);
});

$("#focusAddBtn").addEventListener("click", () => {
  $("#productName").focus();
  $("#addPanel").scrollIntoView({ behavior: "smooth", block: "center" });
});

// Initial render and initial console summary.
renderInventory();
updateCalculator();
logInventorySummary("Initial inventory loaded");
