package com.taskforge.config;

import com.taskforge.entity.Role;
import com.taskforge.entity.User;
import com.taskforge.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail("admin@taskforge.com")) {
            User admin = new User();
            admin.setName("Super Admin");
            admin.setEmail("admin@taskforge.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            System.out.println("Admin user seeded: admin@taskforge.com | admin123");
        }
        
        if (!userRepository.existsByEmail("manager@taskforge.com")) {
            User manager = new User();
            manager.setName("Test Manager");
            manager.setEmail("manager@taskforge.com");
            manager.setPassword(passwordEncoder.encode("manager123"));
            manager.setRole(Role.MANAGER);
            userRepository.save(manager);
            System.out.println("Manager user seeded: manager@taskforge.com | manager123");
        }
        
        if (!userRepository.existsByEmail("employee@taskforge.com")) {
            User employee = new User();
            employee.setName("Test Employee");
            employee.setEmail("employee@taskforge.com");
            employee.setPassword(passwordEncoder.encode("employee123"));
            employee.setRole(Role.EMPLOYEE);
            userRepository.save(employee);
            System.out.println("Employee user seeded: employee@taskforge.com | employee123");
        }
    }
}
