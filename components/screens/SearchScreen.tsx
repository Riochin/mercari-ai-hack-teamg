"use client";

import { useState } from "react";
import { StatusBar, BottomNav } from "../PhoneChrome";
import { Dango } from "../Dango";
import { PriceRequestSheet, type PriceReq } from "../PriceRequestSheet";
import { yen } from "@/lib/negotiation";

interface SearchItem {
  id: string;
  name: string;
  price: number;
  /** 商品写真。無い場合は sphere / noimage プレースホルダを描く */
  photo?: string;
  sphere?: string; // 泥だんご球の色（radial-gradient のベース）
  noimage?: boolean;
  isProduct?: boolean; // 元の商品画面（泥だんご）へ戻るカード
  discount?: number; // まとめ交渉での値引き率
  hard?: boolean; // 交渉決裂する頑固な出品者
  matte?: boolean; // 艶消し仕上げ
}

// スクショの検索結果に相当するモックデータ
const ITEMS: SearchItem[] = [
  { id: "d1", name: "【新品未使用】手作りキット 色つき泥だんごをつくろう", price: 666, sphere: "#C9A24B", hard: true },
  { id: "d2", name: "ひかるどろだんご かんたんせいさくキット", price: 499, sphere: "#B7B2A8", discount: 0.1 },
  { id: "d3", name: "うちの6歳児が作った泥だんご 泥だんご", price: 950, sphere: "#8A7A63", matte: true, discount: 0.18 },
  { id: "dorodango", name: "泥だんご", price: 3000, photo: "/dorodango.png", isProduct: true, discount: 0.2 },
  { id: "d5", name: "【合わせ買い割引】磨いて光る泥だんご 磨いて", price: 300, sphere: "#6E6650", matte: true, discount: 0.15 },
  { id: "d6", name: "左官職人が作る 光る泥だんご 一点物 ハンドメイド", price: 2480, sphere: "#C65B6A", hard: true },
  { id: "d7", name: "泥だんご", price: 750, sphere: "#7FA6C9", hard: true },
  { id: "d8", name: "光る泥だんご", price: 2000, noimage: true, hard: true },
  { id: "d9", name: "ピカピカ どろだんご", price: 499, sphere: "#9AA6B0", discount: 0.1 },
];

interface Outcome {
  loading: boolean;
  agreed: boolean;
  finalPrice?: number;
}

const round10 = (n: number) => Math.round(n / 10) * 10;

interface Props {
  unread: number;
  onBack: () => void;
  onOpenProduct: () => void;
  onBell: () => void;
  onMypage: () => void;
}

