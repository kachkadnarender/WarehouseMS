package com.wms.config;

import com.wms.entity.Product;
import com.wms.entity.User;
import com.wms.repository.ProductRepository;
import com.wms.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;

@Configuration
public class DemoDataConfig {

    @Bean
    public CommandLineRunner loadDemoData(ProductRepository productRepo,
                                          UserRepository userRepo,
                                          PasswordEncoder passwordEncoder) {
        return args -> {

            // 1) Default users
            if (userRepo.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin"));
                admin.setRole("ADMIN");
                userRepo.save(admin);
                System.out.println(">>> Created default ADMIN user: admin / admin");
            }

            if (userRepo.findByUsername("customer").isEmpty()) {
                User customer = new User();
                customer.setUsername("customer");
                customer.setPassword(passwordEncoder.encode("customer"));
                customer.setRole("CUSTOMER");
                userRepo.save(customer);
                System.out.println(">>> Created default CUSTOMER user: customer / customer");
            }

            // 2) Insert demo products if table is empty
            if (productRepo.count() == 0) {
                Product p1 = new Product();
                p1.setName("iPhone 16 Pro");
                p1.setSku("IPHONE16PRO");
                p1.setStockQuantity(25);
                p1.setPrice(1299.99);
                p1.setLocationCode("RACK-A1-SHELF-1");
                p1.setPerishable(false);
                p1.setExpiryDate(null);

                Product p2 = new Product();
                p2.setName("MacBook Pro 14\"");
                p2.setSku("MBP14-M3");
                p2.setStockQuantity(10);
                p2.setPrice(1999.00);
                p2.setLocationCode("RACK-A1-SHELF-2");
                p2.setPerishable(false);
                p2.setExpiryDate(null);

                Product p3 = new Product();
                p3.setName("Protein Bar Pack (Box of 24)");
                p3.setSku("PROTBAR24");
                p3.setStockQuantity(50);
                p3.setPrice(39.99);
                p3.setLocationCode("RACK-B2-SHELF-1");
                p3.setPerishable(true);
                p3.setExpiryDate(LocalDate.now().plusDays(5));  // near expiry

                Product p4 = new Product();
                p4.setName("Cold Brew Coffee 12-Pack");
                p4.setSku("COLDBREW12");
                p4.setStockQuantity(30);
                p4.setPrice(29.99);
                p4.setLocationCode("RACK-C1-BIN-05");
                p4.setPerishable(true);
                p4.setExpiryDate(LocalDate.now().plusDays(10)); // near-ish

                productRepo.saveAll(List.of(p1, p2, p3, p4));
                System.out.println(">>> Inserted demo products into database with locations & expiry.");
            } else {
                // Backfill expiry + perishable for existing products (if needed)
                List<Product> products = productRepo.findAll();
                boolean updatedAny = false;

                for (Product p : products) {
                    if (p.getLocationCode() == null || p.getLocationCode().isBlank()) {
                        switch (p.getSku()) {
                            case "IPHONE16PRO" -> p.setLocationCode("RACK-A1-SHELF-1");
                            case "MBP14-M3" -> p.setLocationCode("RACK-A1-SHELF-2");
                            default -> p.setLocationCode("GENERAL-STORAGE");
                        }
                        updatedAny = true;
                    }

                    // If any perishable flags weren't set yet, mark a couple as examples
                    if (p.getSku().equals("PROTBAR24")) {
                        p.setPerishable(true);
                        if (p.getExpiryDate() == null) {
                            p.setExpiryDate(LocalDate.now().plusDays(5));
                        }
                        updatedAny = true;
                    } else if (p.getSku().equals("COLDBREW12")) {
                        p.setPerishable(true);
                        if (p.getExpiryDate() == null) {
                            p.setExpiryDate(LocalDate.now().plusDays(10));
                        }
                        updatedAny = true;
                    }
                }

                if (updatedAny) {
                    productRepo.saveAll(products);
                    System.out.println(">>> Backfilled location/expiry info for existing products.");
                }
            }
        };
    }
}
