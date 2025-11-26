package com.wms.service;

import com.wms.dto.StockMovementDto;
import com.wms.entity.Product;
import com.wms.entity.StockMovement;
import com.wms.entity.StockMovementType;
import com.wms.repository.ProductRepository;
import com.wms.repository.StockMovementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StockMovementService {

    private final StockMovementRepository stockMovementRepo;
    private final ProductRepository productRepo;

    public StockMovementService(StockMovementRepository stockMovementRepo,
                                ProductRepository productRepo) {
        this.stockMovementRepo = stockMovementRepo;
        this.productRepo = productRepo;
    }

    private StockMovementDto toDto(StockMovement m) {
        return new StockMovementDto(
                m.getId(),
                m.getProduct().getId(),
                m.getProduct().getName(),
                m.getType(),
                m.getQuantity(),
                m.getReason(),
                m.getCreatedAt()
        );
    }

    @Transactional
    public StockMovementDto adjustStock(Long productId, StockMovementType type, int quantity, String reason) {
        if (quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than zero");
        }

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        int currentStock = product.getStockQuantity();
        int newStock = currentStock;

        if (type == StockMovementType.IN) {
            newStock = currentStock + quantity;
        } else if (type == StockMovementType.OUT) {
            newStock = currentStock - quantity;
            if (newStock < 0) {
                throw new RuntimeException("Insufficient stock for this operation");
            }
        }

        product.setStockQuantity(newStock);

        StockMovement movement = new StockMovement();
        movement.setProduct(product);
        movement.setType(type);
        movement.setQuantity(quantity);
        movement.setReason(reason);
        movement.setCreatedAt(LocalDateTime.now());

        stockMovementRepo.save(movement);
        // product is automatically saved due to transaction + managed entity

        return toDto(movement);
    }

    public List<StockMovementDto> getAllMovements() {
        return stockMovementRepo.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<StockMovementDto> getMovementsForProduct(Long productId) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return stockMovementRepo.findByProductOrderByCreatedAtDesc(product)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
