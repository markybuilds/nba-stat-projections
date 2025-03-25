# NBA Stat Projections - Security Configuration Guide

## Overview

This document provides detailed security configuration steps for the production deployment of the NBA Stat Projections application. It covers authentication, authorization, API security, data encryption, network security, and monitoring.

## Table of Contents
1. [Authentication Configuration](#authentication-configuration)
2. [Authorization Rules](#authorization-rules)
3. [API Security Measures](#api-security-measures)
4. [Data Encryption](#data-encryption)
5. [Network Security](#network-security)
6. [Logging and Monitoring](#logging-and-monitoring)
7. [Compliance Requirements](#compliance-requirements)
8. [Security Testing](#security-testing)
9. [Incident Response](#incident-response)

## Authentication Configuration

### Supabase Auth Setup

1. **Enable Required Authentication Providers**
   ```bash
   # Set required environment variables
   export SUPABASE_URL="https://your-project.supabase.co"
   export SUPABASE_KEY="your-service-role-key"
   
   # Enable email/password authentication
   curl -X POST $SUPABASE_URL/auth/v1/config \
     -H "Authorization: Bearer $SUPABASE_KEY" \
     -H "Content-Type: application/json" \
     -d '{"enable_signup": true, "email": {"enable_signup": true, "double_confirm_changes": true, "enable_confirmations": true}}'
   ```

2. **Configure Password Policy**
   - Minimum password length: 12 characters
   - Require at least one uppercase letter
   - Require at least one lowercase letter
   - Require at least one number
   - Require at least one special character
   - Maximum password age: 90 days
   - Password history: Remember last 5 passwords

   ```bash
   curl -X PUT $SUPABASE_URL/auth/v1/config \
     -H "Authorization: Bearer $SUPABASE_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "password_min_length": 12,
       "password_require_uppercase": true,
       "password_require_lowercase": true,
       "password_require_number": true,
       "password_require_special_char": true,
       "password_max_age_days": 90,
       "password_history_length": 5
     }'
   ```

3. **Set Up Email Templates**
   - Configure confirmation email
   - Configure password reset email
   - Configure email change confirmation
   - Configure magic link email

4. **Configure OAuth Providers (if applicable)**
   - Set up Google OAuth
   - Set up GitHub OAuth

### JWT Configuration

1. **Configure JWT Settings**
   - Set token expiry times:
     - Access token: 1 hour
     - Refresh token: 7 days
   - Configure JWT claims

   ```bash
   curl -X PUT $SUPABASE_URL/auth/v1/config \
     -H "Authorization: Bearer $SUPABASE_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "jwt_expiry": 3600,
       "refresh_token_expiry": 604800
     }'
   ```

2. **Implement JWT Validation**
   - Ensure server validates JWT signature
   - Check token expiration
   - Validate issuer and audience claims

## Authorization Rules

### Role-Based Access Control

1. **Define User Roles**
   - Admin: Full access to all features
   - Analyst: Access to all data and projections
   - Viewer: Read-only access to public data
   - Guest: Limited access to basic features

2. **Set Up Database RLS Policies**

   For Players table:
   ```sql
   -- Allow authenticated users to read player data
   CREATE POLICY "Players are viewable by authenticated users"
   ON public.players
   FOR SELECT
   TO authenticated
   USING (true);
   
   -- Allow admins to insert/update player data
   CREATE POLICY "Admins can insert players"
   ON public.players
   FOR INSERT
   TO authenticated
   WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
   
   CREATE POLICY "Admins can update players"
   ON public.players
   FOR UPDATE
   TO authenticated
   USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
   WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
   ```

3. **Configure API Endpoint Authorization**
   - Implement middleware to check user roles
   - Add authorization checks to API routes
   - Create role-specific API endpoints where necessary

4. **Set Up Frontend Authorization**
   - Implement route guards for protected pages
   - Create role-based UI components
   - Handle unauthorized access gracefully

## API Security Measures

### Rate Limiting

1. **Configure API Rate Limits**
   ```bash
   # Set up rate limiting with nginx
   location /api/ {
     limit_req zone=api burst=20 nodelay;
     limit_req_status 429;
     # Other configuration
   }
   ```

2. **Define Rate Limit Tiers**
   - Anonymous: 60 requests per minute
   - Authenticated: 300 requests per minute
   - Premium: 1000 requests per minute

### API Keys

1. **Create API Key Management System**
   - Generate secure API keys
   - Store keys securely in database
   - Implement key rotation mechanism

2. **Configure API Key Validation**
   - Validate API keys on each request
   - Track API key usage
   - Implement key-specific rate limits

### Request Validation

1. **Input Validation**
   - Validate all request parameters
   - Implement schema validation for request bodies
   - Sanitize inputs to prevent injection attacks

2. **Implement CORS Policy**
   ```javascript
   // Express.js CORS configuration
   app.use(cors({
     origin: ['https://nba-stats-prod.example.com'],
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
     allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
     credentials: true,
     maxAge: 86400 // 24 hours
   }));
   ```

## Data Encryption

### Database Encryption

1. **Enable Supabase Database Encryption**
   - Configure TDE (Transparent Data Encryption)
   - Set up secure key management

2. **Encrypt Sensitive Fields**
   ```sql
   -- Create encryption function
   CREATE OR REPLACE FUNCTION encrypt_sensitive_data(input text) RETURNS text AS $$
   BEGIN
     RETURN pgp_sym_encrypt(input, current_setting('app.encryption_key'));
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   -- Create decryption function
   CREATE OR REPLACE FUNCTION decrypt_sensitive_data(input text) RETURNS text AS $$
   BEGIN
     RETURN pgp_sym_decrypt(input, current_setting('app.encryption_key'));
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

### Transport Encryption

1. **Configure TLS**
   - Set up TLS 1.3
   - Configure secure ciphers
   - Implement HTTP Strict Transport Security (HSTS)

2. **Set Up Cloudflare SSL**
   - Enable Full (strict) SSL mode
   - Configure minimum TLS version: 1.2
   - Enable Authenticated Origin Pulls

## Network Security

### Firewall Configuration

1. **Configure Cloud Firewall Rules**
   - Allow only necessary ports
   - Restrict access by IP address where appropriate
   - Implement Web Application Firewall (WAF)

2. **Database Access Rules**
   - Restrict database access to application servers only
   - Use private network for database communication
   - Implement network-level encryption

### DDoS Protection

1. **Set Up Cloudflare DDoS Protection**
   - Enable Cloudflare DDoS protection
   - Configure rate limiting rules
   - Set up alerting for attack detection

## Logging and Monitoring

### Security Logging

1. **Configure Comprehensive Logging**
   - Authentication events
   - Authorization failures
   - API access
   - Database queries
   - System events

2. **Set Up Log Retention**
   - Store logs for 90 days
   - Archive logs securely for 1 year
   - Implement log rotation

### Security Monitoring

1. **Implement Real-time Monitoring**
   - Set up Prometheus alerts for security events
   - Configure Grafana dashboards for security metrics
   - Create alerts for suspicious activities

2. **Configure Alerting**
   - Define alert thresholds
   - Set up notification channels (email, Slack)
   - Establish escalation procedures

## Compliance Requirements

### Data Protection

1. **Implement GDPR Compliance**
   - User data access mechanisms
   - Data deletion functionality
   - Data portability features
   - Privacy policy implementation

2. **Set Up Data Retention Policies**
   - Define data retention periods
   - Implement automated data purging
   - Create data anonymization procedures

## Security Testing

### Vulnerability Scanning

1. **Configure Automated Scanning**
   - Set up OWASP ZAP scanning in CI/CD pipeline
   - Implement dependency scanning
   - Schedule regular vulnerability scans

2. **Penetration Testing**
   - Conduct pre-deployment penetration testing
   - Address all critical and high findings
   - Schedule regular security assessments

## Incident Response

### Response Procedures

1. **Create Incident Response Plan**
   - Define incident severity levels
   - Establish response team and roles
   - Document containment procedures
   - Outline recovery processes

2. **Set Up Response Tools**
   - Configure security incident logging
   - Establish communication channels
   - Prepare investigation resources

## Implementation Checklist

- [ ] Configure authentication providers
- [ ] Set up password policies
- [ ] Implement JWT validation
- [ ] Configure database RLS policies
- [ ] Set up API rate limiting
- [ ] Implement API key management
- [ ] Configure CORS policies
- [ ] Enable database encryption
- [ ] Set up TLS/SSL
- [ ] Configure network firewall
- [ ] Implement DDoS protection
- [ ] Set up security logging
- [ ] Configure security monitoring
- [ ] Implement compliance requirements
- [ ] Conduct security testing
- [ ] Prepare incident response plan

## Contact Information

For security-related questions or issues, contact:

- Security Team: security@nba-stats-example.com
- Operations Lead: ops-lead@nba-stats-example.com
- Emergency Contact: security-emergency@nba-stats-example.com 