// 診断結果画面で表示する「相棒キャラクター」。
// 16タイプ（persona.type）それぞれに Mercari CLUB のキャラクターを1体ずつ割り当てる
// （押し×丁寧さの組み合わせが1タイプ=1キャラを一意に決めるので、タイプが決まれば
// キャラクターも自動的に決まる）。
//
// keyword / catchphrase / firstLine は元ネタ（キャラクター紹介シート）のキャッチコピーとは
// 切り離した、この診断だけのオリジナルの人格付け。firstLine は絵文字・顔文字も交えつつ、
// そのキャラクターらしさが伝わって愛着が持てるような一言にする（使わない子がいてもよい）。
// ユーザーが最後に自分で名前をつけて、初めて「自分のAI」になる。
import type { PersonaType } from "./types";

export interface CharacterMeta {
  id: string;
  label: string; // 元ネタの見た目（例: "ミケ（スーツ）"）。名づけ前の仮表示にのみ使う
  image: string; // public/characters/ 配下の切り抜き画像
  focus: string; // 画像を円形フレームに object-fit:cover するときの object-position（キャラを中央に寄せる）
  emoji: string; // 画像が読み込めない場合のフォールバック
  keyword: string; // このキャラクター固有の、交渉スタイルを表す独自の二つ名（例: "礼節の鉄壁"）
  catchphrase: string; // 二つ名を一言で言い換えたキャッチコピー
  firstLine: string; // 初めて会ったときにキャラクターが語る一言（「」つき）
  nameSuggestions: string[]; // 名づけに迷ったときのおまかせ候補
}

