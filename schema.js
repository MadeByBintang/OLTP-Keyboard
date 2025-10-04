// schema.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DB_FILE = path.join(__dirname, "marketplace.db");
const db = new sqlite3.Database(DB_FILE);

db.serialize(() => {
  // ===== OLTP Schema =====
  db.run(`CREATE TABLE IF NOT EXISTS Users(
    user_id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT,
    password TEXT,
    address TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Products(
    product_id INTEGER PRIMARY KEY,
    name TEXT,
    category TEXT,
    stock INTEGER,
    price REAL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Orders(
    order_id INTEGER PRIMARY KEY,
    user_id INTEGER,
    order_date TEXT,
    total_amount REAL,
    status TEXT,
    FOREIGN KEY(user_id) REFERENCES Users(user_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS OrderItems(
    order_item_id INTEGER PRIMARY KEY,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    subtotal REAL,
    FOREIGN KEY(order_id) REFERENCES Orders(order_id),
    FOREIGN KEY(product_id) REFERENCES Products(product_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Payments(
    payment_id INTEGER PRIMARY KEY,
    order_id INTEGER,
    payment_method TEXT,
    payment_date TEXT,
    amount REAL,
    status TEXT,
    FOREIGN KEY(order_id) REFERENCES Orders(order_id)
  )`);

  // ===== Data Warehouse Schema =====
  db.run(`CREATE TABLE IF NOT EXISTS DimCustomer(
    customer_id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT,
    address TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS DimProduct(
    product_id INTEGER PRIMARY KEY,
    name TEXT,
    category TEXT,
    price REAL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS DimDate(
    date_id INTEGER PRIMARY KEY,
    full_date TEXT,
    day INTEGER,
    month INTEGER,
    year INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS DimPayment(
    payment_id INTEGER PRIMARY KEY,
    method TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS FactSales(
    sales_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    customer_id INTEGER,
    product_id INTEGER,
    date_id INTEGER,
    payment_id INTEGER,
    quantity INTEGER,
    total_amount REAL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS FactInventory(
    inventory_id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    date_id INTEGER,
    stock_in INTEGER,
    stock_out INTEGER,
    current_stock INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS FactReturn(
    return_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    product_id INTEGER,
    date_id INTEGER,
    return_quantity INTEGER,
    return_amount REAL,
    reason_code TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS FactPaymentTransaction(
    transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    date_id INTEGER,
    payment_id INTEGER,
    amount_paid REAL,
    transaction_fee REAL
  )`);
});

db.close(() => console.log("Schema created ✅"));
