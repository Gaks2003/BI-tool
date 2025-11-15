# Upload Instructions for GitHub

## 📤 **Upload to GitHub Repository**

### **Step 1: Initialize Git Repository**
```bash
cd "f:\New folder\project\BI project"
git init
git add .
git commit -m "Initial commit: Modern BI Dashboard with AI Assistant"
```

### **Step 2: Connect to GitHub Repository**
```bash
git remote add origin https://github.com/Gaks2003/BI-tool.git
git branch -M main
git push -u origin main
```

### **Step 3: Set up GitHub Secrets (for deployment)**
1. Go to your GitHub repository: https://github.com/Gaks2003/BI-tool
2. Navigate to Settings → Secrets and variables → Actions
3. Add these repository secrets:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### **Step 4: Enable GitHub Pages**
1. Go to Settings → Pages
2. Source: Deploy from a branch
3. Branch: gh-pages
4. Folder: / (root)

## 🚀 **Alternative: GitHub Desktop**
1. Open GitHub Desktop
2. File → Add Local Repository
3. Choose: "f:\New folder\project\BI project"
4. Publish repository to GitHub.com
5. Repository name: BI-tool
6. Push to origin

## ✅ **Verification**
After upload, your project will be available at:
- Repository: https://github.com/Gaks2003/BI-tool
- Live Site: https://gaks2003.github.io/BI-tool/ (after GitHub Actions deployment)

## 🔧 **Troubleshooting**
If you get authentication errors:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

For HTTPS authentication, use a Personal Access Token instead of password.