"use client";

import { useEffect, useRef, useState } from "react";
import { PriceRequestSheet, type PriceReq } from "../PriceRequestSheet";
import { CharacterAvatar } from "../CharacterAvatar";
import { useStore, makeSessionId } from "@/lib/store";
import { getCharacter } from "@/lib/characters";
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
  const characterName = useStore((s) => s.characterName);
  const requestPurchase = useStore((s) => s.requestPurchase);
  const meta = typeFromProfile(persona);
  const character = getCharacter(meta.type);
  const buyerAiName = characterName?.trim() || "あなたのAI";

  const [step, setStep] = useState<"setup" | "battle">("setup");
  const [buyerWant, setBuyerWant] = useState(2000);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);

  const [liveTurns, setLiveTurns] = useState<LiveTurn[]>([]);
  const [tug, setTug] = useState({ price: ASK_PRICE, turn: 0 });
  const [ticker, setTicker] = useState({ turn: "交渉待機中" });
  const [priceNum, setPriceNum] = useState<number | null>(null);
  const [priceDir, setPriceDir] = useState<"up" | "down" | "">("");
  const [result, setResult] = useState<GeneratedNegotiation | null>(null);
  const [requested, setRequested] = useState(false);
  const [priceReq, setPriceReq] = useState<PriceReq | null>(null);

  const battleRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  const tvNumRef = useRef<HTMLSpanElement>(null);
  const prevPriceRef = useRef(ASK_PRICE);
  const runId = useRef(0);

  // シートを開くたびに設定画面から始める
  useEffect(() => {
    if (open) {
      setStep("setup");
      setErr("");
    } else {
      runId.current++;
      setRunning(false);
      setLoading(false);
      setPriceReq(null);
    }
  }, [open]);

  const scrollDown = () => {
    const el = battleRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  useEffect(() => {
    if (result) requestAnimationFrame(scrollDown);
  }, [result]);

  const closeBattle = () => {
    runId.current++;
    setRunning(false);
    setLoading(false);
    setPriceReq(null);
    onClose();
  };

  const bumpMarker = () => {
    const m = markerRef.current;
    if (!m) return;
    m.classList.remove("pulled");
    void m.offsetWidth;
    m.classList.add("pulled");
  };

  // 「現在の提示額」の一回きりのスライド演出（増加/下降で向きを変える）
  const bumpTicker = (dir: "up" | "down") => {
    const el = tvNumRef.current;
    if (!el) return;
    el.classList.remove("roll-up", "roll-down");
    void el.offsetWidth;
    el.classList.add(dir === "up" ? "roll-up" : "roll-down");
  };

  // from→to まで数字をカウントアニメ。動き切るまで待てるよう Promise を返す
  // （requestAnimationFrame は非表示タブで止まるため setTimeout で駆動）
  const animatePrice = (from: number, to: number, myRun: number) =>
    new Promise<void>((resolve) => {
      if (from === to) {
        setPriceNum(to);
        resolve();
        return;
      }
      const dir = to > from ? "up" : "down";
      setPriceDir(dir);
      bumpTicker(dir);
      const dur = 650;
      const steps = 26;
      let k = 0;
      const run = () => {
        if (myRun !== runId.current) {
          resolve();
          return;
        }
        k += 1;
        const p = k / steps;
        const e = 1 - Math.pow(1 - p, 3); // easeOutCubic
        setPriceNum(Math.round(from + (to - from) * e));
        if (k < steps) {
          setTimeout(run, dur / steps);
        } else {
          setPriceNum(to);
          resolve();
        }
      };
      run();
    });

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
    setTicker({ turn: "交渉待機中" });
    setPriceNum(null);
    setPriceDir("");
    prevPriceRef.current = ASK_PRICE;
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
      const who = t.speaker === "seller" ? "出品者AI" : buyerAiName;
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

      // 提示額を確定 → 綱引きバーを動かし、「現在の提示額」で数字アニメを再生
      setLiveTurns((prev) => prev.map((x, j) => (j === i ? { ...x, showOffer: true } : x)));
      const nextTurn = Math.min(i + 1, MAX_TURN);
      setTug({ price: t.offer, turn: nextTurn });
      setTicker({ turn: `交渉 ${nextTurn}/${MAX_TURN}` });
      if (t.speaker === "buyer") bumpMarker();
      requestAnimationFrame(scrollDown);

      // 数字が動き切るまでチャットを止める（アニメ完了を待ってから次のターンへ）
      const from = prevPriceRef.current;
      await animatePrice(from, t.offer, myRun);
      if (myRun !== runId.current) return;
      prevPriceRef.current = t.offer;
      setPriceDir("");

      await sleep(isLast ? 300 : Math.max(140, 320 - tension * 120));
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
      buyer: {
        name: "ゲスト太郎",
        want: buyerWant,
        persona,
        characterName: characterName?.trim() || null,
      },
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
    <>
    <div className={"sheet-backdrop" + (open ? " open" : "")} onClick={closeBattle} aria-hidden="true" />
    <div
      className={"sheet" + (open ? " open" : "")}
      role={open ? "dialog" : undefined}
      aria-modal={open && !priceReq ? true : undefined}
      aria-hidden={!open || !!priceReq}
      inert={!open || !!priceReq ? true : undefined}
    >
      <div className="sheet-grabber" />
      <div className="sheet-header">
        <button className="sheet-close" type="button" onClick={closeBattle} aria-label="閉じる">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="#222" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>
        <span className="title">AIにおまかせ交渉</span>
      </div>

      <div className="agree-stamp" ref={stampRef}>
        合意
      </div>

      {step === "setup" ? (
        <div className="sheet-content">
          <div className="req-lead">AIがあなたに代わって値下げ交渉します</div>
          <p className="req-desc">
            希望価格を決めると、あなたのAIが出品者のAIとその場で自動交渉します。合意できたら
            「お知らせ」へ通知が届くので、購入に進んでください。
          </p>
          <div className="req-notes">
            ※交渉は数十秒でその場で完了します
            <br />
            ※合意した金額でのみ購入をリクエストできます
          </div>
          <div className="req-caution">
            交渉が成立しても購入するかはあなた次第。気軽におまかせできます。
          </div>
          <button className="req-help" type="button" onClick={onOpenProfile}>
            AIの性格について <span className="q">?</span>
          </button>

          <div className="req-divider" />

          <div className="req-item">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="req-thumb" src="/dorodango.png" alt="泥だんご" />
            <div className="req-item-info">
              <div className="req-item-name">泥だんご</div>
              <div className="req-item-price">
                <b>{yen(ASK_PRICE)}</b> 送料込み
              </div>
            </div>
          </div>

          <div className="req-divider" />

          <div className="seller-note">
            出品者のAI　頑固さの目安 <span className="stars">{STUB_STARS}</span>
          </div>

          <div className="req-field">
            <label className="req-field-label" htmlFor="buyer-want">希望価格</label>
            <div className="want-input">
              <span className="want-yen">¥</span>
              <input
                id="buyer-want"
                name="buyer-want"
                type="number"
                inputMode="numeric"
                autoComplete="off"
                aria-describedby={err ? "buyer-want-error" : "buyer-want-range"}
                value={buyerWant}
                step={100}
                onChange={(e) => setBuyerWant(Number(e.target.value))}
              />
            </div>
            <div className="req-range" id="buyer-want-range">
              希望できる価格は {yen(100)} 〜 {yen(ASK_PRICE - 1)} です
            </div>
          </div>

          <div className="mytype-mini">
            <CharacterAvatar character={character} fallbackEmoji={meta.avatar} size="mini" />
            <div className="mytype-info">
              <div className="mytype-name">あなたのAI：{characterName?.trim() || meta.name}</div>
              <button className="mytype-edit" type="button" onClick={onOpenProfile}>
                性格を診断・変更する ›
              </button>
            </div>
          </div>

          <button className="start-btn" onClick={startBattle}>
            AIに交渉してもらう
          </button>
          {err && <div className="err-msg" id="buyer-want-error" role="alert">{err}</div>}
        </div>
      ) : (
        <div className="battle-view">
          <div className="battle-top">
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
              <div className="tug-marker" ref={markerRef} style={{ left: 100 - buyerPct + "%" }} />
            </div>
            <div className="ticker">
              <div className="tl">現在の提示額</div>
              <div className={"tv " + priceDir}>
                <span className="tv-num" ref={tvNumRef}>
                  {priceNum == null ? "¥ -" : "¥ " + priceNum.toLocaleString()}
                </span>
              </div>
              <div className="tt">{ticker.turn}</div>
            </div>
          </div>

          <div className="battle-scroll" ref={battleRef}>
            {loading && <div className="loading" role="status">交渉中…</div>}
            <div className="log" aria-live="polite" aria-busy={running}>
              {liveTurns.map((lt, idx) => (
                <div className={"bubble-row " + lt.turn.speaker} key={idx}>
                  <span className="bname">{lt.who}</span>
                  <div className="brow-inline">
                    {lt.turn.speaker === "buyer" ? (
                      <CharacterAvatar
                        character={character}
                        fallbackEmoji={lt.turn.emoji || meta.avatar}
                        size="chat"
                      />
                    ) : (
                      <span className="bavatar">{lt.turn.emoji || "🙂"}</span>
                    )}
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
              <div className={"result " + (result.status === "agreed" ? "agreed" : "stalled")} role="status">
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
                      やることリストを見る ›
                    </button>
                  ) : (
                    <button
                      className="confirm-btn"
                      onClick={() =>
                        result?.finalPrice &&
                        setPriceReq({
                          name: "泥だんご",
                          listPrice: ASK_PRICE,
                          agreedPrice: result.finalPrice,
                          photo: "/dorodango.png",
                          onSubmit: confirmPurchase,
                        })
                      }
                    >
                      この金額で値下げ依頼
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
    <PriceRequestSheet req={priceReq} onClose={() => setPriceReq(null)} />
    </>
  );
}
