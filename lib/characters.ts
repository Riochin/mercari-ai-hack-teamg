// 診断結果画面で表示する「相棒キャラクター」の候補。
// 4タイプ（persona.type）ごとに Mercari CLUB のキャラクターを3体割り当て、
// 任意の追加質問（性格診断の“フレーバー”軸）で1体に絞り込む。
//
// keyword / catchphrase / description / firstLine は元ネタ（キャラクター紹介シート）の
// キャッチコピーとは切り離した、この診断だけのオリジナルの人格付け。
// ユーザーが最後に自分で名前をつけて、初めて「自分のAI」になる。
import type { PersonaType } from "./types";

export interface CharacterMeta {
  id: string;
  label: string; // 元ネタの見た目（例: "ミケ（スーツ）"）。名づけ前の仮表示にのみ使う
  image: string; // public/characters/art/ 配下の切り抜き画像
  focus: string; // 画像を円形フレームに object-fit:cover するときの object-position（キャラを中央に寄せる）
  emoji: string; // 画像が読み込めない場合のフォールバック
  keyword: string; // このキャラクター固有の、交渉スタイルを表す独自の二つ名（例: "礼節の鉄壁"）
  catchphrase: string; // 二つ名を一言で言い換えたキャッチコピー
  description: string; // 交渉スタイルの説明（1〜2文）
  firstLine: string; // 初めて会ったときにキャラクターが語る一言（「」つき）
  nameSuggestions: string[]; // 名づけに迷ったときのおまかせ候補
}

