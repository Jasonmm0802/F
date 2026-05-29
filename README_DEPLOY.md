# Render 部署指南

本專案已配置好 `render.yaml`，您可以通過 Render 的 **Blueprint** 功能一鍵部署整個系統（包含資料庫、後端 API 和前端 Client）。

## 部署步驟

1. **上傳程式碼到 GitHub/GitLab**:
   確保您已將所有更改提交並推送到您的遠端倉庫。

2. **在 Render 建立新服務**:
   - 登入 [Render 控制台](https://dashboard.render.com/)。
   - 點擊 **"New"** 按鈕，選擇 **"Blueprint"**。
   - 連接您的 GitHub 倉庫。
   - Render 會自動偵測到 `render.yaml` 並列出所有服務。

3. **配置環境變數**:
   - `render.yaml` 已經處理了大部分變數。
   - **JWT_SECRET**: 會自動生成，您也可以在部署後手動修改。
   - **NEXT_PUBLIC_API_URL**: 預設會指向您的 API 服務地址。

4. **資料庫初始化**:
   - 第一次部署時，`render.yaml` 會自動執行 `prisma migrate deploy`。
   - 如果您需要導入測試資料，可以手動在 Render 的 API 服務終端機執行：
     ```bash
     cd server && npm run seed
     ```

## 注意事項

- **資料庫**: 我們已將 Prisma 從 SQLite 切換為 PostgreSQL，因為 Render 的免費版不支援 SQLite 的持久化儲存。
- **冷啟動**: 使用 Render 的免費計畫，服務在一段時間沒人訪問後會進入休眠，第一次訪問時可能需要 30-60 秒啟動。
- **API 地址**: 前端已配置為自動處理 API 地址。

## 已修改/新增的檔案

- `render.yaml`: Render 部署設定檔。
- `.gitignore`: 根目錄 Git 忽略檔案。
- `server/prisma/schema.prisma`: 切換 provider 為 `postgresql`。
- `server/package.json`: 增加 build, start, migrate, seed 腳本。
- `client/src/services/api.ts`: 優化生產環境 API 地址處理。
