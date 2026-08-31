package com.bcafly.students;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "students")
public class Student {
    @Id
    @Column(length = 100)
    private String id;

    @Column(nullable = false, unique = true, length = 50)
    private String usn;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(length = 100)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Student() {}

    public Student(String id, String usn, String fullName, String email, String phone) {
        this.id = id;
        this.usn = usn;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUsn() { return usn; }
    public void setUsn(String usn) { this.usn = usn; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
