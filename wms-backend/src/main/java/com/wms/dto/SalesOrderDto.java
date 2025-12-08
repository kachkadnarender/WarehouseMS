package com.wms.dto;

import com.wms.entity.SalesOrderStatus;

import java.time.LocalDateTime;
import java.util.List;

public class SalesOrderDto {

    private Long id;
    private String soNumber;
    private String customerName;
    private String customerEmail;   // 👈 NEW
    private SalesOrderStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime confirmedAt;
    private List<SalesOrderItemDto> items;

    public SalesOrderDto() {
    }

    public SalesOrderDto(Long id,
                         String soNumber,
                         String customerName,
                         String customerEmail,
                         SalesOrderStatus status,
                         LocalDateTime createdAt,
                         LocalDateTime confirmedAt,
                         List<SalesOrderItemDto> items) {
        this.id = id;
        this.soNumber = soNumber;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.status = status;
        this.createdAt = createdAt;
        this.confirmedAt = confirmedAt;
        this.items = items;
    }

    public Long getId() {
        return id;
    }

    public String getSoNumber() {
        return soNumber;
    }

    public void setSoNumber(String soNumber) {
        this.soNumber = soNumber;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public SalesOrderStatus getStatus() {
        return status;
    }

    public void setStatus(SalesOrderStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getConfirmedAt() {
        return confirmedAt;
    }

    public void setConfirmedAt(LocalDateTime confirmedAt) {
        this.confirmedAt = confirmedAt;
    }

    public List<SalesOrderItemDto> getItems() {
        return items;
    }

    public void setItems(List<SalesOrderItemDto> items) {
        this.items = items;
    }
}
