# キャラクター画像

`components/screens/ProfileScreen.tsx` の診断結果に表示する「相棒キャラクター」の画像置き場。

- このディレクトリ直下（`mike_01_normal.png` など）＝ 提供いただいた元画像（下部にキャラ名・キャッチコピーのテキストが焼き込み済み）。
- [`art/`](art/) ＝ 元画像からテキスト部分を切り取った、アプリで実際に使うクロップ済み画像。
  [`lib/characters.ts`](../../lib/characters.ts) の `image` はこちらを参照する。

画像を追加・差し替える場合は、元画像をこのディレクトリに置いたうえで、以下のように
テキスト部分（だいたい下28%）を切り取って `art/` に保存し直してください。

```bash
python3 -c "
from PIL import Image
im = Image.open('mike_12_example.png')
w, h = im.size
im.crop((0, 0, w, round(h * 0.72))).save('art/mike_12_example.png')
"
```

`lib/characters.ts` 側では、キャラクターごとに元画像の見た目（`label`）とは別に、
この診断オリジナルの `keyword`（交渉スタイルの二つ名）・`message`（本人からの一言）・
`nameSuggestions`（名づけのおまかせ候補）を持たせている。画像の元キャッチコピーは使っていない。
