# 研途无阻

微信小程序「研途无阻」：面向考研考生的院校 / 专业查询、题库练习、模拟考试和 AI 择校工具。

原先使用微信云开发。当前已改为 **本地 Node.js 后端 + SQLite**，小程序通过 HTTP 调用接口。AppID：`wx63b409c1ca6524b5`。

> 本小程序仅作开发使用，实际考研信息并非真实数据。本项目为学习辅助工具，**不是**教育部或高校官方招生平台，不提供报名、缴费与录取服务。页面中的院校、专业、招生人数等数据仅供参考，报考前请以各高校研究生招生网最新简章为准。

---

## 功能一览

| 模块 | 说明 |
| --- | --- |
| 首页 | 倒计时、搜索入口、滚动声明、宫格入口、模拟考试 / AI 择校、热门院校 |
| 信息库 | 院校库、专业库、热门院校、AI 择校 |
| 题库 | 专项训练、错题集、排行榜、模拟考试 |
| 我的 | 登录、基本信息、使用说明、关于我们 |
| AI 择校 | 按本科层次、**模拟分数（初试总分 100–500）**、专业、地区生成冲刺 / 稳妥 / 保底报告 |
| 模拟考试 | 20 题、30 分钟，交卷后可看排名 |

首页声明条会左右滚动，点进去可查看完整使用说明与免责声明。

---

## 技术栈

- **小程序**：微信原生（WXML / WXSS / JS）
- **后端**：Node.js 18+、Express
- **数据库**：SQLite（`better-sqlite3`）
- **鉴权**：JWT；本地开发可用稳定 openid，正式环境可走微信 `jscode2session`
- **AI**：DeepSeek Chat Completions（可选，未配置 Key 时走规则推荐）

---

## 目录结构

仓库根目录 `D:\yantuwuzu` **就是小程序工程**（有 `app.js` 的那一层），不要再套一层子目录。

```
yantuwuzu/
├── app.js / app.json / app.wxss     小程序入口与全局样式
├── pages/                           页面
├── components/                      组件（如首页宫格）
├── images/                          图片资源
├── utils/
│   ├── api.js                       请求封装（POST /fn/:name）
│   └── config.js                    BASE_URL，默认 http://127.0.0.1:3000
├── server/                          本地后端
│   ├── src/                         Express 入口、业务 handlers、DeepSeek
│   ├── data/yantuwuzu.db            SQLite 数据文件（首次启动生成）
│   └── .env                         环境变量（不要提交真实密钥）
├── database/                        种子数据（JSON / NDJSON）
├── 启动后端.bat                      Windows 一键启动
├── 说明.txt                         简短启动备忘
└── README.md                        本文档
```

`cloudfunctions/` 是旧云函数对照，小程序已不再调用。打包时会忽略 `server`、`database`、`cloudfunctions` 等目录。

---

## 快速开始

### 1. 启动后端

需要 Node.js **18 或以上**。

**方式 A（推荐）**：双击仓库根目录的 `启动后端.bat`。

**方式 B**：在仓库根目录执行：

```bash
npm start
```

会自动进入 `server/` 并启动。若 `3000` 端口被旧进程占用，启动脚本会先结束该进程再监听。

看到下面两行表示成功，**这个窗口不要关**：

```
研途无阻本地后端已启动: http://127.0.0.1:3000
```

