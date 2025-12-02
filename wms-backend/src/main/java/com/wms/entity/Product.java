package com.wms.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Product name
    @Column(nullable = false)
    private String name;

    // Unique SKU
    @Column(nullable = false, unique = true)
    private String sku;

    // Current stock quantity
    @Column(nullable = false)
    private int stockQuantity;

    // Unit price (USD)
    @Column(nullable = false)
    private Double price;

    // Warehouse location code (e.g. "RACK-A1-SHELF-2")
    @Column(length = 100)
    private String locationCode;

    // Is this product perishable?
    @Column(nullable = false)
    private boolean perishable = false;

    // Expiry date (optional, only if perishable = true)
    private LocalDate expiryDate;

    // --- SETTERS ---
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setSku(String sku) { this.sku = sku; }
    public void setStockQuantity(int stockQuantity) { this.stockQuantity = stockQuantity; }
    public void setPrice(Double price) { this.price = price; }
    public void setLocationCode(String locationCode) { this.locationCode = locationCode; }
    public void setPerishable(boolean perishable) { this.perishable = perishable; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    // --- GETTERS ---
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getSku() { return sku; }
    public int getStockQuantity() { return stockQuantity; }
    public Double getPrice() { return price; }
    public String getLocationCode() { return locationCode; }
    public boolean isPerishable() { return perishable; }
    public LocalDate getExpiryDate() { return expiryDate; }
}
