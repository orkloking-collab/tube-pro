# Tube Pro — 发布模板（中文）

每个视频都用这些模板。每次只需要改 **[方括号]** 里的 3 处，其它内容保持不变。

---

## 1. Facebook 帖子文案（中文）

```
[视频标题] — 完整高清免费观看

现在就能看完整 [影片 / 剧集 / 课程]。新内容第一时间发布在我们的 Telegram 频道 —
免费加入，无需注册：https://t.me/duzshopi

课程与视频都在下方链接。
```

**帖子中附上的链接：** `https://yourdomain.com/?fb=1`

> `?fb=1` 会为 Facebook 流量隐藏 18+ 赞助区块，这样 Meta 的爬虫看到的是干净页面。
> Facebook 帖子必须**只放一个链接** —— 只能放落地页。绝不要直接放 t.me 链接。

---

## 2. 换着写（轮流使用，避免看起来像复制粘贴）

1. `刚上传：[视频标题] —— 免费高清观看。`
2. `Tube Pro 新内容：[视频标题]。完整版见下方链接。`
3. `[视频标题] 已上线。免费观看，无需注册。`
4. `不要错过 [视频标题] —— 完整高清，免费。`
5. `全新上线：[视频标题]。详情见频道。`

每条帖子都加上这句结尾：
`更多免费内容 → Telegram：https://t.me/duzshopi`

---

## 3. YouTube 标题 + 简介（中文）

**标题：**
```
[视频标题] | 完整高清 | Tube Pro
```

**简介：**
```
[视频标题] —— 完整高清视频。

▶ 完整视频与免费课程：https://yourdomain.com/
▶ Telegram（第一时间获取新内容）：https://t.me/duzshopi

Tube Pro —— 电影、剧集与 100+ 门免费视频课程。
免费观看。无需注册。无需付费。

#TubePro #免费电影 #在线课程
```

---

## 4. Telegram 频道帖子（中文）

```
🎬 [视频标题] —— 现已上线

✅ 完整高清
✅ 免费观看
✅ 无需注册

👉 观看：https://yourdomain.com/
📢 持续更新：https://t.me/duzshopi
```

---

## 5. 网页标题 + 搜索描述

**页面标题：**
```
[视频标题] | Tube Pro —— 免费高清观看
```

**搜索描述（meta description）：**
```
免费高清观看 [视频标题]。新内容首先发布在 Telegram。电影、剧集与 100+ 门
免费视频课程 —— 无需注册。
```

---

## 6. TikTok / WhatsApp / Instagram 文案（中文）

```
免费高清 🎬 [视频标题]
完整视频 👉 https://yourdomain.com/
Telegram 👉 https://t.me/duzshopi
```

> TikTok / WhatsApp / Instagram 可以直接用普通域名（不需要加 `?fb=1`）。

---

## 必须遵守的规则（避免被封）

- **每条 Facebook 帖子只放一个链接**（落地页）。不要放 t.me 链接，也不要直接放 blogspot 链接。
- **轮流更换开头句** —— 多个帖子/群组使用完全相同的文案会触发垃圾内容标记。
- **不要在几分钟内向 10 个群组重复粘贴同一链接** —— 这是触发验证码的首要原因。
- **永远不要点击自己的广告** —— 请到后台查看收益。
- 落地页必须保持可访问 —— 一旦下线，所有旧帖子的链接都会同时失效。
- 落地页的 `og:title` / `og:description` 要与帖子文案保持一致，链接预览才会正常。

---

## 落地页里需要替换的地方（每个视频一次，可选）

在 `index.html` 和 `zh.html` 中：

| 标签 | 当前内容 | 替换为 |
|---|---|---|
| `<title>` | Tube Pro — Movies, Series & Free Video Courses | `[视频标题] | Tube Pro` |
| `og:title` | Tube Pro — Movies, Series & Free Video Courses | `[视频标题] —— 免费高清` |
| `og:description` | ……new drops first on Telegram…… | 用你帖子第一行文案 |

其它内容全部保持原样 —— 设计、按钮和广告位永远不需要改动。
