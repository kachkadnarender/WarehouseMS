package com.wms.dto;

public class ProductDto {
    private Long id;
    private String name;
    private String sku;
    private int stockQuantity;
    private Double price;   // <--- IMPORTANT

    public ProductDto() {}

    public ProductDto(Long id, String name, String sku, int stockQuantity, Double price) {
        this.id = id;
        this.name = name;
        this.sku = sku;
        this.stockQuantity = stockQuantity;
        this.price = price;
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
}
