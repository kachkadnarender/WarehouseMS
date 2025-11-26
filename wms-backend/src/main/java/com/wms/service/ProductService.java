package com.wms.service;

import com.wms.dto.ProductDto;
import com.wms.entity.Product;
import com.wms.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepo;

    public ProductService(ProductRepository productRepo) {
        this.productRepo = productRepo;
    }

    // Entity -> DTO
    private ProductDto toDto(Product p) {
        return new ProductDto(
                p.getId(),
                p.getName(),
                p.getSku(),
                p.getStockQuantity(),
                p.getPrice()
        );
    }

    // DTO -> Entity (for CREATE)
    private Product fromDto(ProductDto dto) {
        Product p = new Product();
        p.setName(dto.getName());
        p.setSku(dto.getSku());
        p.setStockQuantity(dto.getStockQuantity());

        // ⬇️ important: never leave price null
        Double price = dto.getPrice();
        if (price == null) {
            price = 0.0;
        }
        p.setPrice(price);

        return p;
    }

    public List<ProductDto> getAll() {
        return productRepo.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ProductDto create(ProductDto dto) {
        if (productRepo.existsBySku(dto.getSku())) {
            throw new RuntimeException("SKU already exists");
        }
        Product saved = productRepo.save(fromDto(dto));
        return toDto(saved);
    }

    public ProductDto update(Long id, ProductDto dto) {
        Product existing = productRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!existing.getSku().equals(dto.getSku())
                && productRepo.existsBySku(dto.getSku())) {
            throw new RuntimeException("SKU already exists");
        }

        existing.setName(dto.getName());
        existing.setSku(dto.getSku());
        existing.setStockQuantity(dto.getStockQuantity());

        Double price = dto.getPrice();
        if (price == null) {
            price = 0.0;
        }
        existing.setPrice(price);

        return toDto(productRepo.save(existing));
    }

    public void delete(Long id) {
        if (!productRepo.existsById(id)) {
            throw new RuntimeException("Product not found");
        }
        productRepo.deleteById(id);
    }
}
