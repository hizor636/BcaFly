package com.bcafly.auth;

import com.bcafly.security.JwtTokenProvider;
import com.bcafly.users.User;
import com.bcafly.users.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Email already exists"
            ));
        }

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(User.Role.valueOf(request.role().toUpperCase()))
                .department("BCA")
                .isActive(true)
                .build();

        userRepository.save(user);

        String token = jwtTokenProvider.generateToken(
                user.getId(), user.getEmail(), user.getRole().name()
        );

        return ResponseEntity.ok(Map.of(
            "success", true,
            "token", token,
            "user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().name()
            )
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.email()).orElse(null);

        if (user == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "Invalid credentials"
            ));
        }

        if (Boolean.FALSE.equals(user.getIsActive())) {
            return ResponseEntity.status(403).body(Map.of(
                "success", false,
                "message", "Account is deactivated"
            ));
        }

        String token = jwtTokenProvider.generateToken(
                user.getId(), user.getEmail(), user.getRole().name()
        );

        return ResponseEntity.ok(Map.of(
            "success", true,
            "token", token,
            "user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().name()
            )
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        var auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();

        if (auth == null || !(auth.getPrincipal() instanceof User currentUser)) {
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "Not authenticated"
            ));
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "user", Map.of(
                "id", currentUser.getId(),
                "name", currentUser.getName(),
                "email", currentUser.getEmail(),
                "role", currentUser.getRole().name()
            )
        ));
    }

    public record RegisterRequest(String name, String email, String password, String role) {}
    public record LoginRequest(String email, String password) {}
}
