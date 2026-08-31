"use client";

import { useMemo, useState } from "react";
import { TraitScale } from "../TraitScale";
import { BackChevron } from "../icons";
import { useStore } from "@/lib/store";
import { buildPersona, typeFromProfile } from "@/lib/negotiation";
import { findCharacter, pickCharacter } from "@/lib/characters";

// axis: "persist" = 押しの強さ、"politeness" = 話し方・丁寧さ（PersonaProfileの2軸に対応）
// flavor: 押し/丁寧さのスコアには使わず、相棒キャラクターを1体に絞り込むためだけに使う
type Axis = "persist" | "politeness" | "flavor";
interface Question {
  axis: Axis;
  name: string;
  left: string;
  right: string;
}

// 読みやすいように「押しの強さ」→「話し方・伝え方」→「キャラクターのこだわり」の3グループで並べる
const QUESTION_GROUPS: { heading: string; items: Question[] }[] = [
  {
    heading: "押しの強さについて",
    items: [
      { axis: "persist", name: "値切られたときは", left: "あっさり\n引き下がる", right: "とことん\n粘る" },
      { axis: "persist", name: "一度出した希望額は", left: "早めに\n要望を下げる", right: "最後まで\n貫きたい" },
      { axis: "persist", name: "交渉が長引くのは", left: "早く\n終わらせたい", right: "じっくり時間を\nかけてもいい" },
    ],
  },
  {
    heading: "話し方・伝え方について",
    items: [
      { axis: "politeness", name: "話し方は", left: "フランク", right: "ですます調" },
      { axis: "politeness", name: "言葉選びは", left: "ハキハキ\n主張する", right: "下手に出るくらいが\nちょうどいい" },
      { axis: "politeness", name: "交渉のスタンスは", left: "自分の要望を\n素直に伝えたい", right: "相手の事情も\n汲みたい" },
    ],
  },
  {
    heading: "キャラクターのこだわり",
    items: [
      { axis: "flavor", name: "交渉の始め方は", left: "いきなり\n本題に入る", right: "世間話から\nじわじわ攻める" },
      { axis: "flavor", name: "武器にするのは", left: "相場データで\n押し切る", right: "気持ちや誠意で\n訴える" },
      { axis: "flavor", name: "200円引きクーポンを\n使い忘れたら", left: "まあいいか", right: "一日引きずる" },
    ],
  },
];

const ALL_QUESTIONS = QUESTION_GROUPS.flatMap((g) => g.items);

const nl = (s: string) =>
  s.split("\n").map((part, i) => (
    <span key={i}>
      {i > 0 && <br />}
      {part}
    </span>
  ));

const randomOf = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const average = (nums: number[]) => nums.reduce((a, b) => a + b, 0) / nums.length;

