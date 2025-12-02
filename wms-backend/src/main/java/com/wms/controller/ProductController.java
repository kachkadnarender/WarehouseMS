package com.wms.controller;

import com.wms.dto.ProductDto;
import com.wms.service.ProductService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // GET all products
    @GetMapping
    public List<ProductDto> getAll() {
        return productService.getAll();
    }

    // GET single product
    @GetMapping("/{id}")
    public ProductDto getById(@PathVariable Long id) {
        return productService.getById(id);
    }

    // CREATE
    @PostMapping
    public ProductDto create(@RequestBody ProductDto dto) {
        return productService.create(dto);
    }

    // UPDATE
    @PutMapping("/{id}")
    public ProductDto update(@PathVariable Long id, @RequestBody ProductDto dto) {
        dto.setId(id);
        return productService.update(id, dto);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        productService.delete(id);
    }

    // NEAR-EXPIRY
    @GetMapping("/near-expiry")
    public List<ProductDto> getNearExpiry(@RequestParam(defaultValue = "7") int days) {
        return productService.getNearExpiry(days);
    }
}
