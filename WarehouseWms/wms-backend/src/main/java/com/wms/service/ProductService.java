package com.wms.service;

import com.wms.dto.ProductDto;
import com.wms.entity.Product;
import com.wms.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepo;

    public ProductService(ProductRepository productRepo) {
        this.productRepo = productRepo;
    }

    // ---- Mapping helpers ----

    private ProductDto toDto(Product p) {
        return new ProductDto(
                p.getId(),
                p.getName(),
                p.getSku(),
                p.getStockQuantity(),
                p.getPrice(),
                p.getLocationCode(),
                p.isPerishable(),
                p.getExpiryDate()
        );
    }

    private void updateEntityFromDto(Product p, ProductDto dto) {
        p.setName(dto.getName());
        p.setSku(dto.getSku());
        p.setStockQuantity(dto.getStockQuantity());
        p.setPrice(dto.getPrice());
        p.setLocationCode(dto.getLocationCode());
        p.setPerishable(dto.isPerishable());
        p.setExpiryDate(dto.getExpiryDate());
    }

    // ---- CRUD ----

    @Transactional(readOnly = true)
    public List<ProductDto> getAll() {
        return productRepo.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductDto getById(Long id) {
        Product p = productRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        return toDto(p);
    }

    public ProductDto create(ProductDto dto) {
        Product p = new Product();
        updateEntityFromDto(p, dto);
        Product saved = productRepo.save(p);
        return toDto(saved);
    }

    public ProductDto update(Long id, ProductDto dto) {
        Product existing = productRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));

        updateEntityFromDto(existing, dto);
        Product saved = productRepo.save(existing);
        return toDto(saved);
    }

    public void delete(Long id) {
        if (!productRepo.existsById(id)) {
            throw new RuntimeException("Product not found: " + id);
        }
        productRepo.deleteById(id);
    }

    // ---- Near-expiry products ----

    @Transactional(readOnly = true)
    public List<ProductDto> getNearExpiry(int days) {
        if (days <= 0) {
            days = 7;
        }
        LocalDate today = LocalDate.now();
        LocalDate limit = today.plusDays(days);

        return productRepo
                .findByPerishableTrueAndExpiryDateBetween(today, limit)
                .stream()
                .map(this::toDto)
                .toList();
    }
}
