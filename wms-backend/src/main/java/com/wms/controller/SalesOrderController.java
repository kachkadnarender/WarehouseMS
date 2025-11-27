package com.wms.controller;

import com.wms.dto.SalesOrderDto;
import com.wms.service.SalesOrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales-orders")
@CrossOrigin(origins = "http://localhost:5173")
public class SalesOrderController {

    private final SalesOrderService soService;

    public SalesOrderController(SalesOrderService soService) {
        this.soService = soService;
    }

    @GetMapping
    public ResponseEntity<List<SalesOrderDto>> getAll() {
        return ResponseEntity.ok(soService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(soService.getById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody SalesOrderDto dto) {
        try {
            SalesOrderDto created = soService.create(dto);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<?> confirm(@PathVariable Long id) {
        try {
            SalesOrderDto updated = soService.confirm(id);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
