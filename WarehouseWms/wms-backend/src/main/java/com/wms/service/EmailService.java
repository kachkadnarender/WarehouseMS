package com.wms.service;

import com.wms.entity.PurchaseOrder;
import com.wms.entity.PurchaseOrderItem;
import com.wms.entity.SalesOrder;
import com.wms.entity.SalesOrderItem;
import com.wms.entity.User;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // You can set this to your own email for admin notifications
    private static final String ADMIN_NOTIFICATION_EMAIL = "narenderka07@gmail.com";

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // ----------------------------------------------------------------------
    // Low-level helper: send a simple text email and swallow errors
    // ----------------------------------------------------------------------
    public void safeSend(String to, String subject, String text) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, false);
            mailSender.send(message);
            log.info("Email sent to {} with subject {}", to, subject);
        } catch (Exception e) {
            log.warn("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    // ----------------------------------------------------------------------
    // 1) Registration / Signup email
    // ----------------------------------------------------------------------
    public void sendUserRegistered(User user) {
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            log.info("User {} has no email, skipping registration email.", user.getUsername());
            return;
        }

        String to = user.getEmail();
        String subject = "Welcome to WMS, " + user.getUsername();

        StringBuilder body = new StringBuilder();
        body.append("Hello ").append(user.getUsername()).append(",\n\n");
        body.append("Your account has been created successfully in Warehouse Management System.\n\n");
        body.append("Username: ").append(user.getUsername()).append("\n");
        body.append("Role: ").append(user.getRole()).append("\n\n");
        body.append("You can now log in and start using the system.\n\n");
        body.append("Regards,\nWMS Admin Team");

        safeSend(to, subject, body.toString());
    }

    // ----------------------------------------------------------------------
    // 2) Sales Order Confirmed email to customer
    // ----------------------------------------------------------------------
    public void sendSalesOrderConfirmed(SalesOrder so) {
        // If you stored customer email on the SalesOrder, you can use it.
        // For now we’ll send to ADMIN_NOTIFICATION_EMAIL (or adapt as needed).
        String to = ADMIN_NOTIFICATION_EMAIL;
        String subject = "Sales Order Confirmed: " + so.getSoNumber();

        StringBuilder body = new StringBuilder();
        body.append("Hello ").append(so.getCustomerName()).append(",\n\n");
        body.append("Your sales order has been confirmed.\n\n");
        body.append("SO Number: ").append(so.getSoNumber()).append("\n");
        body.append("Status: ").append(so.getStatus()).append("\n");
        body.append("Created At: ").append(so.getCreatedAt()).append("\n");
        body.append("Confirmed At: ").append(so.getConfirmedAt()).append("\n\n");

        body.append("Items:\n");
        if (so.getItems() != null) {
            for (SalesOrderItem item : so.getItems()) {
                body.append(" - ")
                    .append(item.getProduct().getName())
                    .append(" x ")
                    .append(item.getQuantity())
                    .append(" @ $")
                    .append(item.getUnitPrice())
                    .append("\n");
            }
        }

        body.append("\nRegards,\nWMS Sales Team");

        safeSend(to, subject, body.toString());
    }

    // ----------------------------------------------------------------------
    // 3) Purchase Order Created email to Vendor
    // ----------------------------------------------------------------------
    public void sendPurchaseOrderCreated(PurchaseOrder po) {
        // Prefer vendorEmail; if blank, fall back to admin
        String to = (po.getVendorEmail() != null && !po.getVendorEmail().isBlank())
                ? po.getVendorEmail()
                : ADMIN_NOTIFICATION_EMAIL;

        String subject = "New Purchase Order " + po.getPoNumber();

        StringBuilder body = new StringBuilder();
        body.append("Hello ")
            .append(po.getVendorName() != null ? po.getVendorName() : "Vendor")
            .append(",\n\n");
        body.append("A new Purchase Order has been created.\n\n");
        body.append("PO Number: ").append(po.getPoNumber()).append("\n");
        body.append("Vendor: ").append(po.getVendorName()).append("\n");
        body.append("Expected Date: ").append(po.getExpectedDate()).append("\n");
        body.append("Status: ").append(po.getStatus()).append("\n\n");

        body.append("Items:\n");
        if (po.getItems() != null) {
            for (PurchaseOrderItem item : po.getItems()) {
                body.append(" - ")
                    .append(item.getProduct().getName())
                    .append(" x ")
                    .append(item.getQuantity())
                    .append(" @ $")
                    .append(item.getUnitPrice())
                    .append("\n");
            }
        }

        body.append("\nRegards,\nWMS Purchasing Team");

        safeSend(to, subject, body.toString());
    }
}
