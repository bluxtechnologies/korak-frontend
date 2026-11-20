# GitGuardian Security Alert Remediation & Frontend Handoff

**Target Repository:** `bluxtechnologies/korak-frontend`  
**Related Repository:** `bluxtechnologies/korak-backend`  
**Alert Source:** GitGuardian Incident Alert  
**Incident Type:** Company Email Password Exposed on GitHub  
**Detection Date:** November 18th 2026, 08:37:59 UTC  
**Status:** Remediated in code & pre-commit hooks installed; awaiting credential rotation & GitGuardian alert resolution  

---

## 1. Incident Overview & Root Cause Analysis

GitGuardian detected an exposed credential flagged as **Company Email Password** within the `bluxtechnologies/korak-frontend` GitHub repository.

### Exact Leak Source

- **Commit:** `03960a8116aecd177b2274533408682baec22757`
- **Files Involved:**
  1. `src/features/social-media/api.ts` (lines 311–320)
  2. `src/features/social-media/MaskedDeliverableCard.test.tsx` (lines 11–20)
- **Exposed Payload:**
  ```typescript
  {
    order_id: orderId,
    username: "creator_transferred_admin",
    password: "[REDACTED_FLAGGED_PASSWORD]",               // <-- Flagged Password
    recovery_email: "transfer-backup [at] korakdigital.com", // <-- Flagged Company Email
    two_factor_backup_key: "K79A 28BC 9901 4410",
    audit_id: `aud_rev_${Date.now()}`,
    revealed_at: new Date().toISOString(),
  }
  ```

### Why GitGuardian Flagged This
GitGuardian uses heuristic and entropy-based detectors. When a string matching the project's company domain is paired with an adjacent high-entropy password pattern, it is classified as an active company credential exposure.

---

## 2. Immediate Fixes Applied

The following changes have already been implemented directly in the frontend workspace:

### 1. Replaced Leaked Credentials with RFC 2606 Dummy Mocks
In `src/features/social-media/api.ts` and `src/features/social-media/MaskedDeliverableCard.test.tsx`:
- Replaced the company address with `recovery@example.com` (RFC 2606 reserved domain).
- Replaced the hardcoded password string with `mock_temp_pass_9821`.
- Replaced `K79A 28BC 9901 4410` with `0000 0000 0000 0000`.

### 2. Installed Git Pre-Commit Hook
Installed `.git/hooks/pre-commit` in both the frontend and backend repositories to block:
1. Any `.env` file containing sensitive data from being staged (`.env.example` remains permitted).
2. Private keys (`.pem`, `.key`, `id_rsa`, etc.).
3. Commit diffs containing company email + password pairings, sensitive auth patterns, or private key blocks.

### 3. Backend Hardening (`korak-backend`)
1. Updated `.gitignore` to strictly match `.env*` (including `.env.local`, `.env.staging`, `.env.production`) while explicitly whitelisting `.env.example` and `.env.production.example`.
2. Sanitized test fixture secrets in `DedicatedVirtualAccountTest.php` and `FinityPayWebhookTest.php` to prevent entropy scanner false positives.

---

## 3. Action Items Required from the Frontend / DevOps Team

Please follow these 4 steps to close out the GitGuardian incident:

### Step 1: Rotate / Invalidate the Email Password (CRITICAL)
If the flagged address was a live email account in cPanel, Google Workspace, or your SMTP provider:
1. Log into your mail administrator dashboard immediately.
2. If the flagged string was used as the actual password, **change it immediately** to a newly generated random secret.
3. If this email was only a fictitious placeholder, verify that no mailbox exists for that address.

### Step 2: Commit and Push Sanitized Frontend Files
Run the following commands in `korak-frontend`:
```bash
git add src/features/social-media/api.ts src/features/social-media/MaskedDeliverableCard.test.tsx
git commit -m "fix(security): sanitize mock deliverable credentials and remove company email from test fixtures"
git push origin main
```

### Step 3: Resolve Alert in GitGuardian
1. Open the GitGuardian notification email and click **Fix This Secret Leak** (or visit the GitGuardian dashboard).
2. Select the incident for `bluxtechnologies/korak-frontend`.
3. Mark the resolution status as:
   - **"Revoked"** (if the credential existed and has been rotated), OR
   - **"False Positive / Test Credential"** (if the credential never had access to a live mailbox).

### Step 4 (Optional): Rewrite Git History if Repository is Public
If the repository is public or shared externally, GitGuardian and GitHub Secret Scanning keep past commits indexed. To remove it completely from historical commits:
```bash
# Using git-filter-repo (recommended)
pip install git-filter-repo
git filter-repo --replace-text <(echo "OLD_LEAKED_SECRET==>mock_temp_pass_9821")
git push origin main --force
```
*(Note: If the repository is private and the credential is confirmed revoked/rotated, rewriting git history is optional; closing the incident in GitGuardian is sufficient).*

---

## 4. Best Practices to Prevent Future Leaks

1. **Never use company domains in mock data or tests:** Always use `@example.com`, `@example.org`, or `@test.invalid`.
2. **Never hardcode credentials in fallback catch blocks:** If an API endpoint fails, throw an `ApiClientError` or return empty placeholders rather than synthetic passwords.
3. **Keep `.env` files strictly ignored:** Ensure `.gitignore` covers `.env*` and only allows `.env.example`.
4. **Run Pre-Commit Checks:** Run `git-secrets` or `gitleaks` in CI/CD pipelines to catch high-entropy strings before code merges into `main`.
