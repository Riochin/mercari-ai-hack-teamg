@AGENTS.md

# AIおまかせ値下げ交渉 Agent（メルカリ社内ハッカソン）

購入者・出品者それぞれの「交渉AI」が本人の代わりに値下げ交渉し、双方が合意した金額だけを
人間が最終確認する体験を見せる **モックアプリ**。実DB・実決済はなく、状態は localStorage +
インメモリ（Zustand）で完結する。

## 開発前に必ず読むもの（Source of Truth）

- **`reference/spec.md`** … 機能仕様の一次情報。3画面の役割・フロー・MVP/Stretch・
  **共通データモデル（4章）** がここにある。データの形を変えるときは必ずここを起点にする。
- **`reference/mercari-negotiation-battle.html`** … 元のバニラJSプロトタイプ。
  **デザインシステム（配色・タイポ・コンポーネント・演出）の唯一の基準**。
  UIを足す・直すときは新しい配色やコンポーネントを発明せず、まずここを参照する。
  ※ 巨大な base64 画像が1行含まれるので、`Read` は範囲指定 or `grep`/`awk` で読むこと。

## デザインシステム（厳守）

「作り直さず、コピー→拡張」が基本方針。プロトタイプのCSSは [`app/globals.css`](app/globals.css)
にほぼ全量移植済み。**新しい色・フォントを増やさない。**

- カラートークンは `:root` の CSS 変数のみ（`--red #FF0211` / `--blue #0A7CFF` /
  `--green #00A968` / `--ink` / `--gray-1..2` / `--line` / `--bg-gray` など）。
- フォントは `Noto Sans JP`（400/500/700/900）のみ。`next/font` で読み込み済み。
- 既存コンポーネントのクラスをそのまま再利用する：カード / 丸ボタン / チャット吹き出し /
  7段階ドット選択（`.trait-*`）/ 綱引きバー（`.tug-*`）/ タイピング演出 / 合意スタンプ
  （`.agree-stamp`）。出品者UI（③）用のクラスは globals.css 末尾に同じ流儀で追記してある。
- チャット吹き出しの視点反転：`.log.seller-view` を親に付けると出品者=右/赤・購入者=左/グレー。

## アーキテクチャ

- Next.js 16（App Router / TypeScript / Turbopack）。UIは1つの `"use client"` ページ
  [`app/page.tsx`](app/page.tsx) にまとめ、ルーティングではなく**ビュー状態機械**で画面を切替える
  （プロトタイプ同様の重ね合わせ＋スライド演出を保つため）。
- 状態: [`lib/store.ts`](lib/store.ts)（Zustand + `persist` で localStorage 永続化）。
  `persona` / `sessions` / `notifications` を保持。
- 交渉ロジック: [`lib/negotiation.ts`](lib/negotiation.ts)（プロトタイプの数式をTS移植。
  タイプ判定・セリフ生成・ターン生成）。
- 型: [`lib/types.ts`](lib/types.ts) が spec 4章の共通データモデル
  （`PersonaProfile` / `NegotiationSession` / `Turn` / `AppNotification`）。
- 画面: [`components/screens/`](components/screens/) … Product / Profile(診断) /
  BattleSheet(設定+交渉バトル) / SellerNotify(お知らせ) / SellerReview(合意確認)。

## 状態遷移（spec 4.2）

`in_progress → agreed →`（購入者がリクエスト）`→ seller_review →`（出品者が）
`completed | declined`。合意できなければ `stalled`。
購入者が `seller_review` にした瞬間に出品者向け `AppNotification` を1件発行する
（[`lib/store.ts`](lib/store.ts) の `requestPurchase`）。

## よく使うコマンド

`make help` を参照（`make dev` / `make build` / `make typecheck` / `make preview` など）。
