package com.wms.dto;

import com.wms.entity.PurchaseOrderStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class PurchaseOrderDto {

    private Long id;
    private String poNumber;
    private String vendorName;
    private PurchaseOrderStatus status;
    private LocalDate expectedDate;
    private LocalDateTime createdAt;
    private LocalDateTime receivedAt;
    private List<PurchaseOrderItemDto> items;

    public PurchaseOrderDto() {}

    public PurchaseOrderDto(Long id, String poNumber, String vendorName,
                            PurchaseOrderStatus status, LocalDate expectedDate,
                            LocalDateTime createdAt, LocalDateTime receivedAt,
                            List<PurchaseOrderItemDto> items) {
        this.id = id;
        this.poNumber = poNumber;
        this.vendorName = vendorName;
        this.status = status;
        this.expectedDate = expectedDate;
        this.createdAt = createdAt;
        this.receivedAt = receivedAt;
        this.items = items;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPoNumber() { return poNumber; }
    public void setPoNumber(String poNumber) { this.poNumber = poNumber; }

    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }

    public PurchaseOrderStatus getStatus() { return status; }
    public void setStatus(PurchaseOrderStatus status) { this.status = status; }

    public LocalDate getExpectedDate() { return expectedDate; }
    public void setExpectedDate(LocalDate expectedDate) { this.expectedDate = expectedDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getReceivedAt() { return receivedAt; }
    public void setReceivedAt(LocalDateTime receivedAt) { this.receivedAt = receivedAt; }

    public List<PurchaseOrderItemDto> getItems() { return items; }
    public void setItems(List<PurchaseOrderItemDto> items) { this.items = items; }
}
