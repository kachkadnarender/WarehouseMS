package com.wms.controller;

import com.wms.dto.SalesOrderDto;
import com.wms.service.PickingSlipService;
import com.wms.service.SalesOrderService;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales-orders")
@CrossOrigin(origins = "http://localhost:5173")
public class SalesOrderController {

    private final SalesOrderService soService;
    private final PickingSlipService pickingSlipService;

    public SalesOrderController(SalesOrderService soService,
                                PickingSlipService pickingSlipService) {
        this.soService = soService;
        this.pickingSlipService = pickingSlipService;
    }

    @GetMapping
    public List<SalesOrderDto> getAll() {
        return soService.getAll();
    }

    @GetMapping("/{id}")
    public SalesOrderDto getById(@PathVariable Long id) {
        return soService.getById(id);
    }

    @PostMapping
    public SalesOrderDto create(@RequestBody SalesOrderDto dto) {
        return soService.create(dto);
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<?> confirm(@PathVariable Long id) {
        try {
            SalesOrderDto updated = soService.confirm(id);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException ex) {
            ex.printStackTrace(); // helpful in console
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/{id}/out-of-stock")
    public ResponseEntity<?> markOutOfStock(@PathVariable Long id) {
        try {
            SalesOrderDto updated = soService.markOutOfStock(id);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException ex) {
            ex.printStackTrace();
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }




    @GetMapping("/{id}/picking-slip")
    public ResponseEntity<byte[]> downloadPickingSlip(@PathVariable Long id) {
        byte[] pdfBytes = pickingSlipService.generatePickingSlipPdf(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);

        ContentDisposition disposition = ContentDisposition
                .attachment()
                .filename("picking-slip-" + id + ".pdf")
                .build();
        headers.setContentDisposition(disposition);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
