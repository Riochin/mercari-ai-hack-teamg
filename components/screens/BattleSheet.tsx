"use client";

import { useEffect, useRef, useState } from "react";
import { BackChevron } from "../icons";
import { useStore, makeSessionId } from "@/lib/store";
import {
  generateTurns,
  typeFromProfile,
  yen,
  MAX_TURN,
  type GeneratedNegotiation,
} from "@/lib/negotiation";
import type { NegotiationSession, Turn } from "@/lib/types";

const ASK_PRICE = 3000;
const SELLER_MIN = 2400;
const SELLER_STUB = 70;
const STUB_STARS = "●●●○○"; // 頑固さの目安（70% ≒ ●3〜4個の見た目）

interface LiveTurn {
  turn: Turn;
  who: string;
  typing: boolean;
  paused: boolean;
  text: string;
  showOffer: boolean;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const pct = (p: number, want: number) =>
  Math.max(0, Math.min(100, ((p - want) / (ASK_PRICE - want)) * 100));

interface Props {
  open: boolean;
  onClose: () => void;
  onGoNotify: () => void;
  onOpenProfile: () => void;
}

export function BattleSheet({ open, onClose, onGoNotify, onOpenProfile }: Props) {
  const persona = useStore((s) => s.persona);
  const requestPurchase = useStore((s) => s.requestPurchase);
  const meta = typeFromProfile(persona);

  const [step, setStep] = useState<"setup" | "battle">("setup");
  const [buyerWant, setBuyerWant] = useState(2000);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);

  const [liveTurns, setLiveTurns] = useState<LiveTurn[]>([]);
  const [tug, setTug] = useState({ price: ASK_PRICE, turn: 0 });
  const [ticker, setTicker] = useState({ price: "¥ -", turn: "交渉待機中" });
  const [result, setResult] = useState<GeneratedNegotiation | null>(null);
  const [requested, setRequested] = useState(false);

  const battleRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  const runId = useRef(0);

  // シートを開くたびに設定画面から始める
  useEffect(() => {
    if (open) {
      setStep("setup");
      setErr("");
    }
  }, [open]);

