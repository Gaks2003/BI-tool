# Enable GitHub Pages

## 🔧 **Manual Setup (Required)**

1. Go to: https://github.com/Gaks2003/BI-tool/settings/pages
2. Under **Source**, select: **GitHub Actions**
3. Click **Save**

## 📋 **Then Push Updated Workflow**

```bash
cd "f:\New folder\project\BI project"
git add .
git commit -m "Enable GitHub Pages auto-setup"
git push origin main
```

## ⚠️ **Important**

You MUST manually enable Pages in repository settings first, then the workflow will work automatically.