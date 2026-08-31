"use client";

import { useEffect, useState } from "react";
import { Dango } from "./Dango";
import { yen } from "@/lib/negotiation";

export interface PriceReq {
  name: string;
  listPrice: number;
  /** 合意額。希望価格に初期挿入する */
  agreedPrice: number;
  photo?: string;
  sphere?: string;
  matte?: boolean;
  noimage?: boolean;
  onSubmit: () => void;
}

const round10 = (n: number) => Math.round(n / 10) * 10;

/**
 * メルカリ既存の「値下げを依頼する」ボトムシートを忠実に再現。
 * 商品情報はモック内のものを使い、希望価格には合意額を差し込む。
 */
export function PriceRequestSheet({ req, onClose }: { req: PriceReq | null; onClose: () => void }) {
  const [price, setPrice] = useState(0);
  useEffect(() => {
    if (req) setPrice(req.agreedPrice);
  }, [req]);

  const open = !!req;
  const lo = req ? round10(req.listPrice * 0.8) : 0;
  const hi = req ? req.listPrice - 1 : 0;
  // 合意額そのままなら青字＋AIヒント、少しでも変えたら黒に戻す
  const pristine = !!req && price === req.agreedPrice;

  const submit = () => {
    if (!req) return;
    req.onSubmit();
    onClose();
  };

  return (
    <>
      <div className={"sheet-backdrop" + (open ? " open" : "")} style={{ zIndex: 39 }} onClick={onClose} />
      <div className={"sheet pr-sheet" + (open ? " open" : "")}>
        <div className="pr-header">
          <button className="sheet-close" onClick={onClose} aria-label="閉じる">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="#222" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
          <span className="title">値下げを依頼する</span>
        </div>

        {req && (
          <div className="pr-content">
            <div className="pr-lead">あなたが購入したい価格を登録しませんか？</div>
            <p className="pr-desc">
              出品者が承諾すると「お知らせ」へ通知が届きます。購入に進んでください。
            </p>
            <div className="pr-notes">
              ※出品者から24時間以内に回答がきます
              <br />
              ※承諾された場合、24時間以内に購入してください
            </div>
            <div className="pr-caution">承諾後に購入しない場合、利用制限がかかることがあります</div>
            <div className="pr-help">
              値下げ依頼について <span className="q">?</span>
            </div>

            <div className="pr-divider" />

            <div className="pr-item">
              <div className="pr-thumb">
                {req.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={req.photo} alt={req.name} />
                ) : req.noimage ? (
                  <div className="pr-thumb-noimg">NO<br />IMAGE</div>
                ) : (
                  <Dango id={"pr-" + req.name} color={req.sphere || "#B7B2A8"} matte={req.matte} />
                )}
              </div>
              <div className="pr-item-info">
                <div className="pr-item-name">{req.name}</div>
                <div className="pr-item-price">
                  <b>{yen(req.listPrice)}</b> 送料込み
                </div>
              </div>
            </div>

            <div className="pr-divider" />

            <div className="pr-field-row">
              <span className="pr-field-label">希望価格</span>
              {pristine && <span className="pr-ai-note">AIが見つけた合意額です</span>}
            </div>
            <div className={"pr-input" + (pristine ? " ai" : "")}>
              <span className="pr-yen">¥</span>
              <input
                type="number"
                value={price}
                step={10}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
            <div className="pr-range">
              希望できる価格は{yen(lo)} - {yen(hi)}です
            </div>

            <button className="pr-submit" onClick={submit}>
              値下げを依頼する
            </button>
          </div>
        )}
      </div>
    </>
  );
}
