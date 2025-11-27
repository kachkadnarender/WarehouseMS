package com.wms.config;

import com.wms.entity.Product;
import com.wms.entity.User;
import com.wms.repository.ProductRepository;
import com.wms.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

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

            // 2) Demo products (only if empty)
            if (productRepo.count() == 0) {
                Product p1 = new Product();
                p1.setName("iPhone 16 Pro");
                p1.setSku("IPHONE16PRO");
                p1.setStockQuantity(25);
                p1.setPrice(1299.99);

                Product p2 = new Product();
                p2.setName("MacBook Pro 14\"");
                p2.setSku("MBP14-M3");
                p2.setStockQuantity(10);
                p2.setPrice(1999.00);

                Product p3 = new Product();
                p3.setName("iPad Air 13\"");
                p3.setSku("IPADAIR13");
                p3.setStockQuantity(15);
                p3.setPrice(799.00);

                Product p4 = new Product();
                p4.setName("AirPods Pro 3");
                p4.setSku("AIRPODS3");
                p4.setStockQuantity(40);
                p4.setPrice(299.00);

                productRepo.saveAll(List.of(p1, p2, p3, p4));
                System.out.println(">>> Inserted demo products into database.");
            }
        };
    }
}
