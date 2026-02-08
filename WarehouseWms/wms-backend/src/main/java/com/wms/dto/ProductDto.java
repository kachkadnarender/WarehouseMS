package com.wms.dto;

import java.time.LocalDate;

public class ProductDto {

    private Long id;
    private String name;
    private String sku;
    private int stockQuantity;
    private Double price;
    private String locationCode;
    private boolean perishable;
    private LocalDate expiryDate;

    public ProductDto() {
    }

    public ProductDto(Long id,
                      String name,
                      String sku,
                      int stockQuantity,
                      Double price,
                      String locationCode,
                      boolean perishable,
                      LocalDate expiryDate) {
        this.id = id;
        this.name = name;
        this.sku = sku;
        this.stockQuantity = stockQuantity;
        this.price = price;
        this.locationCode = locationCode;
        this.perishable = perishable;
        this.expiryDate = expiryDate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public int getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(int stockQuantity) { this.stockQuantity = stockQuantity; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getLocationCode() { return locationCode; }
    public void setLocationCode(String locationCode) { this.locationCode = locationCode; }

    public boolean isPerishable() { return perishable; }
    public void setPerishable(boolean perishable) { this.perishable = perishable; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
}
