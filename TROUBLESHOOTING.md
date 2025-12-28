# Troubleshooting Guide

Common issues and their solutions.

## Authentication Issues

### "Firebase Auth not working"
**Symptoms:** Can't sign in, errors in console

**Solutions:**
1. Check Firebase Console → Authentication → Sign-in method
   - Email/Password must be enabled
   - Google provider must be enabled
2. Verify `.env` file has correct values:
   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   ```
3. Check browser console for specific error messages
4. Verify authorized domains in Firebase Console

### "Google OAuth not working"
**Symptoms:** Google sign-in button does nothing

**Solutions:**
1. Enable Google provider in Firebase Console
2. Add OAuth consent screen in Google Cloud Console
3. Add authorized redirect URIs:
   - `http://localhost:3000` (local)
   - `https://your-project.web.app` (production)

---

## File Upload Issues

### "Upload fails silently"
**Symptoms:** File uploads but nothing happens

**Solutions:**
1. Check Firebase Storage rules are deployed:
   ```bash
   firebase deploy --only storage
   ```
2. Verify file size < 10MB
3. Check file is PDF format
4. Check browser console for errors
5. Verify Storage is enabled in Firebase Console

### "File uploads but extraction fails"
**Symptoms:** File in Storage but no data extracted

**Solutions:**
1. Check Cloud Functions logs:
   ```bash
   firebase functions:log
   ```
2. Verify Document AI processor ID is correct
3. Check Document AI API is enabled
4. Verify processor exists in Document AI Console

---

## Cloud Functions Issues

### "Functions not deploying"
**Symptoms:** Deployment fails or hangs

**Solutions:**
1. Check Node.js version matches `package.json` (18+):
   ```bash
   node --version
   ```
2. Verify all dependencies installed:
   ```bash
   cd functions
   npm install
   ```
3. Check Firebase CLI is logged in:
   ```bash
   firebase login
   ```
4. Verify Cloud Functions API is enabled
5. Check billing is enabled on Google Cloud project

### "Function timeout"
**Symptoms:** Functions take too long or timeout

**Solutions:**
1. Increase timeout in `functions/src/index.js`:
   ```javascript
   exports.api = functions
     .runWith({ timeoutSeconds: 540 })
     .https.onRequest(app);
   ```
2. Optimize Document AI processing
3. Check function logs for bottlenecks

### "CORS errors"
**Symptoms:** Browser shows CORS errors in console

**Solutions:**
1. Verify CORS is configured in `functions/src/index.js`
2. Check function URL is correct in frontend `.env`
3. For production, add your domain to CORS origins:
   ```javascript
   const corsHandler = cors({
     origin: [
       'https://your-project.web.app',
       'https://your-project.firebaseapp.com'
     ]
   });
   ```

---

## Document AI Issues

### "Document AI processor not found"
**Symptoms:** Error when processing PDFs

**Solutions:**
1. Verify Processor ID format (must be full path):
   ```
   projects/123456789/locations/us/processors/abc123def456
   ```
2. Check processor exists in Document AI Console
3. Verify Document AI API is enabled
4. Check processor region matches environment variable

### "Extraction accuracy is poor"
**Symptoms:** Wrong values extracted from PDFs

