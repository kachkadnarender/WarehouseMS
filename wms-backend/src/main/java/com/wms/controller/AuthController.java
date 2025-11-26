package com.wms.controller;

import com.wms.dto.LoginRequest;
import com.wms.dto.LoginResponse;
import com.wms.dto.RegisterRequest;
import com.wms.entity.User;
import com.wms.repository.UserRepository;
import com.wms.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthenticationManager authManager;
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    public AuthController(AuthenticationManager authManager,
                          UserRepository userRepo,
                          PasswordEncoder encoder,
                          JwtUtil jwtUtil) {
        this.authManager = authManager;
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest req) {
        if (userRepo.findByUsername(req.getUsername()).isPresent()) {
            return "Username taken";
        }
        if (!Set.of("ADMIN", "CUSTOMER").contains(req.getRole().toUpperCase())) {
            return "Invalid role";
        }

        User user = new User();
        user.setUsername(req.getUsername());
        user.setPassword(encoder.encode(req.getPassword()));
        user.setRole(req.getRole().toUpperCase());
        userRepo.save(user);

        return "Registered successfully";
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req) {
        try {
            Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
            );

            String username = auth.getName();
            String role = auth.getAuthorities()
                    .iterator()
                    .next()
                    .getAuthority()
                    .replace("ROLE_", "");

            String token = jwtUtil.generateToken(username, role);

            return ResponseEntity.ok(new LoginResponse(token, username, role));
        } catch (Exception e) {
            return ResponseEntity
                    .status(401)
                    .body(new LoginResponse(null, null, null));
        }
    }
}
