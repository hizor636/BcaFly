package com.bcafly.common;

import com.bcafly.users.User;
import com.bcafly.users.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Central scope-validation service that enforces data ownership boundaries.
 *
 * Rules enforced:
 * - Student queries always filter by authenticated student ID (IDOR protection)
 * - Faculty queries filter by active faculty_course_allocations
 * - HOD queries filter by department
 * - Admin has institution-wide access
 */
@Service
public class ScopeValidator {

    private final UserRepository userRepository;

    public ScopeValidator(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Get the currently authenticated user from the security context.
     * @return The authenticated User entity, or null if not authenticated.
     */
    public User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }

        Object principal = auth.getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }

        // If principal is email string (from JWT), look up the user
        if (principal instanceof String email) {
            return userRepository.findByEmail(email).orElse(null);
        }

        return null;
    }

    /**
     * Get the authenticated user's ID. Throws if not authenticated.
     */
    public Long getAuthenticatedUserId() {
        User user = getAuthenticatedUser();
        if (user == null) {
            throw new SecurityException("Authentication required.");
        }
        return user.getId();
    }

    /**
     * Get the authenticated user's role.
     */
    public User.Role getAuthenticatedRole() {
        User user = getAuthenticatedUser();
        if (user == null) {
            throw new SecurityException("Authentication required.");
        }
        return user.getRole();
    }

    /**
     * Get the authenticated user's department.
     */
    public String getAuthenticatedDepartment() {
        User user = getAuthenticatedUser();
        if (user == null) {
            throw new SecurityException("Authentication required.");
        }
        return user.getDepartment();
    }

    /**
     * IDOR protection: Verify the requested studentId matches the authenticated student.
     * Students can ONLY access their own records.
     *
     * @param requestedStudentUserId The user ID from the request.
     * @throws SecurityException if the IDs don't match and the caller is a STUDENT.
     */
    public void validateStudentOwnership(Long requestedStudentUserId) {
        User user = getAuthenticatedUser();
        if (user == null) {
            throw new SecurityException("Authentication required.");
        }

        if (user.getRole() == User.Role.STUDENT && !user.getId().equals(requestedStudentUserId)) {
            throw new SecurityException("Access denied: Students can only access their own records.");
        }
    }

    /**
     * Verify the authenticated user has at least the specified role authority.
     * Authority hierarchy: ADMIN > HOD > FACULTY > STUDENT
     */
    public void requireMinimumRole(User.Role minimumRole) {
        User user = getAuthenticatedUser();
        if (user == null) {
            throw new SecurityException("Authentication required.");
        }

        int userLevel = roleLevel(user.getRole());
        int requiredLevel = roleLevel(minimumRole);

        if (userLevel < requiredLevel) {
            throw new SecurityException("Insufficient authority. Required: " + minimumRole);
        }
    }

    /**
     * Verify the authenticated user belongs to the same department.
     * HOD and Faculty are department-scoped.
     */
    public void validateDepartmentScope(String targetDepartment) {
        User user = getAuthenticatedUser();
        if (user == null) {
            throw new SecurityException("Authentication required.");
        }

        // Admins have cross-department access
        if (user.getRole() == User.Role.ADMIN) {
            return;
        }

        if (!user.getDepartment().equalsIgnoreCase(targetDepartment)) {
            throw new SecurityException("Access denied: Cannot access data from department '" + targetDepartment + "'.");
        }
    }

    /**
     * Check if the authenticated user is an admin.
     */
    public boolean isAdmin() {
        User user = getAuthenticatedUser();
        return user != null && user.getRole() == User.Role.ADMIN;
    }

    /**
     * Check if the authenticated user is HOD.
     */
    public boolean isHod() {
        User user = getAuthenticatedUser();
        return user != null && user.getRole() == User.Role.HOD;
    }

    /**
     * Check if the authenticated user is Faculty.
     */
    public boolean isFaculty() {
        User user = getAuthenticatedUser();
        return user != null && user.getRole() == User.Role.FACULTY;
    }

    /**
     * Check if the authenticated user is a Student.
     */
    public boolean isStudent() {
        User user = getAuthenticatedUser();
        return user != null && user.getRole() == User.Role.STUDENT;
    }

    /**
     * Convert role to authority level for comparison.
     */
    private int roleLevel(User.Role role) {
        return switch (role) {
            case ADMIN -> 4;
            case HOD -> 3;
            case FACULTY -> 2;
            case STUDENT -> 1;
        };
    }
}