**Solutions:**
1. Use a custom trained processor (Document AI Workbench)
2. Pre-process PDFs (ensure they're not scanned images)
3. Adjust extraction logic in `functions/src/extractLabData.js`
4. Add more parsing patterns for different lab report formats

---

## BigQuery Issues

### "BigQuery table not found"
**Symptoms:** Errors when querying trends

**Solutions:**
1. Verify dataset exists:
   ```bash
   bq ls medical_reports
   ```
2. Run schema file:
   ```bash
   bq query --use_legacy_sql=false < bigquery/schema.sql
   ```
3. Check dataset name matches environment variable
4. Verify BigQuery API is enabled

### "BigQuery query fails"
**Symptoms:** Trend analysis doesn't work

**Solutions:**
1. Check query syntax in `functions/src/getTrends.js`
2. Verify user has BigQuery permissions
3. Check dataset location matches project location
4. Review BigQuery logs in Google Cloud Console

---

## Gemini AI Issues

### "Gemini API error"
**Symptoms:** AI explanations don't generate

**Solutions:**
1. Verify API key is correct in `functions/.env`
2. Check API quota hasn't been exceeded
3. Verify API is enabled in Google AI Studio
4. Check API key has proper permissions

### "AI responses contain diagnosis language"
**Symptoms:** Safety guardrails not working

**Solutions:**
1. Check `functions/src/safetyGuardrails.js` is being called
2. Review blocked keywords list
3. Add more keywords to `BLOCKED_KEYWORDS` array
4. Check function logs for sanitization warnings

---

## Frontend Issues

### "Build fails"
**Symptoms:** `npm run build` errors

**Solutions:**
1. Check Node.js version (18+)
2. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. Check for TypeScript errors (if using TS)
4. Verify all environment variables are set

### "App won't start"
**Symptoms:** `npm run dev` fails

**Solutions:**
1. Check port 3000 is available
2. Change port in `vite.config.js` if needed
3. Verify all dependencies installed
4. Check for syntax errors in code

### "Environment variables not loading"
**Symptoms:** Variables are undefined

**Solutions:**
1. Restart dev server after changing `.env`
2. Verify variable names start with `VITE_`
3. Check `.env` file is in `frontend/` directory
4. Clear browser cache

---

## Database Issues

### "Firestore rules blocking access"
**Symptoms:** Can't read/write data

**Solutions:**
1. Deploy rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
2. Check rules syntax in `firestore.rules`
3. Verify user is authenticated
4. Test rules in Firebase Console → Firestore → Rules

### "Data not persisting"
**Symptoms:** Data disappears after refresh

**Solutions:**
1. Check Firestore is in production mode (not emulator)
2. Verify writes are successful (check console logs)
3. Check Firestore rules allow writes
4. Verify network connectivity

---

## Performance Issues

### "App is slow"
**Symptoms:** Long load times, laggy UI

**Solutions:**
1. Optimize images and assets
2. Enable code splitting
3. Use lazy loading for components
4. Check network tab for slow requests
5. Optimize BigQuery queries

### "Functions are slow"
**Symptoms:** API calls take too long

**Solutions:**
1. Check function logs for bottlenecks
2. Optimize Document AI processing
3. Cache frequently accessed data
4. Use Cloud Functions v2 (faster cold starts)
5. Increase function memory allocation

---

## Deployment Issues

### "Deployment fails"
**Symptoms:** `firebase deploy` errors

**Solutions:**
1. Check Firebase CLI is logged in
2. Verify project is linked: `firebase use --add`
3. Check billing is enabled
4. Review deployment logs for specific errors
5. Try deploying one service at a time:
   ```bash
   firebase deploy --only functions
   firebase deploy --only hosting
   ```

### "Deployed app doesn't work"
**Symptoms:** Works locally but not in production

**Solutions:**
1. Check environment variables are set in production
2. Verify CORS allows production domain
3. Check function URLs are correct
4. Review production logs:
   ```bash
   firebase functions:log
   ```
5. Test functions directly via curl

---

## Environment-Specific Issues

### "Works locally but not in production"
**Checklist:**
- [ ] Environment variables set in production
- [ ] Security rules deployed
- [ ] CORS configured for production domain
- [ ] Function URLs updated in frontend
- [ ] APIs enabled in production project

### "Works in production but not locally"
**Checklist:**
- [ ] Emulators are running
- [ ] `.env` files configured
- [ ] Function URL points to emulator
- [ ] Local Firebase project linked

---

## Still Stuck?

1. **Check Logs:**
   ```bash
   # Firebase Functions
   firebase functions:log
   
   # Google Cloud
   gcloud logging read
   
   # Browser Console
   Open DevTools → Console
   ```

2. **Verify Configuration:**
   - All environment variables set
   - All APIs enabled
   - Security rules deployed
   - Billing enabled

3. **Test Components Individually:**
   - Test authentication separately
   - Test file upload separately
   - Test functions via curl
   - Test BigQuery queries directly

4. **Get Help:**
   - Review `SETUP_GUIDE.md` for detailed setup
   - Check Firebase/Google Cloud documentation
   - Review error messages carefully
   - Check GitHub issues (if open source)

---

## Prevention Tips

1. **Always test locally first** before deploying
2. **Use environment variables** instead of hardcoding
3. **Monitor logs regularly** for early warning signs
4. **Keep dependencies updated** (but test first)
5. **Document your setup** for future reference
6. **Use version control** to track changes
7. **Set up alerts** for errors and performance issues

---

**Remember:** Most issues are configuration-related. Double-check your environment variables and API settings first!

