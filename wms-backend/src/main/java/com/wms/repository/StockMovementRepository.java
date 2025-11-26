package com.wms.repository;

import com.wms.entity.StockMovement;
import com.wms.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    List<StockMovement> findByProductOrderByCreatedAtDesc(Product product);
}
