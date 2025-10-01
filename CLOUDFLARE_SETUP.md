# Cloudflare Configuration for S3Learn

## DNS Configuration

Set up these DNS records in Cloudflare:

### A Records
```
Name: s3learn.com
Type: A
Value: YOUR_SERVER_IP
Proxy: ✅ Proxied (Orange Cloud)

Name: www
Type: A
Value: YOUR_SERVER_IP
Proxy: ✅ Proxied (Orange Cloud)

Name: api
Type: A
Value: YOUR_SERVER_IP
Proxy: ✅ Proxied (Orange Cloud)
```

## SSL/TLS Configuration

### 1. SSL/TLS Encryption Mode
- Go to SSL/TLS → Overview
- Set encryption mode to: **Full (strict)**

### 2. Edge Certificates
- Go to SSL/TLS → Edge Certificates
- Enable: **Always Use HTTPS**
- Enable: **HTTP Strict Transport Security (HSTS)**
- Minimum TLS Version: **TLS 1.2**

### 3. Origin Certificates (Optional)
If you want end-to-end encryption:
- Go to SSL/TLS → Origin Server
- Create an Origin Certificate
- Download the certificate and key
- Place them in `./ssl/` directory

## Page Rules

### 1. API Subdomain Rule
```
URL: api.s3learn.com/*
Settings:
- Cache Level: Bypass
- Security Level: Medium
- Browser Integrity Check: On
```

### 2. Frontend Rule
```
URL: s3learn.com/*
Settings:
- Cache Level: Standard
- Browser Cache TTL: 4 hours
- Edge Cache TTL: 2 hours
- Security Level: Medium
```

### 3. Static Assets Rule
```
URL: s3learn.com/static/*
Settings:
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month
- Browser Cache TTL: 1 month
```

## Security Settings

### 1. Firewall Rules
Go to Security → WAF → Custom rules:

```
Rule 1: Rate Limiting API
Expression: (http.host eq "api.s3learn.com")
Action: Rate limit (100 requests per minute)

Rule 2: Block suspicious requests
Expression: (http.request.uri.path contains "/api/admin" and cf.threat_score gt 10)
Action: Block

Rule 3: Rate limit login attempts
Expression: (http.host eq "api.s3learn.com" and http.request.uri.path eq "/api/auth/login")
Action: Rate limit (5 requests per minute)
```

### 2. Bot Fight Mode
- Go to Security → Bots
- Enable **Bot Fight Mode**

### 3. DDoS Protection
- Go to Security → DDoS
- Ensure **HTTP DDoS Attack Protection** is enabled

## Speed Optimization

### 1. Auto Minify
- Go to Speed → Optimization
- Enable: **Auto Minify** (HTML, CSS, JS)

### 2. Brotli Compression
- Go to Speed → Optimization
- Enable: **Brotli**

### 3. Rocket Loader
- Go to Speed → Optimization
- Enable: **Rocket Loader** (improves load time)

## Analytics and Monitoring

### 1. Web Analytics
- Go to Analytics & Logs → Web Analytics
- Enable analytics for both domains

### 2. Real User Monitoring
- Go to Speed → Optimization
- Enable: **Real User Monitoring**

## Environment Variables Update

Update your frontend environment to use the new API domain:

```env
# Frontend .env
REACT_APP_API_URL=https://api.s3learn.com
REACT_APP_DOMAIN=https://s3learn.com
```

## Testing the Setup

1. **Frontend Access**: https://s3learn.com
2. **API Access**: https://api.s3learn.com/api/health
3. **CORS Test**: Make API calls from frontend to backend

## Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Check Cloudflare's "Always Use HTTPS" setting
   - Verify Origin Certificate configuration
   - Check Nginx CORS headers

2. **SSL Certificate Issues**
   - Wait up to 24 hours for certificate provisioning
   - Check SSL/TLS mode is "Full (strict)"

3. **API Route Not Working**
   - Verify DNS propagation: `dig api.s3learn.com`
   - Check Nginx configuration
   - Test direct server access

4. **Static Assets Not Loading**
   - Check page rules order (more specific first)
   - Verify cache settings
   - Clear Cloudflare cache

## Cache Purging

When deploying updates:
```bash
# Purge all cache
curl -X POST "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/purge_cache" \
     -H "Authorization: Bearer YOUR_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"purge_everything":true}'
```

## Security Best Practices

1. Enable **2FA** on Cloudflare account
2. Use **API Tokens** instead of Global API Key
3. Regularly review **Firewall Events**
4. Monitor **Analytics** for unusual traffic patterns
5. Keep **Page Rules** updated as your app grows

This configuration provides:
- ✅ Separate domains for frontend and API
- ✅ SSL/TLS encryption
- ✅ DDoS protection
- ✅ Rate limiting
- ✅ Caching optimization
- ✅ Security headers
- ✅ Performance optimization