export function ProfileScreen({ onBack }: { onBack: () => void }) {
  const persona = useStore((s) => s.persona);
  const diagnosed = useStore((s) => s.diagnosed);
  const characterId = useStore((s) => s.characterId);
  const characterName = useStore((s) => s.characterName);
  const setPersona = useStore((s) => s.setPersona);
  const setCharacterName = useStore((s) => s.setCharacterName);
  const resetDiagnosis = useStore((s) => s.resetDiagnosis);

  const initialAnswers = () => Object.fromEntries(ALL_QUESTIONS.map((q) => [q.name, 4]));
  const [answers, setAnswers] = useState<Record<string, number>>(initialAnswers);
  const [nameInput, setNameInput] = useState("");
  const [renaming, setRenaming] = useState(false);

  const meta = typeFromProfile(persona);
  const character = useMemo(
    () => findCharacter(meta.type, characterId) ?? pickCharacter(meta.type, 4),
    [meta.type, characterId],
  );

  // quiz(未診断) → revealed(診断済み。名づけ欄は名前の有無で出し分け)
  const stage: "quiz" | "revealed" = diagnosed ? "revealed" : "quiz";

  const fillAllRandomly = () => {
    setAnswers(Object.fromEntries(ALL_QUESTIONS.map((q) => [q.name, 1 + Math.floor(Math.random() * 7)])));
  };

  const submit = () => {
    const scoreOf = (axis: Axis) => average(ALL_QUESTIONS.filter((q) => q.axis === axis).map((q) => answers[q.name]));
    const nextPersona = buildPersona(scoreOf("persist"), scoreOf("politeness"));
    const nextType = typeFromProfile(nextPersona).type;
    const nextCharacter = pickCharacter(nextType, scoreOf("flavor"));

    setPersona(nextPersona, nextCharacter.id);
    setNameInput("");
  };

  const confirmName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setCharacterName(trimmed);
    setRenaming(false);
  };

  const startRenaming = () => {
    setNameInput("");
    setRenaming(true);
  };

  const retake = () => {
    resetDiagnosis();
    setAnswers(initialAnswers());
    setNameInput("");
    setRenaming(false);
  };

  return (
    <div className="screen profile-screen">
      <div className="sheet-header">
        <BackChevron onClick={onBack} />
        <span className="title">プロフィール</span>
      </div>
      <div className="sheet-content">
        {stage === "revealed" && (
          <div className="my-type-card">
            <div className="persona-character">
              <div className="persona-character-frame">
                <img
                  src={character.image}
                  alt={character.label}
                  className="persona-character-img"
                  style={{ objectPosition: character.focus }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove("is-hidden");
                  }}
                />
                <div className="persona-character-fallback is-hidden">{character.emoji}</div>
              </div>

              <div className="type-name">{meta.name}</div>
              <div className="type-desc">{meta.desc}</div>

              <div className="persona-catchphrase">{character.catchphrase}</div>
              <div className="persona-description">{character.description}</div>

              <div className="persona-first-line">
                <div className="pfl-label">はじめての一言</div>
                <div className="brow-inline">
                  <div className="bavatar-img">
                    <img
                      src={character.image}
                      alt={character.label}
                      style={{ objectPosition: character.focus }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove("is-hidden");
                      }}
                    />
                    <div className="bavatar-fallback is-hidden">{character.emoji}</div>
                  </div>
                  <div className="bubble">{character.firstLine}</div>
                </div>
              </div>

              {!characterName || renaming ? (
                <div className="naming-block">
                  <div className="naming-intro">
                    このAIと、これから何度も一緒に交渉することになります。
                    <br />
                    名前をつけて、あなただけの相棒にしましょう。
                  </div>
                  <input
                    className="character-name-input"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="名前を入力"
                    maxLength={12}
                  />
                  <button
                    className="naming-shuffle"
                    type="button"
                    onClick={() => {
                      // 直前と同じ名前が出て「押しても変わらない」ように見えないよう、違う候補を選ぶ
                      const pool = character.nameSuggestions.filter((n) => n !== nameInput);
                      setNameInput(randomOf(pool.length > 0 ? pool : character.nameSuggestions));
                    }}
                  >
                    🎲 おまかせで名づける🔄
                  </button>
                  <button className="start-btn" onClick={confirmName} disabled={!nameInput.trim()}>
                    この名前にする
                  </button>
                </div>
              ) : (
                <div className="naming-block">
                  <div className="persona-character-name">{characterName}</div>
                  <button className="rename-link" onClick={startRenaming} type="button">
                    名前を変更する
                  </button>
                </div>
              )}
            </div>

            <button className="retake-btn" onClick={retake}>
              診断をやり直す
            </button>
          </div>
        )}

        {stage === "quiz" && (
          <div>
            <div className="quiz-intro">
              <b>値下げ交渉AIの性格診断</b>
              質問に答えると、あなたのAIのタイプが決まります
            </div>

            <button className="omakase-fill-btn" type="button" onClick={fillAllRandomly}>
              🎲 質問を全部お任せで埋める
            </button>

            {QUESTION_GROUPS.map((group) => (
              <div key={group.heading}>
                <div className="quiz-section-heading">
                  <span>{group.heading}</span>
                </div>
                {group.items.map((q) => (
                  <div className="trait-block" key={q.name}>
                    <div className="tname">{q.name}</div>
                    <div className="trait-row">
                      <span className="trait-label left">{nl(q.left)}</span>
                      <TraitScale
                        value={answers[q.name]}
                        onChange={(v) => setAnswers((a) => ({ ...a, [q.name]: v }))}
                      />
                      <span className="trait-label right">{nl(q.right)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <button className="start-btn" onClick={submit} style={{ marginTop: 6 }}>
              診断する
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
