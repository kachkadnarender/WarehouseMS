package com.wms.repository;

import com.wms.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySku(String sku);

    // Perishable products expiring between two dates
    List<Product> findByPerishableTrueAndExpiryDateBetween(LocalDate start, LocalDate end);
}
