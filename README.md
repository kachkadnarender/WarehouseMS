# 🏬 Warehouse Management System (WMS)

A full-stack **Warehouse Management System** built using **Spring Boot, PostgreSQL, React, JWT Security, and Email Notifications**.  
This project manages products, inventory, purchase orders, sales orders, stock movements, picking slips, and automated email alerts.

---

## ✅ Technologies Used

### Backend
- Java 17  
- Spring Boot (Maven)
- Spring Security with JWT
- Spring Data JPA & Hibernate
- PostgreSQL Database
- Java Mail Sender (SMTP – Gmail)
- PDF Generation (Picking Slip)

### Frontend
- React.js (Vite)
- Axios
- React Router DOM
- Tailwind CSS

### Tools
- Git & GitHub
- Postman
- PostgreSQL UI (pgAdmin / Postico / TablePlus)

---

## ✅ Key Features

- ✅ User Login & Role Management (ADMIN / CUSTOMER)
- ✅ Product & SKU Management
- ✅ Inventory Tracking Dashboard
- ✅ Manual Stock In / Stock Out
- ✅ Purchase Order (PO) Management
- ✅ Sales Order (SO) Management
- ✅ Stock Movement History
- ✅ Picking Slip PDF Generation
- ✅ Warehouse Location Mapping
- ✅ Product Expiry Tracking
- ✅ Email Notifications:
  - User Registration
  - Sales Order Confirmation
  - Purchase Order Created

---

## ✅ Backend Setup Instructions

### 1️⃣ Create PostgreSQL Database
```sql
CREATE DATABASE wms_db;
