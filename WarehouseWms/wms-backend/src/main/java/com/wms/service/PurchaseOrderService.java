package com.wms.service;

import com.wms.dto.PurchaseOrderDto;
import com.wms.dto.PurchaseOrderItemDto;
import com.wms.entity.*;
import com.wms.repository.ProductRepository;
import com.wms.repository.PurchaseOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class PurchaseOrderService {

    private final PurchaseOrderRepository poRepo;
    private final ProductRepository productRepo;
    private final StockMovementService stockMovementService;
    private final EmailService emailService;


    public PurchaseOrderService(PurchaseOrderRepository poRepo,
                                ProductRepository productRepo,
                                StockMovementService stockMovementService,
                                EmailService emailService) {
        this.poRepo = poRepo;
        this.productRepo = productRepo;
        this.stockMovementService = stockMovementService;
        this.emailService = emailService;
    }

    // Simple PO number generator: PO-2025-0001, etc.
    private String generatePoNumber() {
        long count = poRepo.count() + 1; // e.g. if you have 2 rows, next is 3
        int year = java.time.LocalDate.now().getYear();
        return "PO-" + year + "-" + String.format("%04d", count);
    }

    private PurchaseOrderDto toDto(PurchaseOrder po) {
        List<PurchaseOrderItemDto> items = po.getItems().stream()
                .map(item -> new PurchaseOrderItemDto(
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getUnitPrice()
                ))
                .collect(Collectors.toList());

        return new PurchaseOrderDto(
                po.getId(),
                po.getPoNumber(),
                po.getVendorName(),
                po.getVendorEmail(),          // 👈 NEW
                po.getStatus(),
                po.getExpectedDate(),
                po.getCreatedAt(),
                po.getReceivedAt(),
                items
        );
    }

    @Transactional
    public PurchaseOrderDto createPo(PurchaseOrderDto dto) {
        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new RuntimeException("Purchase order must have at least one item.");
        }

        PurchaseOrder po = new PurchaseOrder();
        po.setPoNumber(generatePoNumber());
        po.setVendorName(dto.getVendorName());
        po.setVendorEmail(dto.getVendorEmail());   // 👈 NEW
        po.setExpectedDate(dto.getExpectedDate());
        po.setStatus(PurchaseOrderStatus.DRAFT);
        po.setCreatedAt(LocalDateTime.now());

        // map items
        List<PurchaseOrderItem> items = dto.getItems().stream().map(itemDto -> {
            Product product = productRepo.findById(itemDto.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemDto.getProductId()));

            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setPurchaseOrder(po);
            item.setProduct(product);
            item.setQuantity(itemDto.getQuantity());
            item.setUnitPrice(itemDto.getUnitPrice());
            return item;
        }).collect(Collectors.toList());

        po.setItems(items);

        PurchaseOrder saved = poRepo.save(po);

        // 📧 Email actual vendor
        emailService.sendPurchaseOrderCreated(saved);

        return toDto(saved);
    }

    public List<PurchaseOrderDto> getAll() {
        return poRepo.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public PurchaseOrderDto getById(Long id) {
        PurchaseOrder po = poRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase order not found"));
        return toDto(po);
    }

    @Transactional
    public PurchaseOrderDto markAsReceived(Long id) {
        PurchaseOrder po = poRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase order not found"));

        if (po.getStatus() == PurchaseOrderStatus.RECEIVED) {
            throw new RuntimeException("Purchase order is already received.");
        }
        if (po.getItems() == null || po.getItems().isEmpty()) {
            throw new RuntimeException("Purchase order has no items.");
        }

        // For each item, adjust stock IN
        for (PurchaseOrderItem item : po.getItems()) {
            stockMovementService.adjustStock(
                    item.getProduct().getId(),
                    StockMovementType.IN,
                    item.getQuantity(),
                    "PO " + po.getPoNumber()
            );
        }

        po.setStatus(PurchaseOrderStatus.RECEIVED);
        po.setReceivedAt(LocalDateTime.now());

        return toDto(po);
    }
}
