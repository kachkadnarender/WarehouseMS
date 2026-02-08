package com.wms.service;

import com.wms.entity.SalesOrder;
import com.wms.entity.SalesOrderItem;
import com.wms.entity.Product;
import com.wms.repository.SalesOrderRepository;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;

@Service
public class PickingSlipService {

    private final SalesOrderRepository soRepo;

    public PickingSlipService(SalesOrderRepository soRepo) {
        this.soRepo = soRepo;
    }

    public byte[] generatePickingSlipPdf(Long salesOrderId) {
        SalesOrder so = soRepo.findById(salesOrderId)
                .orElseThrow(() -> new RuntimeException("Sales order not found: " + salesOrderId));

        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            PDPageContentStream content = new PDPageContentStream(document, page);
            float margin = 50;
            float y = page.getMediaBox().getHeight() - margin;

            // Title
            content.setFont(PDType1Font.HELVETICA_BOLD, 16);
            content.beginText();
            content.newLineAtOffset(margin, y);
            content.showText("Picking Slip");
            content.endText();

            y -= 25;

            // Basic SO details
            content.setFont(PDType1Font.HELVETICA, 11);
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

            content.beginText();
            content.newLineAtOffset(margin, y);
            content.showText("SO Number: " + so.getSoNumber());
            content.endText();

            y -= 15;

            content.beginText();
            content.newLineAtOffset(margin, y);
            content.showText("Customer: " + so.getCustomerName());
            content.endText();

            y -= 15;

            String createdAtStr = so.getCreatedAt() != null ? so.getCreatedAt().format(fmt) : "-";
            content.beginText();
            content.newLineAtOffset(margin, y);
            content.showText("Created At: " + createdAtStr);
            content.endText();

            y -= 25;

            // Table header
            content.setFont(PDType1Font.HELVETICA_BOLD, 10);
            content.beginText();
            content.newLineAtOffset(margin, y);
            content.showText("Product");
            content.endText();

            content.beginText();
            content.newLineAtOffset(margin + 200, y);
            content.showText("SKU");
            content.endText();

            content.beginText();
            content.newLineAtOffset(margin + 300, y);
            content.showText("Location");
            content.endText();

            content.beginText();
            content.newLineAtOffset(margin + 420, y);
            content.showText("Qty");
            content.endText();

            y -= 12;

            // Line under header
            content.moveTo(margin, y);
            content.lineTo(page.getMediaBox().getWidth() - margin, y);
            content.stroke();

            y -= 10;

            // Table rows
            content.setFont(PDType1Font.HELVETICA, 10);

            List<SalesOrderItem> items = so.getItems();
            for (SalesOrderItem item : items) {
                Product product = item.getProduct();
                String productName = product != null ? product.getName() : "-";
                String sku = product != null ? product.getSku() : "-";
                String location = product != null && product.getLocationCode() != null
                        ? product.getLocationCode()
                        : "N/A";
                String qty = String.valueOf(item.getQuantity());

                if (y < 70) {
                    // new page if we reach bottom
                    content.close();
                    page = new PDPage(PDRectangle.A4);
                    document.addPage(page);
                    content = new PDPageContentStream(document, page);
                    y = page.getMediaBox().getHeight() - margin;
                }

                content.beginText();
                content.newLineAtOffset(margin, y);
                content.showText(productName);
                content.endText();

                content.beginText();
                content.newLineAtOffset(margin + 200, y);
                content.showText(sku);
                content.endText();

                content.beginText();
                content.newLineAtOffset(margin + 300, y);
                content.showText(location);
                content.endText();

                content.beginText();
                content.newLineAtOffset(margin + 420, y);
                content.showText(qty);
                content.endText();

                y -= 15;
            }

            content.close();
            document.save(out);
            return out.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException("Failed to generate picking slip PDF", e);
        }
    }
}