  const scrollDown = () => {
    const el = battleRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  const bumpMarker = () => {
    const m = markerRef.current;
    if (!m) return;
    m.classList.remove("pulled");
    void m.offsetWidth;
    m.classList.add("pulled");
  };

  const showAgreeStamp = () => {
    const s = stampRef.current;
    if (!s) return;
    s.classList.remove("show", "hide");
    void s.offsetWidth;
    s.classList.add("show");
    setTimeout(() => s.classList.add("hide"), 1300);
  };

  const startBattle = async () => {
    if (!buyerWant || buyerWant <= 0 || buyerWant > ASK_PRICE) {
      setErr(`希望額は出品価格（${yen(ASK_PRICE)}）以下で入力してください。`);
      return;
    }
    setErr("");
    setStep("battle");
    setRunning(true);
    setRequested(false);
    setResult(null);
    setLiveTurns([]);
    setTug({ price: ASK_PRICE, turn: 0 });
    setTicker({ price: "¥ -", turn: "交渉待機中" });
    setLoading(true);

    const myRun = ++runId.current;
    await sleep(700); // AI同士が交渉している間の待機演出
    if (myRun !== runId.current) return;
    setLoading(false);

    const parsed = generateTurns({
      askPrice: ASK_PRICE,
      sellerMin: SELLER_MIN,
      sellerStub: SELLER_STUB,
      buyerWant,
      persist: persona.persist,
      politeness: persona.politeness,
    });

    await playTurns(parsed, myRun);
    if (myRun !== runId.current) return;
    setRunning(false);

    if (parsed.status === "agreed") showAgreeStamp();
    setResult(parsed);
  };

  const playTurns = async (parsed: GeneratedNegotiation, myRun: number) => {
    const turns = parsed.turns;
    for (let i = 0; i < turns.length; i++) {
      const t = turns[i];
      const who = t.speaker === "seller" ? "出品者AI" : "あなたのAI";
      const tension = t.tension ?? 0.3;

      // 「入力中…」インジケーター
      setLiveTurns((prev) => [
        ...prev,
        { turn: t, who, typing: true, paused: false, text: "", showOffer: false },
      ]);
      requestAnimationFrame(scrollDown);

      const typingTime = 380 + tension * 900 + Math.random() * 200;
      if (tension > 0.55) {
        await sleep(typingTime * 0.4);
        if (myRun !== runId.current) return;
        setLiveTurns((prev) => prev.map((x, j) => (j === i ? { ...x, paused: true } : x)));
        await sleep(180 + tension * 220);
        if (myRun !== runId.current) return;
        setLiveTurns((prev) => prev.map((x, j) => (j === i ? { ...x, paused: false } : x)));
        await sleep(typingTime * 0.6);
      } else {
        await sleep(typingTime);
      }
      if (myRun !== runId.current) return;

      // 吹き出しへ切替（1文字ずつタイプ）
      setLiveTurns((prev) => prev.map((x, j) => (j === i ? { ...x, typing: false } : x)));
      const charDelay = 20 + tension * 20;
      for (let c = 0; c < t.message.length; c++) {
        const partial = t.message.slice(0, c + 1);
        setLiveTurns((prev) => prev.map((x, j) => (j === i ? { ...x, text: partial } : x)));
        requestAnimationFrame(scrollDown);
        await sleep(charDelay);
        if (myRun !== runId.current) return;
      }

      const isLast = i === turns.length - 1;
      if (isLast) {
        setTicker((s) => ({ ...s, turn: "…" }));
        await sleep(500 + tension * 400);
        if (myRun !== runId.current) return;
      }

      // 価格をポップ表示＋綱引き更新
      setLiveTurns((prev) => prev.map((x, j) => (j === i ? { ...x, showOffer: true } : x)));
      const nextTurn = Math.min(i + 1, MAX_TURN);
      setTug({ price: t.offer, turn: nextTurn });
      setTicker({ price: yen(t.offer).replace("¥", "¥ "), turn: `交渉 ${nextTurn}/${MAX_TURN}` });
      if (t.speaker === "buyer") bumpMarker();
      requestAnimationFrame(scrollDown);

      await sleep(isLast ? 550 : 380 - tension * 120);
      if (myRun !== runId.current) return;
    }

    if (parsed.status === "agreed" && parsed.finalPrice) {
      setTicker((s) => ({ ...s, turn: "交渉成立・あなたの確認待ち" }));
    } else {
      setTicker((s) => ({ ...s, turn: "交渉決裂" }));
    }
  };

  const confirmPurchase = () => {
    if (!result || result.status !== "agreed" || !result.finalPrice) return;
    const session: NegotiationSession = {
      sessionId: makeSessionId(),
      item: { name: "泥だんご", listPrice: ASK_PRICE, photo: "/dorodango.png" },
      buyer: { name: "ゲスト太郎", want: buyerWant, persona },
      seller: { minPrice: SELLER_MIN, stubbornness: SELLER_STUB },
      turns: result.turns,
      status: "seller_review",
      finalPrice: result.finalPrice,
      createdAt: new Date().toISOString(),
    };
    requestPurchase(session);
    setRequested(true);
    setTicker((s) => ({ ...s, turn: "出品者からの合意待ち" }));
  };

  const rematch = () => {
    runId.current++;
    setRunning(false);
    setStep("setup");
  };

  const buyerPct = 100 - pct(tug.price, buyerWant);

  return (
    <div className={"sheet" + (open ? " open" : "")}>
      <div className="sheet-header">
        <BackChevron onClick={onClose} />
        <span className="title">AI値下げ交渉</span>
      </div>

      <div className="agree-stamp" ref={stampRef}>
        合意
      </div>

      {step === "setup" ? (
        <div className="sheet-content">
          <div className="setup-card seller locked">
            <span className="tag">出品者のAI</span>
            <div className="seller-peek">
              頑固さの目安　<span className="stars">{STUB_STARS}</span>
            </div>
          </div>

          <div className="setup-card buyer">
            <span className="tag">あなたのAI</span>
            <div className="frow">
              <label>希望額</label>
              <input
                type="number"
                value={buyerWant}
                step={100}
                onChange={(e) => setBuyerWant(Number(e.target.value))}
              />
            </div>

            <div className="mytype-mini">
              <span className="mytype-avatar">{meta.avatar}</span>
              <div className="mytype-info">
                <div className="mytype-name">{meta.name}</div>
                <div className="mytype-edit" onClick={onOpenProfile}>
                  性格を診断・変更する ›
                </div>
              </div>
            </div>
          </div>

          <div className="listprice-row">
            <label>出品価格</label>
            <span>{yen(ASK_PRICE)}</span>
          </div>

          <button className="start-btn" onClick={startBattle}>
            交渉バトル開始
          </button>
          {err && <div className="err-msg">{err}</div>}
        </div>
      ) : (
        <div className="sheet-content" ref={battleRef}>
          {loading && <div className="loading">交渉中…</div>}

          <div className="stage">
            <div className="turnrow">
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className={
                    "turn-dot" +
                    (i <= tug.turn ? " done" : "") +
                    (i === tug.turn + 1 ? " active" : "")
                  }
                />
              ))}
              <span className="turn-label">{tug.turn === 0 ? "交渉開始" : `交渉 ${tug.turn}/${MAX_TURN}`}</span>
            </div>

            <div className="tug-caption">
              <span>
                希望額 <b>{yen(buyerWant)}</b>
              </span>
              <span>
                出品価格 <b>{yen(ASK_PRICE)}</b>
              </span>
            </div>
            <div className="tug-track">
              <div className="tug-fill-buyer" style={{ width: buyerPct + "%" }} />
              <div className="tug-fill-seller" style={{ width: 100 - buyerPct + "%" }} />
              <div className="tug-target-line" style={{ left: "0%" }} />
              <div className="tug-marker" ref={markerRef} style={{ left: buyerPct + "%" }}>
                🧶
              </div>
            </div>
            <div className="tug-ends">
              <span className="tug-end buyer">← 押し切る</span>
              <span className="tug-end seller">粘る →</span>
            </div>

            <div className="ticker">
              <div className="tl">現在の提示額</div>
              <div className="tv">{ticker.price}</div>
              <div className="tt">{ticker.turn}</div>
            </div>

            <div className="log">
              {liveTurns.map((lt, idx) => (
                <div className={"bubble-row " + lt.turn.speaker} key={idx}>
                  <span className="bname">{lt.who}</span>
                  <div className="brow-inline">
                    <span className="bavatar">{lt.turn.emoji || "🙂"}</span>
                    {lt.typing ? (
                      <div className={"bubble typing" + (lt.paused ? " paused" : "")}>
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </div>
                    ) : (
                      <div className="bubble">
                        <span className="btext">{lt.text}</span>
                      </div>
                    )}
                  </div>
                  {!lt.typing && (
                    <span className={"boffer" + (lt.showOffer ? "" : " pending")}>{yen(lt.turn.offer)}</span>
                  )}
                </div>
              ))}
            </div>

            {result && (
              <div className={"result " + (result.status === "agreed" ? "agreed" : "stalled")}>
                {result.status === "agreed" && result.finalPrice ? (
                  <>
                    <div className="rt">AIが合意額を見つけました</div>
                    <div className="rp">{yen(result.finalPrice).replace("¥", "¥ ")}</div>
                    <div className="rc">
                      出品者のAIとの交渉で見つかった金額です。リクエストすると出品者の最終承認を待ちます。
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rt">これ以上は折り合いませんでした</div>
                    <div className="rp">交渉決裂</div>
                    <div className="rc">条件を変えて、もう一度交渉をお試しください。</div>
                  </>
                )}
              </div>
            )}

            {result && !running && (
              <div className="actions">
                {result.status === "agreed" ? (
                  requested ? (
                    <button className="confirm-btn" onClick={onGoNotify}>
                      お知らせ（出品者）を見る ›
                    </button>
                  ) : (
                    <button className="confirm-btn" onClick={confirmPurchase}>
                      この金額で購入をリクエスト
                    </button>
                  )
                ) : (
                  <button className="rematch-btn" onClick={rematch}>
                    条件を変えて再挑戦
                  </button>
                )}
              </div>
            )}

            {requested && (
              <div className="err-msg" style={{ color: "var(--green)", marginTop: 12 }}>
                出品者に合意額を届けました。出品者の「お知らせ」に通知が届いています。
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
