[README.md](https://github.com/user-attachments/files/22423780/README.md)
# 對帳系統 MVP (最終修正版)

支援雲端部署（Render + Vercel）。

## 🚀 部署步驟

### 1. 上傳到 GitHub
1. 解壓縮專案
2. 在 GitHub 建立 repo `reconcile-mvp`
3. 上傳全部檔案（包含 `render.yaml`）

### 2. 後端部署到 Render
- New Web Service → 連結 GitHub
- Render 會自動讀取 `render.yaml`
- 部署成功後，你會拿到一個網址，例如：
  ```
  https://reconcile-api.onrender.com
  ```

測試：開啟 `https://reconcile-api.onrender.com/docs`

### 3. 前端部署到 Vercel
- New Project → 選 `frontend` 資料夾
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- 環境變數：
  - 名稱：`VITE_API_URL`
  - 值：Render API 網址，例如 `https://reconcile-api.onrender.com`

成功後，你會拿到前端網址，例如：
```
https://reconcile-mvp.vercel.app
```

---
