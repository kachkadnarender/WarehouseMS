package com.wms.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_movements")
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Which product is affected
    @ManyToOne(optional = false)
    @JoinColumn(name = "product_id")
    private Product product;

    // IN or OUT
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StockMovementType type;

    // How many units moved
    @Column(nullable = false)
    private int quantity;

    // Optional: why did this change happen?
    private String reason;

    // When did it happen?
    @Column(nullable = false)
    private LocalDateTime createdAt;

    // --- GETTERS & SETTERS ---

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public Product getProduct() { return product; }

    public void setProduct(Product product) { this.product = product; }

    public StockMovementType getType() { return type; }

    public void setType(StockMovementType type) { this.type = type; }

    public int getQuantity() { return quantity; }

    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getReason() { return reason; }

    public void setReason(String reason) { this.reason = reason; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
