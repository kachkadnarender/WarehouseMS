package com.wms.controller;

import com.wms.dto.StockMovementDto;
import com.wms.entity.StockMovementType;
import com.wms.service.StockMovementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-movements")
@CrossOrigin(origins = "http://localhost:5173")
public class StockMovementController {

    private final StockMovementService stockMovementService;

    public StockMovementController(StockMovementService stockMovementService) {
        this.stockMovementService = stockMovementService;
    }

    // GET: all movements (for audit log)
    @GetMapping
    public ResponseEntity<List<StockMovementDto>> getAll() {
        return ResponseEntity.ok(stockMovementService.getAllMovements());
    }

    // GET: movements for a specific product
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<StockMovementDto>> getForProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(stockMovementService.getMovementsForProduct(productId));
    }

    // POST IN: increase stock
    @PostMapping("/in")
    public ResponseEntity<?> stockIn(@RequestParam Long productId,
                                     @RequestParam int quantity,
                                     @RequestParam(required = false) String reason) {
        try {
            StockMovementDto dto = stockMovementService.adjustStock(productId, StockMovementType.IN, quantity, reason);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // POST OUT: decrease stock
    @PostMapping("/out")
    public ResponseEntity<?> stockOut(@RequestParam Long productId,
                                      @RequestParam int quantity,
                                      @RequestParam(required = false) String reason) {
        try {
            StockMovementDto dto = stockMovementService.adjustStock(productId, StockMovementType.OUT, quantity, reason);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
