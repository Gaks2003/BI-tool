# GitHub Pages Setup Instructions

## 🔧 **Enable GitHub Pages**

1. Go to your repository: https://github.com/Gaks2003/BI-tool
2. Click **Settings** tab
3. Scroll to **Pages** section
4. Under **Source**, select: **GitHub Actions**
5. Save the settings

## 📋 **Push Updated Workflow**

```bash
cd "f:\New folder\project\BI project"
git add .
git commit -m "Fix GitHub Pages deployment with proper permissions"
git push origin main
```

## ✅ **What This Fixes**

- Uses modern GitHub Pages deployment method
- Adds proper permissions for Pages deployment
- Removes deprecated peaceiris/actions-gh-pages
- Uses official GitHub Actions for Pages

## 🚀 **After Setup**

Your site will be available at: https://gaks2003.github.io/BI-tool/