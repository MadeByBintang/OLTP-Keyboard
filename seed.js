// seed.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DB_FILE = path.join(__dirname, "marketplace.db");
const db = new sqlite3.Database(DB_FILE);

db.serialize(() => {
  // Clear tables dulu biar tidak dobel
  db.run("DELETE FROM Users");
  db.run("DELETE FROM Products");
  db.run("DELETE FROM Orders");
  db.run("DELETE FROM OrderItems");
  db.run("DELETE FROM Payments");

  // Users (10)
  db.run(`INSERT INTO Users(user_id,name,email,password,address) VALUES
    (1,'Alice','alice@mail.com','123','Jakarta'),
    (2,'Bob','bob@mail.com','123','Bandung'),
    (3,'Charlie','charlie@mail.com','123','Surabaya'),
    (4,'Diana','diana@mail.com','123','Medan'),
    (5,'Evan','evan@mail.com','123','Bekasi'),
    (6,'Fiona','fiona@mail.com','123','Depok'),
    (7,'George','george@mail.com','123','Bogor'),
    (8,'Hannah','hannah@mail.com','123','Tangerang'),
    (9,'Ivan','ivan@mail.com','123','Bali'),
    (10,'Julia','julia@mail.com','123','Yogyakarta')
  `);

  // Products (10)
  db.run(`INSERT INTO Products(product_id,name,category,stock,price) VALUES
    (1,'Gateron Red','Switch',100,0.5),
    (2,'Gateron Blue','Switch',100,0.5),
    (3,'Holy Panda','Switch',50,1.2),
    (4,'Kailh Box White','Switch',80,0.6),
    (5,'Cherry MX Brown','Switch',70,0.8),
    (6,'PBT Keycaps','Keycaps',40,50),
    (7,'GMK Keycaps','Keycaps',20,150),
    (8,'Akko Keycaps','Keycaps',30,70),
    (9,'Aluminum Case','Case',15,120),
    (10,'Plastic Case','Case',25,40)
  `);

  // Orders (10)
  db.run(`INSERT INTO Orders(order_id,user_id,order_date,total_amount,status) VALUES
    (1,1,'2025-09-25',75,'completed'),
    (2,2,'2025-09-26',150,'completed'),
    (3,3,'2025-09-27',80,'completed'),
    (4,4,'2025-09-28',200,'pending'),
    (5,5,'2025-09-29',60,'completed'),
    (6,6,'2025-09-29',300,'completed'),
    (7,7,'2025-09-30',45,'completed'),
    (8,8,'2025-09-30',210,'completed'),
    (9,9,'2025-10-01',500,'pending'),
    (10,10,'2025-10-01',95,'completed')
  `);

  // OrderItems (15)
  db.run(`INSERT INTO OrderItems(order_item_id,order_id,product_id,quantity,subtotal) VALUES
    (1,1,1,50,25),
    (2,1,2,20,10),
    (3,2,3,1,1.2),
    (4,2,7,1,150),
    (5,3,4,30,18),
    (6,3,5,10,8),
    (7,4,6,2,100),
    (8,4,9,1,120),
    (9,5,10,1,40),
    (10,5,2,30,15),
    (11,6,3,20,24),
    (12,6,7,2,300),
    (13,7,1,10,5),
    (14,8,8,3,210),
    (15,10,6,1,50)
  `);

  // Payments (10)
  db.run(`INSERT INTO Payments(payment_id,order_id,payment_method,payment_date,amount,status) VALUES
    (1,1,'e-wallet','2025-09-25',35,'paid'),
    (2,2,'COD','2025-09-26',151.2,'paid'),
    (3,3,'bank transfer','2025-09-27',26,'paid'),
    (4,4,'e-wallet','2025-09-28',220,'unpaid'),
    (5,5,'COD','2025-09-29',55,'paid'),
    (6,6,'bank transfer','2025-09-29',324,'paid'),
    (7,7,'e-wallet','2025-09-30',50,'paid'),
    (8,8,'COD','2025-09-30',210,'paid'),
    (9,9,'bank transfer','2025-10-01',500,'unpaid'),
    (10,10,'e-wallet','2025-10-01',95,'paid')
  `);
});

db.close(() => console.log("Seed data inserted ✅ (50+ rows)"));
