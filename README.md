# AIおまかせ値下げ交渉 Agent

メルカリ社内ハッカソン（AI Agent Hackathon for PM）向けのモックアプリ。
購入者・出品者それぞれの **交渉AI** が本人の代わりに値下げ交渉し、
双方が合意した金額だけを人間が最終確認する体験をデモする。

> **課題**：メルカリの値下げ交渉はコメント欄でのやり取りが心理的ハードル（催促されている感じ・
> 断りづらい・相場がわからない）になっている。
> **提案**：AI同士が交渉し、合意額だけを人間が承認する「AIおまかせ値下げ交渉」。

実DB・実決済は使わず、状態は **localStorage + インメモリ（Zustand）** で完結する。

## 3つの画面（1つのアプリで繋がる）

| # | 画面 | 内容 |
|---|------|------|
| ① | プロフィール（性格診断） | 7段階×6問で購入者の交渉AIの性格（4タイプ）を診断 |
| ② | 購入者UI | 商品ページ → 交渉バトル（綱引き・タイピング・合意スタンプ）→ 合意額の確認 → 購入リクエスト |
| ③ | 出品者UI | お知らせ通知 → 合意額の確認カード → やりとりの展開（視点反転）→ 承認 / 見送る |

## セットアップ & 起動

```bash
make install   # 依存関係をインストール
make dev       # 開発サーバ起動 → http://localhost:3000
```

`make` を引数なしで実行するとコマンド一覧（help）が出る。主なもの：

| コマンド | 説明 |
|----------|------|
| `make dev` | 開発サーバを起動（http://localhost:3000） |
| `make build` | 本番ビルド |
| `make preview` | 本番ビルドしてそのまま起動（デモ確認用） |
| `make typecheck` | 型チェックのみ（`tsc --noEmit`） |
| `make clean` | ビルド成果物（`.next` / `out`）を削除 |
| `make reset` | `clean` に加えて `node_modules` も削除 |

## デモの流れ（同一アプリ内で一気通貫）

1. 下部ナビ **マイページ** → 性格診断に回答 → タイプ確定（例：紳士交渉人 🤵）
2. 商品ページ **「AIに値下げ交渉してもらう」** → 希望額を入力 → **交渉バトル開始**
3. AI同士の交渉を再生 → **合意スタンプ** → **「この金額で購入をリクエスト」**
4. **「お知らせ（出品者）を見る」** → 未読通知をタップ
5. **合意額の確認カード**（出品価格・最低希望額との差分）→ **やりとりを見る** で展開
6. **「この金額で承認する」** → 🎉 取引成立

## 技術構成

- **Next.js 16**（App Router / TypeScript / Turbopack）
- **Zustand**（`persist` で localStorage 永続化）
- 素の CSS（プロトタイプのデザインシステムを `app/globals.css` に移植）

```
app/            layout / globals.css（デザインシステム）/ page.tsx（ビュー状態機械）
components/      PhoneChrome / TraitScale / ChatBubble / icons / screens/*
lib/            types.ts（共通データモデル）/ store.ts / negotiation.ts
public/         dorodango.png（商品画像）
reference/      spec.md（機能仕様）/ mercari-negotiation-battle.html（元プロトタイプ）
```

## 参照ドキュメント

- 機能仕様・共通データモデル：[`reference/spec.md`](reference/spec.md)
- デザインシステムの基準（元プロトタイプ）：`reference/mercari-negotiation-battle.html`
- 開発ガイド（AI/Claude Code 向け）：[`CLAUDE.md`](CLAUDE.md)
