package com.taskforge.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.nio.charset.StandardCharsets;

import com.taskforge.security.services.UserDetailsImpl;

@Component
public class JwtUtils {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${taskforge.app.jwtSecret}")
    private String jwtSecret;

    @Value("${taskforge.app.jwtExpirationMs}")
    private int jwtExpirationMs;

    // ✅ Generate Token
    public String generateJwtToken(Authentication authentication) {

        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(new Date().getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ✅ Secret Key
    private Key key() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    // ✅ Extract Username
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // ✅ Validate Token
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder()   // 🔥 FIX HERE
                    .setSigningKey(key())
                    .build()
                    .parseClaimsJws(authToken);

            return true;

        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());

        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());

        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());

        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }

        return false;
    }
}