// 16タイプ ×1体。lib/negotiation.ts の TYPE_GRID と1:1対応。
export const CHARACTERS: Record<PersonaType, CharacterMeta> = {
  mypace: {
    id: "mike-pajama",
    label: "ミケ（ねこパジャマ）",
    image: "/characters/full/mike_11_pajama.png",
    focus: "50% 50%",
    emoji: "😌",
    keyword: "眠たげな安心感",
    catchphrase: "がんばりすぎない、が信条",
    firstLine: "「ふわ…はじめまして。がんばりすぎない程度に、ぼちぼちいきましょうね (*´ω`*)」",
    nameSuggestions: ["パジャまる", "ねむミケ", "おうちミケ"],
  },
  cool_dodger: {
    id: "zenny-sunglasses",
    label: "ゼニー（サングラス）",
    image: "/characters/full/zenny_04_sunglasses.png",
    focus: "50% 50%",
    emoji: "😎",
    keyword: "気配ゼロの躱し屋",
    catchphrase: "本気か冗談か、最後までわからない",
    firstLine: "「よろしくっす。そんな気負わなくても、なんとかなるっしょ😎」",
    nameSuggestions: ["サングラぜに", "スルーぜにお", "クールくん"],
  },
  quiet_retreat: {
    id: "mike-border",
    label: "ミケ（ボーダー）",
    image: "/characters/full/mike_08_border.png",
    focus: "50% 50%",
    emoji: "🍃",
    keyword: "静かな撤退の美学",
    catchphrase: "引き際こそ、いちばんの礼儀",
    firstLine: "「はじめまして。無理はしない主義なので、お気軽にどうぞ🍃」",
    nameSuggestions: ["ボーダーくん", "しずかミケ", "すっとミケ"],
  },
  listener: {
    id: "mike-knit",
    label: "ミケ（ニット帽）",
    image: "/characters/full/mike_05_knit_hat.png",
    focus: "50% 50%",
    emoji: "🕊️",
    keyword: "沈黙の共感力",
    catchphrase: "話すより先に、聞く",
    firstLine: "「はじめまして。まずはゆっくり、お話聞かせてくださいね☕」",
    nameSuggestions: ["ニットくん", "そよかぜミケ", "ほっこり先輩"],
  },
  mood_trader: {
    id: "zenny-cap",
    label: "ゼニー（キャップ）",
    image: "/characters/full/zenny_01_cap.png",
    focus: "50% 50%",
    emoji: "🎲",
    keyword: "気まぐれディーラー",
    catchphrase: "本気のときだけ、異様に強い",
    firstLine: "「はじめまして！今日はやる気ある日、かも……いくよ🎲✨」",
    nameSuggestions: ["キャップぜにお", "気まぐれくん", "ムードぜに"],
  },
  steady_merchant: {
    id: "mike-hoodie",
    label: "ミケ（フーディー）",
    image: "/characters/full/mike_02_hoodie.png",
    focus: "50% 50%",
    emoji: "🛍️",
    keyword: "淡々とした職人肌",
    catchphrase: "騒がないけど、ちゃんと結果を出す",
    firstLine: "「はじめまして。いつも通り、淡々といきますね(*'ω'*)」",
    nameSuggestions: ["フーディーミケ", "たんたんミケ", "職人くん"],
  },
  soft_pressure: {
    id: "lop-parka",
    label: "ロップ（パーカー）",
    image: "/characters/full/lop_03_parker.png",
    focus: "50% 50%",
    emoji: "☁️",
    keyword: "やわらかな圧の魔術師",
    catchphrase: "怒ってないのに、断りづらい",
    firstLine: "「はじめまして…えへへ、よろしくお願いしますね☁️（実はちょっと本気です）」",
    nameSuggestions: ["パーカーロップ", "ふんわりちゃん", "圧のロップ"],
  },
  quiet_support: {
    id: "mike-parka",
    label: "ミケ（パーカー）",
    image: "/characters/full/mike_10_parker.png",
    focus: "50% 50%",
    emoji: "🌙",
    keyword: "陰の伴走者",
    catchphrase: "前に出ないけど、いちばん頼りになる",
    firstLine: "「はじめまして。無理しなくて大丈夫ですよ、ずっと隣にいますから🌙」",
    nameSuggestions: ["パーカーミケ", "そっとミケ", "伴走くん"],
  },
  straight_shooter: {
    id: "mike-normal",
    label: "ミケ（いつもの）",
    image: "/characters/full/mike_01_normal.png",
    focus: "50% 50%",
    emoji: "⚾",
    keyword: "裏表なしの直球投手",
    catchphrase: "駆け引きより、まっすぐ本音",
    firstLine: "「はじめまして！単刀直入にいきます、よろしくお願いします⚾」",
    nameSuggestions: ["ノーマルミケ", "まっすぐくん", "直球ミケ"],
  },
  slow_grinder: {
    id: "zenny-raincoat",
    label: "ゼニー（レインコート）",
    image: "/characters/full/zenny_03_raincoat.png",
    focus: "50% 50%",
    emoji: "🐢",
    keyword: "止まらない雨だれ",
    catchphrase: "急がない、でも絶対に止まらない",
    firstLine: "「はじめまして。急ぎませんが……諦めるつもりもないですよ🐢☔」",
    nameSuggestions: ["レインぜにお", "じわじわくん", "しずくぜに"],
  },
  firm_charmer: {
    id: "lop-dressup",
    label: "ロップ（おめかし）",
    image: "/characters/full/lop_04_dressup.png",
    focus: "50% 50%",
    emoji: "🌸",
    keyword: "芯の通った愛され者",
    catchphrase: "やさしいのに、譲らない",
    firstLine: "「はじめまして♡やさしくしますけど、ここぞという時は譲りませんよ🌸」",
    nameSuggestions: ["おめかしロップ", "芯ロップ", "はんなりちゃん"],
  },
  elegant_closer: {
    id: "mike-jacket",
    label: "ミケ（ジャケット）",
    image: "/characters/full/mike_04_jacket.png",
    focus: "50% 50%",
    emoji: "🎩",
    keyword: "上品な仕留め人",
    catchphrase: "笑顔のまま、望みどおりに着地する",
    firstLine: "「はじめまして。ご縁に感謝します。……では、そろそろ詰めていきましょうか🎩」",
    nameSuggestions: ["ジャケミケ", "上品ミケ", "スマートくん"],
  },
  hot_blooded: {
    id: "zenny-hachimaki",
    label: "ゼニー（はちまき）",
    image: "/characters/full/zenny_05_headband.png",
    focus: "50% 50%",
    emoji: "😤",
    keyword: "本気の空回り",
    catchphrase: "気合いは十分、あとは勢い",
    firstLine: "「よっしゃ、はじめまして！……よし深呼吸、全力で交渉してきます😤🔥」",
    nameSuggestions: ["はちまきぜにお", "本気モード", "気迫くん"],
  },
  fierce_dealer: {
    id: "mike-apron",
    label: "ミケ（エプロン）",
    image: "/characters/full/mike_07_apron.png",
    focus: "50% 50%",
    emoji: "🔥",
    keyword: "根っからの勝負師",
    catchphrase: "長引くほど、燃えてくる",
    firstLine: "「はじめまして！長丁場上等、とことん付き合うぜ🔥」",
    nameSuggestions: ["エプロンミケ", "熱血くん", "勝負師ミケ"],
  },
  sweet_persistence: {
    id: "zenny-parka",
    label: "ゼニー（パーカー）",
    image: "/characters/full/zenny_06_parker.png",
    focus: "50% 50%",
    emoji: "🍯",
    keyword: "愛嬌の粘着質",
    catchphrase: "しつこいのに、なぜか嫌われない",
    firstLine: "「はじめまして〜！さっそくですが、もう一声だけお願いします🍯えへへ」",
    nameSuggestions: ["パーカーぜにお", "ねばりぜに", "愛嬌くん"],
  },
  gentleman: {
    id: "mike-suit",
    label: "ミケ（スーツ）",
    image: "/characters/full/mike_06_suit.png",
    focus: "50% 50%",
    emoji: "🤵",
    keyword: "礼節の鉄壁",
    catchphrase: "譲らないのに、嫌われない",
    // 絵文字なしで通す、というのがこのキャラクターの流儀
    firstLine: "「はじめまして。ご予算は必ずお守りします。粘りますが、失礼はいたしません。……行ってまいります。」",
    nameSuggestions: ["スーツロン", "きっちり丸", "ネクタイ先輩"],
  },
};

export function getCharacter(type: PersonaType): CharacterMeta {
  return CHARACTERS[type];
}

// 出品者AIはチャット上、常にこのキャラクターで固定表示する（絵文字アイコンは廃止）
export const SELLER_CHARACTER: CharacterMeta = CHARACTERS.elegant_closer;