健康检查：浏览器打开 [http://127.0.0.1:3000/health](http://127.0.0.1:3000/health)，应返回：

```json
{"ok":true,"service":"yantuwuzu-server"}
```

首次在 `server/` 目录需要安装依赖（`启动后端.bat` 会自动执行）：

```bash
cd server
copy .env.example .env
npm install
npm start
```

### 2. 打开小程序

1. 用微信开发者工具打开 **`D:\yantuwuzu`**（必须是有 `app.js` 的目录）。
2. 详情 → 本地设置 → 勾选 **「不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」**。
3. 编译运行。

### 3. 真机调试

手机上的 `127.0.0.1` 是手机自己，连不到电脑。把 `utils/config.js` 改成电脑的局域网 IP，例如：

```js
module.exports = {
  BASE_URL: 'http://192.168.1.8:3000'
};
```

手机和电脑需同一 Wi-Fi，并在开发者工具中同样勾选不校验合法域名。

---

## 配置说明

文件：`server/.env`（可从 `server/.env.example` 复制）。

| 变量 | 说明 |
| --- | --- |
| `PORT` | 后端端口，默认 `3000` |
| `JWT_SECRET` | 签发登录 token |
| `WECHAT_APPID` | 小程序 AppID |
| `WECHAT_APPSECRET` | 填写后走微信登录；不填则使用本地稳定 openid |
| `FORCE_SEED` | 设为 `1` 时启动会重新导入 `database/` 种子 |
| `DEEPSEEK_API_KEY` | DeepSeek API Key；不填则 AI 择校用规则报告 |
| `DEEPSEEK_MODEL` | 默认 `deepseek-chat` |
| `DEEPSEEK_BASE_URL` | 默认 `https://api.deepseek.com/chat/completions` |

不要把真实 Key 提交进 Git。

---

## AI 择校

页面：`pages/AI_choice`。接口：`POST /fn/aiChoice`。

填写内容：

1. 本科层次（可选）
2. **模拟分数**：考研初试总分，范围 **100–500**
3. 目标专业（必填，如「软件工程」）
4. 意向地区（可留空表示不限）

后端会从院校库筛出可报考方向，再按分数分档：

| 模拟分数 | 大致策略 |
| --- | --- |
| ≥ 360 | 985 冲刺，211 稳妥，普通校保底 |
| 330–359 | 仍以 985 / 211 为主，普通校保底 |
| 300–329 | 211 作为冲刺，普通校拆成稳妥 / 保底 |
| < 300 | 不再主推顶尖校，以 211 冲刺、普通校稳妥 / 保底 |

配置了 `DEEPSEEK_API_KEY` 后，会把同一批学校交给 DeepSeek 写报告（禁止编造库外学校）。未配置或调用失败时，返回规则生成的报告，右上角显示「规则推荐」。

申请 Key：https://platform.deepseek.com/  
填入 `server/.env` 后**重启后端**。

---

## 数据与导入

启动时若数据库不存在或 `FORCE_SEED=1`，会从 `database/` 导入：

- 院校 `yx`、专业方向 `zy_more`、招生明细 `yx_more`
- 专业目录 `zy`、题库 `questions`、热门院校 `remenyuanxiao`

当前完整库大约：院校 877、专业目录 1304、招生方向约 17 万条。

用户、排行榜、错题集在使用过程中写入 `server/data/yantuwuzu.db`。

重新导入步骤：把 JSON 放到 `database/` 对应文件 → `server/.env` 设 `FORCE_SEED=1` → `npm start` → 导入完成后改回 `FORCE_SEED=0`。

---

## 后端接口

小程序统一调用：

```
POST {BASE_URL}/fn/{name}
Content-Type: application/json
Authorization: Bearer <token>（登录后）
```

成功时响应体即原来云函数的 `res.result` 形状。

| name | 用途 |
| --- | --- |
| `login` | 登录，返回 openid / token |
| `getschool` | 院校列表（分页、地区 / 隶属 / 层次 / 搜索） |
| `getschoolDetail` | 院校详情 |
| `getProfessions` | 专业列表 |
| `getProfessionDetail` | 专业详情 |
| `getMenleiList` / `getYijixuekeList` / `getMajors` | 门类、一级学科、招生专业 |
| `searchSchools` | 按专业 + 地区搜可报考方向 |
| `aiChoice` | AI 择校 |
| `loadSchools` | 热门院校 |
| `getQuestions` / `getRandomQuestions` / `getQuestionDetails` | 题库 |
| `submitScore` / `getChartData` | 交卷与排行 |
| `getCuoti` / `addCuoti` / `removeCuoti` | 错题集 |
| `uploadUserInfo` | 上传昵称头像 |
| `getAdditionalDetails` | 按专业代码补招生明细 |

另有 `GET /health` 供检查服务是否存活。

---

## 常见问题

**首页按钮点不了 / 页面转圈**  
先确认后端窗口还在、health 能打开。开发者工具必须勾选不校验合法域名。真机要把 `BASE_URL` 改成电脑局域网 IP。

**`EADDRINUSE` 端口被占用**  
多半是后端已经在跑。打开 health 能通就不必再启。现在 `npm start` 会先释放 3000 端口。

**AI 择校一直是「规则推荐」**  
未填写或未重启加载 `DEEPSEEK_API_KEY`。无 Key 时仍会出分档学校，只是没有大模型长文。

**院校库是空的**  
检查 `database/` 是否有完整 JSON，并用 `FORCE_SEED=1` 重新导入。

**微信开发者工具打开了错误目录**  
必须打开 `D:\yantuwuzu`，不要打开已经删除的嵌套子目录。

---

## 声明

1. 本小程序仅作开发使用，实际考研信息并非真实数据。
2. 本小程序为学习辅助工具，非官方招生平台，不提供报名与缴费。
3. 院校、专业与录取相关数据仅供参考，最终以各高校研究生招生网公布为准。
4. AI 择校按模拟分数和院校库估算，不构成录取承诺。
5. 模拟考试成绩只用于练习和排名，与真实考研成绩无关。