export function SearchScreen({ unread, onBack, onOpenProduct, onBell, onMypage }: Props) {
  const [step, setStep] = useState<"grid" | "bulk">("grid");
  // 既定で全商品にチェック（デモをすぐ流せるように）
  const [checked, setChecked] = useState<Set<string>>(() => new Set(ITEMS.map((i) => i.id)));
  const [results, setResults] = useState<Record<string, Outcome>>({});
  const [priceReq, setPriceReq] = useState<PriceReq | null>(null);
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selected = ITEMS.filter((i) => checked.has(i.id));

  const startBulk = () => {
    if (selected.length === 0) return;
    setStep("bulk");
    const init: Record<string, Outcome> = {};
    selected.forEach((i) => (init[i.id] = { loading: true, agreed: false }));
    setResults(init);

    // 交渉完了はバラバラの順番で（上から順ではなく）＋1件目まで少し溜める
    selected.forEach((item) => {
      const delay = 2600 + Math.random() * 6800;
      setTimeout(() => {
        const agreed = !item.hard;
        const finalPrice = agreed ? round10(item.price * (1 - (item.discount ?? 0.15))) : undefined;
        setResults((prev) => ({ ...prev, [item.id]: { loading: false, agreed, finalPrice } }));
      }, delay);
    });
  };

  const doneCount = selected.filter((i) => results[i.id] && !results[i.id].loading).length;
  const agreedCount = selected.filter((i) => results[i.id]?.agreed).length;
  const allDone = doneCount === selected.length;

  return (
    <div className="screen">
      {step === "grid" ? (
        <>
          <div className="content">
            <StatusBar />

            <div className="search-head">
              <button className="search-back" onClick={onBack} aria-label="戻る">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M15 5l-7 7 7 7" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="search-bar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="#767676" strokeWidth="1.8" />
                  <path d="M16 16l4 4" stroke="#767676" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <span className="chip">泥だんご<span className="chip-x">✕</span></span>
                <span className="chip">手作り<span className="chip-x">✕</span></span>
              </div>
            </div>

            <div className="filter-row">
              <span className="fpill accent">✨ かんたん絞り込み</span>
              <span className="fpill">個人</span>
              <span className="fpill">新品、未使用</span>
              <span className="fpill">目立った傷や汚れなし</span>
            </div>

            <div className="sort-row">
              <label className="onsale">
                <span className="cbox" />
                販売中のみ
              </label>
              <div className="sort-right">
                <span className="sort-item">↑↓ おすすめ順</span>
                <span className="sort-item">⚙ 絞り込み</span>
              </div>
            </div>

            <div className="grid">
              {ITEMS.map((item) => {
                const isChecked = checked.has(item.id);
                return (
                  <div className="gcard" key={item.id}>
                    <div
                      className="gphoto"
                      onClick={() => item.isProduct && onOpenProduct()}
                      style={{ cursor: item.isProduct ? "pointer" : "default" }}
                    >
                      {item.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.photo} alt={item.name} />
                      ) : item.noimage ? (
                        <div className="noimg">NO IMAGE</div>
                      ) : (
                        <Dango id={"g-" + item.id} color={item.sphere || "#B7B2A8"} matte={item.matte} />
                      )}

                      <button
                        className={"gcheck" + (isChecked ? " on" : "")}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggle(item.id);
                        }}
                        aria-label="選択"
                      >
                        {isChecked && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12l5 5 9-11" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>

                      <span className="gheart">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M12 20s-7-4.4-9.5-9C.8 7.2 2.6 4 6 4c2 0 3.5 1.1 4.3 2.4 0 0 .5.9.7 1.3.2-.4.7-1.3.7-1.3C12.5 5.1 14 4 16 4c3.4 0 5.2 3.2 3.5 7-2.5 4.6-9.5 9-9.5 9z"
                            stroke="#fff"
                            strokeWidth="1.8"
                          />
                        </svg>
                      </span>

                      <span className="gprice">{yen(item.price)}</span>
                    </div>
                    <div className="gname">{item.name}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <button className="bulk-cta" onClick={startBulk}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="8" width="16" height="11" rx="3" stroke="#fff" strokeWidth="1.8" />
              <path d="M12 8V4M9 4h6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="9" cy="13.5" r="1.3" fill="#fff" />
              <circle cx="15" cy="13.5" r="1.3" fill="#fff" />
            </svg>
            まとめてAIに値下げ交渉させる
            {selected.length > 0 && <span className="bulk-count">{selected.length}</span>}
          </button>

          <BottomNav active="home" unread={unread} onBell={onBell} onMypage={onMypage} />
        </>
      ) : (
        <>
          <div className="content">
            <StatusBar />
            <div className="bulk-head">
              <button className="search-back" onClick={() => setStep("grid")} aria-label="戻る">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M15 5l-7 7 7 7" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span className="bulk-title">AIおまかせ一括交渉</span>
            </div>

            <div className="bulk-status">
              {allDone
                ? `交渉完了：${agreedCount}件が成立しました`
                : `あなたのAIが ${selected.length}件を交渉中… （${doneCount}/${selected.length}）`}
            </div>

            <div className="bulk-list">
              {selected.map((item) => {
                const r = results[item.id];
                return (
                  <div className="brow" key={item.id}>
                    <div className="bthumb">
                      {item.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.photo} alt={item.name} />
                      ) : item.noimage ? (
                        <div className="bthumb-noimg">NO<br />IMAGE</div>
                      ) : (
                        <Dango id={"b-" + item.id} color={item.sphere || "#B7B2A8"} matte={item.matte} />
                      )}
                    </div>

                    <div className="binfo">
                      <div className="bname2">{item.name}</div>
                      <div className="bprice-orig">元の価格 {yen(item.price)}</div>

                      {!r || r.loading ? (
                        <div className="bloading">
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                          <span className="bloading-t">交渉中…</span>
                        </div>
                      ) : r.agreed ? (
                        <div className="bresult agreed">
                          <span className="btag ok">交渉成立</span>
                          <span className="bfinal">合意額 {yen(r.finalPrice!)}</span>
                        </div>
                      ) : (
                        <div className="bresult failed">
                          <span className="btag ng">交渉決裂</span>
                          <span className="bfail-t">折り合いませんでした</span>
                        </div>
                      )}
                    </div>

                    {r && !r.loading && r.agreed &&
                      (requestedIds.has(item.id) ? (
                        <span className="bdone">依頼済み</span>
                      ) : (
                        <button
                          className="bbuy"
                          onClick={() =>
                            setPriceReq({
                              name: item.name,
                              listPrice: item.price,
                              agreedPrice: r.finalPrice!,
                              photo: item.photo,
                              sphere: item.sphere,
                              matte: item.matte,
                              noimage: item.noimage,
                              onSubmit: () =>
                                setRequestedIds((prev) => new Set(prev).add(item.id)),
                            })
                          }
                        >
                          値下げ依頼
                        </button>
                      ))}
                  </div>
                );
              })}
            </div>
          </div>

          <BottomNav active="home" unread={unread} onBell={onBell} onMypage={onMypage} />
        </>
      )}

      <PriceRequestSheet req={priceReq} onClose={() => setPriceReq(null)} />
    </div>
  );
}
