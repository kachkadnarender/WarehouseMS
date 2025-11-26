package com.wms.dto;

import com.wms.entity.StockMovementType;

import java.time.LocalDateTime;

public class StockMovementDto {

    private Long id;
    private Long productId;
    private String productName;
    private StockMovementType type;
    private int quantity;
    private String reason;
    private LocalDateTime createdAt;

    public StockMovementDto() {}

    public StockMovementDto(Long id, Long productId, String productName,
                            StockMovementType type, int quantity,
                            String reason, LocalDateTime createdAt) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.type = type;
        this.quantity = quantity;
        this.reason = reason;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public StockMovementType getType() { return type; }
    public void setType(StockMovementType type) { this.type = type; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
