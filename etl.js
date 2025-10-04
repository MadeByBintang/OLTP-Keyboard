const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// ===== Database Connection =====
const DB_FILE = path.join(__dirname, "marketplace.db");
const db = new sqlite3.Database(DB_FILE);

// ===== Utils =====
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function dateToId(dateStr) {
  const d = new Date(dateStr);
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

// ===== Extract =====
async function getCustomers() {
  return await all(`SELECT * FROM Users`);
}

async function getProducts() {
  return await all(`SELECT * FROM Products`);
}

async function getOrders() {
  return await all(`SELECT * FROM Orders`);
}

async function getOrderItems() {
  return await all(`SELECT * FROM OrderItems`);
}

async function getPayments() {
  return await all(`SELECT * FROM Payments`);
}

// ===== Transform =====
function extractDates(orders, payments) {
  return [
    ...new Set([
      ...orders.map((o) => o.order_date),
      ...payments.map((p) => p.payment_date),
    ]),
  ];
}

// ===== Load =====
async function loadDimCustomer(customers) {
  for (const c of customers) {
    await run(
      `INSERT OR IGNORE INTO DimCustomer(customer_id,name,email,address) VALUES (?,?,?,?)`,
      [c.user_id, c.name, c.email, c.address]
    );
  }
}

async function loadDimProduct(products) {
  for (const p of products) {
    await run(
      `INSERT OR IGNORE INTO DimProduct(product_id,name,category,price) VALUES (?,?,?,?)`,
      [p.product_id, p.name, p.category, p.price]
    );
  }
}

async function loadDimDate(orders, payments) {
  const dates = extractDates(orders, payments);
  for (const d of dates) {
    const id = dateToId(d);
    const dateObj = new Date(d);
    await run(
      `INSERT OR IGNORE INTO DimDate(date_id,full_date,day,month,year) VALUES (?,?,?,?,?)`,
      [id, d, dateObj.getDate(), dateObj.getMonth() + 1, dateObj.getFullYear()]
    );
  }
}

async function loadDimPayment(payments) {
  for (const p of payments) {
    await run(
      `INSERT OR IGNORE INTO DimPayment(payment_id,method) VALUES (?,?)`,
      [p.payment_id, p.payment_method]
    );
  }
}

async function loadFactSales(orders, orderItems, payments) {
  for (const oi of orderItems) {
    const order = orders.find((o) => o.order_id === oi.order_id);
    const payment = payments.find((p) => p.order_id === order.order_id);

    await run(
      `INSERT INTO FactSales(order_id,customer_id,product_id,date_id,payment_id,quantity,total_amount)
       VALUES (?,?,?,?,?,?,?)`,
      [
        order.order_id,
        order.user_id,
        oi.product_id,
        dateToId(order.order_date),
        payment ? payment.payment_id : null,
        oi.quantity,
        oi.subtotal,
      ]
    );
  }
}

async function loadFactPaymentTransaction(orders, payments) {
  for (const pay of payments) {
    const order = orders.find((o) => o.order_id === pay.order_id);

    let fee =
      pay.payment_method === "e-wallet"
        ? pay.amount * 0.015
        : pay.payment_method === "COD"
        ? pay.amount * 0.02
        : 0;

    await run(
      `INSERT INTO FactPaymentTransaction(customer_id,date_id,payment_id,amount_paid,transaction_fee)
       VALUES (?,?,?,?,?)`,
      [
        order.user_id,
        dateToId(pay.payment_date),
        pay.payment_id,
        pay.amount,
        fee,
      ]
    );
  }
}

// ===== MAIN ETL =====
async function etl() {
  console.log("=== Start ETL Process ===");

  try {
    const customers = await getCustomers();
    const products = await getProducts();
    const orders = await getOrders();
    const orderItems = await getOrderItems();
    const payments = await getPayments();

    console.log("✅ Data Extracted");

    await loadDimCustomer(customers);
    await loadDimProduct(products);
    await loadDimDate(orders, payments);
    await loadDimPayment(payments);
    await loadFactSales(orders, orderItems, payments);
    await loadFactPaymentTransaction(orders, payments);

    console.log("✅ ETL Completed");
  } catch (err) {
    console.error("❌ ETL Error:", err);
  } finally {
    db.close();
  }
}

etl();
