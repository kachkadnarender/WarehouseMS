package com.wms.service;

import com.wms.dto.SalesOrderDto;
import com.wms.dto.SalesOrderItemDto;
import com.wms.entity.*;
import com.wms.repository.ProductRepository;
import com.wms.repository.SalesOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SalesOrderService {

    private final SalesOrderRepository soRepo;
    private final ProductRepository productRepo;
    private final StockMovementService stockMovementService;
    private final EmailService emailService;

    public SalesOrderService(SalesOrderRepository soRepo,
                             ProductRepository productRepo,
                             StockMovementService stockMovementService,
                             EmailService emailService) {
        this.soRepo = soRepo;
        this.productRepo = productRepo;
        this.stockMovementService = stockMovementService;
        this.emailService = emailService;
    }

    // Simple SO number generator: SO-2025-0001, etc.
    private String generateSoNumber() {
        long count = soRepo.count() + 1;
        int year = LocalDate.now().getYear();
        return "SO-" + year + "-" + String.format("%04d", count);
    }

    private SalesOrderDto toDto(SalesOrder so) {
        List<SalesOrderItemDto> items = so.getItems().stream()
                .map(item -> new SalesOrderItemDto(
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getUnitPrice()
                ))
                .collect(Collectors.toList());

        return new SalesOrderDto(
                so.getId(),
                so.getSoNumber(),
                so.getCustomerName(),
                so.getCustomerEmail(),
                so.getStatus(),
                so.getCreatedAt(),
                so.getConfirmedAt(),
                items
        );
    }

    @Transactional
    public SalesOrderDto create(SalesOrderDto dto) {
        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new RuntimeException("Sales order must have at least one item.");
        }

        SalesOrder so = new SalesOrder();
        so.setSoNumber(generateSoNumber());
        so.setCustomerName(dto.getCustomerName());
        so.setCustomerEmail(dto.getCustomerEmail());
        so.setStatus(SalesOrderStatus.NEW);
        so.setCreatedAt(LocalDateTime.now());

        List<SalesOrderItem> items = dto.getItems().stream().map(itemDto -> {
            Product product = productRepo.findById(itemDto.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemDto.getProductId()));

            SalesOrderItem item = new SalesOrderItem();
            item.setSalesOrder(so);
            item.setProduct(product);
            item.setQuantity(itemDto.getQuantity());
            item.setUnitPrice(itemDto.getUnitPrice());
            return item;
        }).collect(Collectors.toList());

        so.setItems(items);

        SalesOrder saved = soRepo.save(so);
        return toDto(saved);
    }

    public List<SalesOrderDto> getAll() {
        return soRepo.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public SalesOrderDto getById(Long id) {
        SalesOrder so = soRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Sales order not found"));
        return toDto(so);
    }

    @Transactional
    public SalesOrderDto confirm(Long id) {
        SalesOrder so = soRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Sales order not found"));

        if (so.getStatus() == SalesOrderStatus.CONFIRMED
                || so.getStatus() == SalesOrderStatus.SHIPPED
                || so.getStatus() == SalesOrderStatus.COMPLETED
                || so.getStatus() == SalesOrderStatus.CANCELLED) {
            throw new RuntimeException("Sales order already processed/cancelled.");
        }

        if (so.getItems() == null || so.getItems().isEmpty()) {
            throw new RuntimeException("Sales order has no items.");
        }

        // For each item, adjust stock OUT
        for (SalesOrderItem item : so.getItems()) {
            stockMovementService.adjustStock(
                    item.getProduct().getId(),
                    StockMovementType.OUT,
                    item.getQuantity(),
                    "SO " + so.getSoNumber()
            );
        }

        so.setStatus(SalesOrderStatus.CONFIRMED);
        so.setConfirmedAt(LocalDateTime.now());

        SalesOrder saved = soRepo.save(so);

        // 🔔 send confirmation email
        emailService.sendSalesOrderConfirmed(saved);

        return toDto(saved);
    }

    @Transactional
    public SalesOrderDto markOutOfStock(Long id) {
        SalesOrder so = soRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Sales order not found"));

        // Just mark as cancelled, no stock changes
        so.setStatus(SalesOrderStatus.CANCELLED);
        so.setConfirmedAt(null);

        SalesOrder saved = soRepo.save(so);

        // 🔔 send cancellation email
        emailService.sendSalesOrderConfirmed(so);

        return toDto(so);
    }
}
