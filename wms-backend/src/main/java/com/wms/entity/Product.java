// src/main/java/com/wms/entity/Product.java
package com.wms.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String sku;
    private int stockQuantity;

    // --- SETTERS ---
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setSku(String sku) { this.sku = sku; }
    public void setStockQuantity(int stockQuantity) { this.stockQuantity = stockQuantity; }

    // --- GETTERS ---
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getSku() { return sku; }
    public int getStockQuantity() { return stockQuantity; }
}