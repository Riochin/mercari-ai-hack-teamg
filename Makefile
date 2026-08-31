# AIおまかせ値下げ交渉 Agent — 開発用コマンド
# 使い方: `make <target>`（引数なしの `make` は help を表示）

.DEFAULT_GOAL := help
.PHONY: help install dev build start preview typecheck clean reset

help: ## このヘルプを表示
	@echo "AIおまかせ値下げ交渉 Agent — make targets"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

install: ## 依存関係をインストール（npm ci があれば ci、なければ install）
	@if [ -f package-lock.json ]; then npm ci; else npm install; fi

dev: ## 開発サーバを起動（http://localhost:3000）
	npm run dev

build: ## 本番ビルド
	npm run build

start: ## ビルド済みアプリを本番モードで起動
	npm run start

preview: build start ## 本番ビルドしてそのまま起動（デモ確認用）

typecheck: ## 型チェックのみ（tsc --noEmit）
	npx tsc --noEmit

clean: ## ビルド成果物を削除（.next / out）
	rm -rf .next out

reset: clean ## clean に加えて node_modules も削除
	rm -rf node_modules
