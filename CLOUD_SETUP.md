# 云端登录与数据同步配置

## 1. 创建 Supabase 项目

1. 打开 [https://supabase.com](https://supabase.com) 注册并新建项目  
2. 进入 **SQL Editor**，粘贴并执行 `supabase/schema.sql`  
3. 在 **Project Settings → API** 复制：
   - **Project URL** → `SUPABASE_URL`
   - **service_role** key（保密）→ `SUPABASE_SERVICE_ROLE_KEY`

## 2. 配置 Vercel 环境变量

在 Vercel 项目 **Settings → Environment Variables** 添加：

| 变量名 | 值 |
|--------|-----|
| `ACCESS_PASSWORD` | `06251215`（或你自定义的密码） |
| `AUTH_SECRET` | 任意 32 位以上随机字符串 |
| `SUPABASE_URL` | Supabase 项目 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role 密钥 |

保存后 **重新部署** 一次。

## 3. 使用说明

- Aaron / Oscar 打开网站后输入密码登录  
- 课表保存在 Supabase，两人看到同一份数据  
- 修改后约 **1.5 秒** 自动上传云端  
- 每 **60 秒** 自动拉取对方更新（最多约 1 分钟延迟）  
- 右上角可 **退出登录**

## 4. 本地调试（可选）

```bash
cp .env.example .env.local
# 编辑 .env.local 填入真实值
npx vercel dev
```

`npm run dev` 仅前端，无法调用 `/api`；完整功能请用 `vercel dev`。
