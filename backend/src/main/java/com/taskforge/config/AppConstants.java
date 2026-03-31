package com.taskforge.config;

import java.util.List;

public class AppConstants {

    // 🌐 Allowed Frontend Origins
    public static final List<String> ALLOWED_ORIGINS = List.of(
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000"
    );

    // 📡 Allowed HTTP Methods
    public static final List<String> ALLOWED_METHODS = List.of(
            "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
    );

    // 🔐 Allowed Headers
    public static final List<String> ALLOWED_HEADERS = List.of(
            "Authorization",
            "Content-Type"
    );

    // 📤 Exposed Headers
    public static final List<String> EXPOSED_HEADERS = List.of(
            "Authorization"
    );
}