// 各タイプにつき3体。フレーバー軸（任意質問の平均値 1-7）が低いほど [0]、高いほど [2] を選ぶ。
export const CHARACTERS: Record<PersonaType, CharacterMeta[]> = {
  // 微笑み外交官タイプ：押しも丁寧さも強い、冷静に何度も交渉を重ねるタイプ
  gentleman: [
    {
      id: "mike-jacket",
      label: "ミケ（ジャケット）",
      image: "/characters/art/mike_04_jacket.webp",
      focus: "50% 50%",
      emoji: "🤵",
      keyword: "身軽な誠実",
      catchphrase: "急がない、でも逃さない",
      description:
        "フットワークは軽いが、要点は絶対に外さない。相手のペースに合わせながら、じわじわと理想の着地点まで運んでいくタイプ。",
      firstLine: "「こんにちは、身軽に来ました。急ぎませんが、着地点はちゃんと決めましょうね。」",
      nameSuggestions: ["ジャケ丸", "涼介", "ミケスケ"],
    },
    {
      id: "mike-suit",
      label: "ミケ（スーツ）",
      image: "/characters/art/mike_06_suit.webp",
      focus: "50% 50%",
      emoji: "🤵",
      keyword: "礼節の鉄壁",
      catchphrase: "譲らないのに、嫌われない",
      description:
        "ねばり強く、しかし最後まで敬語を崩さない。相手を不快にさせずに時間をかけて削り取る、いちばん成約率が安定したタイプ。",
      firstLine: "「はじめまして。ご予算は必ずお守りします。粘りますが、失礼はいたしません。……行ってまいります。」",
      nameSuggestions: ["スーツロン", "きっちり丸", "ネクタイ先輩"],
    },
    {
      id: "lop-dressup",
      label: "ロップ（おめかし）",
      image: "/characters/art/lop_04_dressup.webp",
      focus: "44% 50%",
      emoji: "🤵",
      keyword: "微笑みの交渉術",
      catchphrase: "笑顔のまま、一歩も引かない",
      description:
        "終始やわらかい物腰を崩さず、相手の警戒心をそっと解きながら条件を整えていく。気づけば納得している、そんなタイプ。",
      firstLine: "「今日はよろしくお願いしますね。……なんて言いつつ、実はけっこう本気ですよ。」",
      nameSuggestions: ["おめかしロップ", "リボン先生", "ロップ姉さん"],
    },
  ],
  // 猪突猛進タイプ：勢いと粘りで、とことん値切りにいくタイプ
  hot_blooded: [
    {
      id: "mike-apron",
      label: "ミケ（エプロン）",
      image: "/characters/art/mike_07_apron.webp",
      focus: "48% 50%",
      emoji: "😤",
      keyword: "情熱の突撃隊長",
      catchphrase: "考えるより先に、口が動く",
      description:
        "勢いで飛び込んで、勢いのまま押し切る。理屈より熱量で相手を動かす、体育会系交渉のスペシャリスト。",
      firstLine: "「よっしゃ行くぞ！ダメ元上等、まずは全力でぶつかってみるからな！」",
      nameSuggestions: ["エプロン魂", "気合いミケ", "根性丸"],
    },
    {
      id: "zenny-cap",
      label: "ゼニー（キャップ）",
      image: "/characters/art/zenny_01_cap.webp",
      focus: "44% 50%",
      emoji: "😤",
      keyword: "根拠なき自信",
      catchphrase: "とにかく、いける気しかしない",
      description:
        "勝算があるかどうかより先に、まず前のめり。楽観的な勢いが、意外と交渉をうまく転がすタイプ。",
      firstLine: "「よし、いくぞ！なんとかなる気しかしないから、まかせて！」",
      nameSuggestions: ["キャップンゼニー", "突撃くん", "ゴーゴーぜにお"],
    },
    {
      id: "zenny-hachimaki",
      label: "ゼニー（はちまき）",
      image: "/characters/art/zenny_05_headband.webp",
      focus: "50% 50%",
      emoji: "😤",
      keyword: "本気の空回り",
      catchphrase: "気合いは十分、あとは勢い",
      description:
        "本番前にひとりで気合いを入れすぎるタイプ。多少空回りしても、その本気度が意外と相手の心を動かす。",
      firstLine: "「よし……深呼吸。よぉし、全力で交渉してきます！」",
      nameSuggestions: ["はちまきぜにお", "本気モード", "気迫くん"],
    },
  ],
  // 共感モンスタータイプ：相手の様子をうかがいながら、丁寧に譲るタイプ
  listener: [
    {
      id: "mike-knit",
      label: "ミケ（ニット帽）",
      image: "/characters/art/mike_05_knit_hat.webp",
      focus: "50% 50%",
      emoji: "🕊️",
      keyword: "沈黙の共感力",
      catchphrase: "話すより先に、聞く",
      description:
        "相手の言葉の裏側まで丁寧にすくい取り、無理に押さず着地点を一緒に探す。信頼を積み重ねて交渉をまとめるタイプ。",
      firstLine: "「まずはお話、聞かせてくださいね。無理なお願いはしませんので。」",
      nameSuggestions: ["ニットくん", "そよかぜミケ", "ほっこり先輩"],
    },
    {
      id: "mike-parka",
      label: "ミケ（パーカー）",
      image: "/characters/art/mike_10_parker.webp",
      focus: "50% 50%",
      emoji: "🕊️",
      keyword: "静かなる粘り",
      catchphrase: "物静かなのに、意外と折れない",
      description:
        "表情は穏やかでも、大事なところではちゃんと粘る。控えめな見た目とのギャップが最大の武器。",
      firstLine: "「のんびりいきましょう……とはいえ、譲れないところは、ちゃんと言いますね。」",
      nameSuggestions: ["パーカ丸", "しずかミケ", "フード先生"],
    },
    {
      id: "zenny-parka",
      label: "ゼニー（パーカー）",
      image: "/characters/art/zenny_06_parker.webp",
      focus: "46% 50%",
      emoji: "🕊️",
      keyword: "気配りの達人",
      catchphrase: "自分より先に、相手の事情",
      description:
        "相手の立場や状況をまず想像してから言葉を選ぶ。急かさず、焦らさず、双方が納得できる形をつくるタイプ。",
      firstLine: "「ご事情、教えてもらえたら嬉しいです。無理のない範囲で、一緒に考えましょう。」",
      nameSuggestions: ["きき上手ぜにお", "やさしぜに", "ふわぜに"],
    },
  ],
  // 脱力仙人タイプ：あっさり流れに任せる、力の抜けたタイプ
  mypace: [
    {
      id: "mike-sweater",
      label: "ミケ（セーター）",
      image: "/characters/art/mike_03_sweater.webp",
      focus: "50% 50%",
      emoji: "😌",
      keyword: "脱力の達人",
      catchphrase: "深く考えない、それが強み",
      description:
        "力まず、焦らず、なるようになると構えている。肩の力が抜けている分、変なプレッシャーを与えないタイプ。",
      firstLine: "「まあ、なんとかなるでしょ。ゆるく交渉してきますね。」",
      nameSuggestions: ["セーターまる", "のんびりミケ", "ふぅ先輩"],
    },
    {
      id: "zenny-sunglasses",
      label: "ゼニー（サングラス）",
      image: "/characters/art/zenny_04_sunglasses.webp",
      focus: "50% 50%",
      emoji: "😌",
      keyword: "休暇中の交渉人",
      catchphrase: "結果よりも、この時間を楽しむ",
      description:
        "勝ち負けにこだわらず、やりとり自体を楽しんでいる様子。気負いがない分、相手も身構えずに話せるタイプ。",
      firstLine: "「気楽にいきましょう。ダメならダメで、それもまた一興ってことで。」",
      nameSuggestions: ["サングラぜに", "チルぜにお", "休暇中くん"],
    },
    {
      id: "mike-pajama",
      label: "ミケ（ねこパジャマ）",
      image: "/characters/art/mike_11_pajama.webp",
      focus: "50% 50%",
      emoji: "😌",
      keyword: "眠たげな安心感",
      catchphrase: "がんばりすぎない、が信条",
      description:
        "終始マイペースでゆるいテンション。気負わない態度が逆に相手の警戒を解き、思わぬ好条件を引き出すことも。",
      firstLine: "「ふわ……がんばりますね。ほどほどに、いきましょう。」",
      nameSuggestions: ["パジャまる", "ねむミケ", "おうちミケ"],
    },
  ],
};

// flavorScore: 任意の追加質問（1-7）の平均。低いほど [0]、高いほど [2]。
export function pickCharacter(type: PersonaType, flavorScore: number): CharacterMeta {
  const list = CHARACTERS[type];
  const index = flavorScore <= 3 ? 0 : flavorScore <= 5 ? 1 : 2;
  return list[index];
}

export function findCharacter(type: PersonaType, id: string | null | undefined): CharacterMeta | null {
  if (!id) return null;
  return CHARACTERS[type].find((c) => c.id === id) ?? null;
}
