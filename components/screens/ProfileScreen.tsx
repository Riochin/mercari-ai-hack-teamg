"use client";

import { useState } from "react";
import { TraitScale } from "../TraitScale";
import { BackChevron } from "../icons";
import { useStore } from "@/lib/store";
import { buildPersona, typeFromProfile } from "@/lib/negotiation";

const QUESTIONS = [
  { name: "値切られたときは", left: "あっさり\n引き下がる", right: "とことん\n粘る" },
  { name: "一度出した希望額は", left: "早めに\n要望を下げる", right: "最後まで\n貫きたい" },
  { name: "交渉が長引くのは", left: "早く\n終わらせたい", right: "じっくり時間を\nかけてもいい" },
  { name: "話し方は", left: "フランク", right: "ですます調" },
  { name: "交渉のスタンスは", left: "自分の要望を\n素直に伝えたい", right: "相手の事情も\n汲みたい" },
  { name: "言葉選びは", left: "ハキハキ\n主張する", right: "下手に出るくらいが\nちょうどいい" },
];

const nl = (s: string) =>
  s.split("\n").map((part, i) => (
    <span key={i}>
      {i > 0 && <br />}
      {part}
    </span>
  ));

export function ProfileScreen({ onBack }: { onBack: () => void }) {
  const persona = useStore((s) => s.persona);
  const diagnosed = useStore((s) => s.diagnosed);
  const setPersona = useStore((s) => s.setPersona);
  const resetDiagnosis = useStore((s) => s.resetDiagnosis);

  const [answers, setAnswers] = useState<number[]>([4, 4, 4, 4, 4, 4]);
  const [showResult, setShowResult] = useState(diagnosed);

  const meta = typeFromProfile(persona);

  const submit = () => {
    const persistScore = (answers[0] + answers[1] + answers[2]) / 3;
    const politeScore = (answers[3] + answers[4] + answers[5]) / 3;
    setPersona(buildPersona(persistScore, politeScore));
    setShowResult(true);
  };

  const retake = () => {
    resetDiagnosis();
    setAnswers([4, 4, 4, 4, 4, 4]);
    setShowResult(false);
  };

  return (
    <div className="screen profile-screen">
      <div className="sheet-header">
        <BackChevron onClick={onBack} />
        <span className="title">プロフィール</span>
      </div>
      <div className="sheet-content">
        {showResult ? (
          <div className="my-type-card">
            <div className="type-avatar">{meta.avatar}</div>
            <div className="type-name">{meta.name}</div>
            <div className="type-desc">{meta.desc}</div>
            <button className="retake-btn" onClick={retake}>
              診断をやり直す
            </button>
          </div>
        ) : (
          <div>
            <div className="quiz-intro">
              <b>値下げ交渉AIの性格診断</b>
              質問に答えると、あなたのAIのタイプが決まります
            </div>

            {QUESTIONS.map((q, i) => (
              <div className="trait-block" key={i} style={i === QUESTIONS.length - 1 ? { marginBottom: 20 } : undefined}>
                <div className="tname">{q.name}</div>
                <div className="trait-row">
                  <span className="trait-label left">{nl(q.left)}</span>
                  <TraitScale value={answers[i]} onChange={(v) => setAnswers((a) => a.map((x, j) => (j === i ? v : x)))} />
                  <span className="trait-label right">{nl(q.right)}</span>
                </div>
              </div>
            ))}

            <button className="start-btn" onClick={submit}>
              診断する
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
