# WarehouseMS - Warehouse Management System

A full-stack Warehouse Management System (WMS) for efficient inventory control, order processing, and smart analytics. Built to handle everything from basic stock tracking to unique features like AI-driven predictions and expiry alerts.

## Tech Stack
- **Frontend**: React.js, HTML, CSS, JavaScript (with Material-UI for UI, Recharts for dashboards)
- **Backend**: Java, Spring Boot (REST APIs, JPA for ORM)
- **Database**: PostgreSQL (structured data for products, orders, transactions)

## Key Features
1. **User Login & Role Management** – Secure auth with Admin and Customer roles.
2. **Product & SKU Management** – CRUD operations for products with unique SKUs.
3. **Inventory Tracking Dashboard** – Real-time views of stock levels and status.
4. **Manual Stock In/Out Management** – Adjust quantities with full audit history.
5. **Purchase Order (PO) Management** – Create, track, and receive POs with inventory updates.
6. **Sales Order (SO) Management** – Handle customer orders and auto-deduct stock.
7. **Warehouse Location Mapping** – Assign products to physical locations (aisle, rack, shelf).
8. **Picking Slip (PDF Generation)** – Auto-generate printable pick lists for orders.
9. **Smart Stock Prediction (Unique)** – Analyze historical data for proactive reorder alerts.
10. **Product Expiry / Shelf-Life Tracker (Unique)** – Monitor perishables, send expiry alerts, and support FEFO picking.

## Local Development Setup
### Prerequisites
- Java 17+ (OpenJDK recommended)
- Node.js 18+ (LTS)
- PostgreSQL 14+ (local install or Docker)
- Git, Maven, npm/yarn

### Quick Start
1. **Clone the Repo**: