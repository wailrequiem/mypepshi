# GitHub Setup Guide

## ✅ What's Already Done
- ✅ Git repository initialized
- ✅ Branch renamed to `main`
- ✅ `.gitignore` file created
- ✅ All files staged for commit

## 🔧 Step 1: Configure Git (Required - Do This First!)

Open a terminal in your project folder and run these commands with YOUR information:

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

**Example:**
```bash
git config --global user.name "Wail"
git config --global user.email "wail@example.com"
```

## 📝 Step 2: Create Initial Commit

After configuring Git, create your first commit:

```bash
git commit -m "Initial commit: AI-powered peptide recommendation app"
```

## 🌐 Step 3: Create GitHub Repository

1. Go to https://github.com
2. Click the **"+"** icon in the top right
3. Click **"New repository"**
4. Fill in the details:
   - **Repository name**: `mypepshi` (or any name you want)
   - **Description**: "AI-powered peptide recommendation app with facial analysis"
   - **Visibility**: Choose Private or Public
   - ❌ **DO NOT** check "Initialize with README" (we already have files)
   - ❌ **DO NOT** add .gitignore (we already have one)
   - ❌ **DO NOT** choose a license yet (optional, can add later)
5. Click **"Create repository"**

## 🔗 Step 4: Connect to GitHub

After creating the repo, GitHub will show you commands. Use these:

```bash
# Add GitHub as remote
git remote add origin https://github.com/YOUR-USERNAME/mypepshi.git

# Push to GitHub
git push -u origin main
```

**Replace `YOUR-USERNAME` with your actual GitHub username!**

**Example:**
```bash
git remote add origin https://github.com/wail/mypepshi.git
git push -u origin main
```

### If you get authentication errors:

GitHub requires a Personal Access Token (PAT) instead of password:

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: "mypepshi-project"
4. Select scopes:
   - ✅ **repo** (all sub-options)
5. Click **"Generate token"**
6. **COPY THE TOKEN** (you won't see it again!)
7. When prompted for password during `git push`, paste the token

## 🔄 Alternative: Using GitHub Desktop

If you prefer a GUI:

1. Download GitHub Desktop: https://desktop.github.com
2. Open GitHub Desktop
3. File → Add Local Repository
4. Browse to: `C:\Users\wail\Desktop\mypepshi`
5. Click "Publish repository"
6. Choose visibility (Private/Public)
7. Click "Publish"

## 📋 Quick Command Reference

### Check Status
```bash
git status
```

### View Commit History
```bash
git log --oneline
```

### Push Changes (after initial setup)
```bash
git add .
git commit -m "Your commit message"
git push
```

### Pull Latest Changes
```bash
git pull
```

## ⚠️ Important Notes

### Files Excluded from Git (in .gitignore)
- `node_modules/` - Dependencies (will be installed via npm)
- `.env.local` - Environment variables (KEEP THIS SECRET!)
- `dist/` - Build output
- `.temp/` - Supabase temp files

### Sensitive Files - DO NOT COMMIT
- ❌ `.env.local` - Contains API keys
- ❌ Any files with passwords or secrets
- ✅ `.env.example` - Safe to commit (template without real values)

## 🎯 Complete Terminal Commands (Copy-Paste)

Run these in order in your project folder:

```bash
# 1. Configure Git (REPLACE WITH YOUR INFO!)
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"

# 2. Create initial commit
git commit -m "Initial commit: AI-powered peptide recommendation app"

# 3. Add GitHub remote (REPLACE YOUR-USERNAME!)
git remote add origin https://github.com/YOUR-USERNAME/mypepshi.git

# 4. Push to GitHub
git push -u origin main
```

## 🔍 Verify Everything Worked

After pushing, you should see:
1. All your files on GitHub
2. Green "main" branch
3. Commit message visible

Visit: `https://github.com/YOUR-USERNAME/mypepshi`

## 🆘 Troubleshooting

### Problem: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR-USERNAME/mypepshi.git
```

### Problem: "failed to push some refs"
```bash
git pull origin main --rebase
git push -u origin main
```

### Problem: "Authentication failed"
- Use Personal Access Token instead of password
- Or use GitHub Desktop
- Or set up SSH keys

## 📚 Next Steps After Setup

1. **Create README.md** on GitHub
2. **Add collaborators** (if team project)
3. **Set up branch protection** rules
4. **Enable GitHub Actions** (optional CI/CD)
5. **Add topics** to make repo discoverable

## 🎉 Success Checklist

- [ ] Git configured with name and email
- [ ] Initial commit created
- [ ] GitHub repository created
- [ ] Local repo connected to GitHub
- [ ] Code pushed successfully
- [ ] Can view code on GitHub website

---

**Need Help?** 
- Check if git is configured: `git config --list`
- Check remote URL: `git remote -v`
- Check current branch: `git branch`
