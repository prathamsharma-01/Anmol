# Security Guidelines

## 🔐 Handling Secrets and Credentials

### Environment Variables
All sensitive credentials MUST be stored in `.env` files, which are ignored by git:
- **Never commit** `.env` files to the repository
- Use `.env.example` as a template (with placeholder values only)
- Copy `.env.example` to `.env` and fill in your actual credentials locally

### Required Environment Variables

#### Backend (api-gateway)
```bash
MONGODB_URI=mongodb://127.0.0.1:27017
PORT=8000
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

#### Frontend (customer-app - optional)
```bash
VITE_RAZORPAY_KEY_ID=your_razorpay_public_key
VITE_API_URL=http://localhost:8000
```

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd openwork-platform
   ```

2. **Backend Setup**
   ```bash
   cd backend/api-gateway
   cp .env.example .env
   # Edit .env and add your actual credentials
   npm install
   node server.js
   ```

3. **Frontend Setup**
   ```bash
   cd frontend/customer-app
   cp .env.example .env  # Optional
   npm install
   npm run dev
   ```

### Getting Razorpay Credentials

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to **Settings > API Keys**
3. Generate **Test Mode** keys for development
4. Copy `Key ID` and `Key Secret` to your `.env` file
5. **Never use LIVE keys in development!**

### If Credentials Are Exposed

If you accidentally commit secrets:

1. **Immediately rotate/revoke** the exposed credentials:
   - Razorpay: Dashboard > API Keys > Regenerate
   - MongoDB: Change passwords in MongoDB Atlas/local

2. **Remove from git history**:
   ```bash
   # Using BFG Repo Cleaner (recommended)
   java -jar bfg.jar --delete-files .env
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push --force

   # Or using git-filter-repo
   git filter-repo --path .env --invert-paths
   ```

3. **Update all team members** to pull the cleaned history

### Pre-commit Hooks (Optional)

Install git-secrets to prevent committing secrets:

```bash
# Install git-secrets
brew install git-secrets  # macOS
# Or download from https://github.com/awslabs/git-secrets

# Setup in repo
git secrets --install
git secrets --register-aws
git secrets --add 'rzp_(test|live)_[A-Za-z0-9]+'
git secrets --add '[0-9a-zA-Z]{24,}'  # Generic secrets
```

### What NOT to Commit
- ❌ `.env` or `.env.local` files
- ❌ API keys, tokens, passwords in code
- ❌ Private keys (`.pem`, `.key`, `.p12`)
- ❌ Database connection strings with credentials
- ❌ OAuth client secrets
- ❌ Webhook signing secrets
- ❌ Real user PII (names, emails, phone numbers)

### What TO Commit
- ✅ `.env.example` with placeholder values
- ✅ Documentation on required environment variables
- ✅ Code that reads from `process.env.VARIABLE_NAME`
- ✅ `.gitignore` with `.env` patterns

## 🚨 Reporting Security Issues

If you discover a security vulnerability, please email [your-email@example.com] instead of opening a public issue.

## 📋 Security Checklist

Before pushing to GitHub:
- [ ] No `.env` files in commits
- [ ] All secrets use environment variables
- [ ] `.env.example` files present and documented
- [ ] `.gitignore` updated with secret patterns
- [ ] Hardcoded credentials removed from code
- [ ] Git history scanned for leaks
- [ ] Test keys used (not production keys)
- [ ] README.md documents environment setup

---

**Last Updated**: October 31, 2025
