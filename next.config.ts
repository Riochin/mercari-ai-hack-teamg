import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静的なモックなので画像最適化は無効化（生の PNG をそのまま配信）
  images: { unoptimized: true },
  // ホームディレクトリの yarn.lock を誤検出しないよう、このリポジトリをルートに固定
  turbopack: { root: __dirname },
};

export default nextConfig;
