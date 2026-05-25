# 云端登录与数据同步（已自动配置）

本项目使用 **Vercel Blob** 存储共享课表，无需单独注册 Supabase。

## 登录

- 地址：https://course-scheduler-kohl.vercel.app
- 密码：`06251215`（Aaron / Oscar 共用）
- 登录后课表自动云端保存，约 1.5 秒上传，每 60 秒同步他人修改

## 环境变量（已在 Vercel 配置）

| 变量 | 说明 |
|------|------|
| `ACCESS_PASSWORD` | 登录密码 |
| `AUTH_SECRET` | 登录会话签名 |
| `BLOB_READ_WRITE_TOKEN` | Blob 存储（创建 Blob 时自动注入） |

## 本地调试

```bash
npx vercel env pull
npx vercel dev
```

`npm run dev` 仅前端，无法使用登录 API。
