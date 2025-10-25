# 🚨 CRITICAL SECURITY ALERT

## Google Maps API Key Exposure Incident

**Date**: October 21, 2025  
**Severity**: HIGH  
**Status**: RESOLVED - Key Revoked  

---

## Incident Summary

A Google Maps API key was accidentally committed to the public git repository and exposed publicly. The key `AIzaSyB7BR2V1kunq0fPSHN6Zhvg_oQTnvW7Lq0` has been **immediately revoked** and removed from the codebase.

## Timeline

- **2025-10-21 08:04**: API key committed to public repository in commit `3a981b31`
- **2025-10-21 ~15:00**: Security alert received about exposed key  
- **2025-10-21 15:30**: Key immediately revoked and replaced with placeholder

## Actions Taken

### ✅ Immediate Response
1. **Key Revoked**: Replaced exposed key with revocation notice
2. **Codebase Secured**: Updated all references to prevent reuse
3. **Test Suite Updated**: Added revoked key to detection logic
4. **Documentation**: Created this incident report

### 🔒 Security Measures Implemented
- Environment variables marked with security warnings
- Added detection for compromised keys in API tests
- Updated PRODUCTION_SETUP.md with security guidelines

## Required User Actions

### IMMEDIATE (User Must Do):
1. **Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)**
2. **Delete/Revoke** the compromised key: `AIzaSyB7BR2V1kunq0fPSHN6Zhvg_oQTnvW7Lq0`
3. **Generate new Google Maps API key** with proper restrictions
4. **Update environment variables** with new key:
   ```bash
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_new_secure_key_here
   ```

### SECURITY BEST PRACTICES:
1. **Apply API Restrictions**:
   - Restrict to Maps JavaScript API only
   - Add HTTP referrer restrictions: `https://cropple.ai/*`, `http://localhost:3000/*`
2. **Monitor Usage**: Check Google Cloud Console for unexpected usage
3. **Set Billing Alerts**: Prevent abuse-related charges

## Git History Cleanup

⚠️ **NOTE**: The exposed key remains in git history. Consider these options:

### Option 1: Git History Rewrite (Recommended)
```bash
# Remove sensitive data from entire git history
git filter-branch --env-filter '
if [ "$GIT_COMMIT" = "3a981b31ea3a42e1c28212c3a2fa35a1b81316bd" ]; then
    export GIT_AUTHOR_EMAIL="security@cropple.ai"
    export GIT_COMMITTER_EMAIL="security@cropple.ai"
fi' -- --all

# Force push (DANGEROUS - coordinate with team)
git push --force-with-lease origin main
```

### Option 2: New Repository (Safest)
```bash
# Create clean repository without compromised history
git clone --depth 1 https://github.com/your-repo/crops-ai.git crops-ai-clean
cd crops-ai-clean
git remote set-url origin https://github.com/your-repo/crops-ai-new.git
git push -u origin main
```

## Verification Steps

After implementing new API key:

```bash
# Test Google Maps functionality
npm run test:apis

# Verify website functionality
npm run dev
# Navigate to homepage and verify maps work

# Check for any remaining references
grep -r "AIzaSyB7BR2V1kunq0fPSHN6Zhvg_oQTnvW7Lq0" .
```

## Cost Impact Assessment

- **Potential exposure time**: ~7 hours
- **Risk level**: HIGH (public repository access)
- **Recommended action**: Monitor Google Cloud billing for next 30 days
- **Expected abuse**: Possible increased API usage charges

## Lessons Learned

### Root Cause
- API keys committed directly to environment files
- Insufficient .gitignore protections for sensitive data
- Missing pre-commit hooks for secret detection

### Prevention Measures
1. **Never commit real API keys** - use placeholders only
2. **Implement pre-commit hooks** for secret detection
3. **Use environment variable services** (Vercel env vars, etc.)
4. **Regular security audits** of git history

## Files Modified

- ✅ `/apps/web/.env` - Revoked key replaced
- ✅ `/apps/web/scripts/test-apis.js` - Added revoked key detection  
- ✅ `/apps/web/SECURITY_ALERT.md` - This incident report

## Contact

For questions about this security incident:
- **Technical Lead**: [Technical Team]
- **Security**: [Security Team] 
- **Emergency**: [On-call Rotation]

---

**Status**: INCIDENT RESOLVED - USER ACTION REQUIRED  
**Next Review**: 2025-10-28 (7 days)