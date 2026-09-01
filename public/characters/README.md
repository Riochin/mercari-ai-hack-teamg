# キャラクター画像

`components/screens/ProfileScreen.tsx` の診断結果に表示する「相棒キャラクター」の画像置き場。

- このディレクトリ直下（`mike_01_normal.png` など）＝ キャラクター全身のイラスト（元素材）。
- [`full/`](full/) ＝ 全身イラストの余白（背景）を詰めて正方形に自動クロップしたもの。
  [`lib/characters.ts`](../../lib/characters.ts) の `image` はこちらを参照する
  （診断結果の丸いアイコンで、全身が映りつつ余白は最小限になるようにするため）。

画像を追加・差し替える場合は、全身イラストをこのディレクトリに置いたうえで、以下のスクリプトで
`full/` に余白詰めクロップを生成し、`lib/characters.ts` の `image` パスを更新すること
（`focus` は基本 `"50% 50%"` のままで良いはずだが、クロップ結果がズレていたら調整する）。

```bash
python3 -c "
from PIL import Image

def bg_color(im):
    w, h = im.size
    c = [im.getpixel((0,0)), im.getpixel((w-1,0)), im.getpixel((0,h-1)), im.getpixel((w-1,h-1))]
    return tuple(sum(p[i] for p in c)//4 for i in range(3))

def full_bbox(im, bg, thresh=18):
    w, h = im.size; px = im.load(); minx,miny,maxx,maxy = w,h,0,0
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            r,g,b = px[x,y]
            if abs(r-bg[0])+abs(g-bg[1])+abs(b-bg[2]) > thresh:
                minx,maxx = min(minx,x), max(maxx,x)
                miny,maxy = min(miny,y), max(maxy,y)
    return minx,miny,maxx,maxy

path = 'mike_01_normal.png'  # 差し替える
im = Image.open(path).convert('RGB')
w, h = im.size
bg = bg_color(im)
minx, miny, maxx, maxy = full_bbox(im, bg)
bboxH = maxy - miny
cx = (minx + maxx) / 2
margin = 0.06  # 上下の余白（全身がちょうど収まる程度に少しだけ）
cropH = bboxH * (1 + margin)
top = miny - bboxH * margin / 2
left = cx - cropH / 2
canvas = Image.new('RGB', (round(cropH), round(cropH)), bg)
sl, st = max(0, round(left)), max(0, round(top))
sr, sb = min(w, round(left+cropH)), min(h, round(top+cropH))
canvas.paste(im.crop((sl, st, sr, sb)), (sl-round(left), st-round(top)))
canvas.save(f'full/{path}')
"
```

`lib/characters.ts` 側では、キャラクターごとに元画像の見た目（`label`）とは別に、
この診断オリジナルの `keyword`（交渉スタイルの二つ名）・`catchphrase`・`firstLine`
（本人からの一言。絵文字・顔文字つきでそのキャラらしさを出す）・`nameSuggestions`
（名づけのおまかせ候補）を持たせている。

16タイプ（`lib/types.ts` の `PersonaType`）それぞれに1体ずつ、計16体を割り当て済み
（全身イラストは21体分あるが、5体は未使用）。
