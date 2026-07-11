# Inquiry Teacher Lab / 探究する先生の授業準備室

教室英語・探究の問い・授業準備を支える、先生のための無料ツールサイトです。

メインコピーは「明日の授業に、ひとつの問いを。」です。個人紹介サイトではなく、教員が明日の授業ですぐ使えるツールを中心にしています。

## 主な機能

- 場面別・教室英語検索
- 探究の問いメーカー
- 授業前後セルフチェック
- IB・PYP初心者ノート
- 学級経営・教室運営ヒント
- このサイトについて
- 利用上の注意・免責事項

今後、問いの言い換えツール、指導案レビュー用プロンプトメーカー、授業導入アイデア集を追加できます。

## 使用技術

- HTML: ページの構造を作る
- CSS: デザイン、スマートフォン対応、印刷表示を整える
- JavaScript: 検索、絞り込み、コピー、チェック結果の保存を動かす
- JSON: 教室英語、問いテンプレート、チェックリストを管理する
- Markdown: IB・PYPノートや学級経営ヒントの記事を書く
- localStorage: お気に入りやチェック結果を、このブラウザ内に保存する

外部API、AI API、ログイン、会員登録、データベース、決済、ファイルアップロードは使っていません。入力内容はサーバーへ送信しない設計です。

## フォルダ構成

```text
.
├── index.html
├── classroom-english.html
├── question-maker.html
├── self-check.html
├── ib-notes.html
├── classroom-management.html
├── about.html
├── terms.html
├── assets
│   ├── app.js
│   ├── styles.css
│   └── hero-inquiry-desk.png
├── data
│   ├── classroomEnglish.json
│   ├── inquiryQuestionTemplates.json
│   └── lessonChecklists.json
├── content
│   ├── ib-notes
│   └── classroom-management
├── robots.txt
└── sitemap.xml
```

## ローカルでの起動方法

必要なソフトはブラウザとPythonです。

```bash
python3 -m http.server 8080
```

ブラウザで開きます。

```text
http://localhost:8080/
```

HTMLファイルを直接開くと、JSONやMarkdownの読み込みが動かない場合があります。基本はローカルサーバーで確認してください。

## 教室英語データの追加方法

`data/classroomEnglish.json` に1件追加します。JSONでは文字列をダブルクォーテーションで囲みます。

```json
{
  "id": "unique-id",
  "sceneCategory": "褒める",
  "childState": "発表した後",
  "purpose": "よい点を伝える",
  "strength": "やさしい",
  "age": "低学年から",
  "english": "That is a careful observation.",
  "japanese": "よく観察できていますね。",
  "scene": "子どもが細かい点に気づいたとき",
  "point": "答えではなく観察の質を褒めます。",
  "gentler": "Good noticing.",
  "clearer": "You looked carefully and found an important detail.",
  "katakana": "ザット イズ ア ケアフル オブザベーション",
  "related": ["What do you notice?"]
}
```

## 問いテンプレートの追加方法

`data/inquiryQuestionTemplates.json` に追加します。`{theme}` と書いた部分は、フォームに入力したテーマへ置き換わります。

```json
{
  "type": "分類する問い",
  "template": "{theme}をどのようなグループに分けられますか？",
  "thinking": "共通点を見つけて整理する力",
  "followUps": ["なぜそのグループにしましたか？"],
  "note": "分類の基準を子どもが説明できるようにします。"
}
```

## チェック項目の追加方法

`data/lessonChecklists.json` の `before` または `after` に文を追加します。

```json
"授業時間内に収まる見通しがある"
```

## 記事の追加方法

IB・PYPノートは `content/ib-notes`、学級経営ヒントは `content/classroom-management` にMarkdownファイルを追加します。その後、それぞれの `index.json` にファイル名を登録します。

Markdownでは、`#` が大見出し、`##` が小見出し、`-` が箇条書きです。

## localStorageの仕組み

localStorageはブラウザの中に小さなデータを保存する仕組みです。

- 教室英語のお気に入り
- 授業前後セルフチェックの保存結果

これらはサーバーへ送信されません。同じPC・同じブラウザでは残りますが、別の端末やブラウザには共有されません。

## デザイン変更方法

色は `assets/styles.css` の最初にある `:root` で管理しています。

```css
--sage: #456b5a;
--gold: #c68f36;
```

ページ全体の色を変えたい場合は、この値を変えます。

## GitHubへの保存方法

```bash
git status
git add .
git commit -m "Create teacher tools MVP"
```

GitHubにリポジトリを作った後、GitHubの案内に従って `git remote add` と `git push` を実行します。

## 公開方法

静的サイトなので、GitHub Pages、Netlify、Vercelなどで公開できます。公開URLが決まったら、各HTMLの `canonical` と `sitemap.xml`、`robots.txt` の `https://example.com/` を実際のURLに置き換えてください。

公開前に `PUBLICATION_CHECKLIST.md` を使って、個人情報、ローカルパス、勤務先情報、画像メタデータ、著作権リスクを確認してください。

## ビルド方法

このサイトはNext.jsではなく静的HTMLサイトです。GitHub Pagesでは、GitHub Actionsが `out` フォルダをアップロードします。

```bash
npm run lint
npm run typecheck
npm run build
```

`npm run build` を実行すると `out/index.html` が生成されます。GitHub Actionsでは `.github/workflows/pages.yml` が `actions/upload-pages-artifact` に `path: ./out` を渡します。

GitHub PagesのSettingsでは、Sourceを **GitHub Actions** にしてください。

公開URLはリポジトリ名によって変わります。

- リポジトリ名が `osenbe0822-debug.github.io` の場合: `https://osenbe0822-debug.github.io/`
- リポジトリ名がそれ以外の場合: `https://osenbe0822-debug.github.io/リポジトリ名/`

このサイトのCSS、JavaScript、画像、内部リンクは相対パスで書いているため、プロジェクト型URLでも動く構成です。

## エラー時の確認方法

- データが表示されない: `python3 -m http.server 8080` で開いているか確認する
- JSONエラー: カンマ、ダブルクォーテーション、閉じ括弧を確認する
- お気に入りが保存されない: ブラウザのプライベートモードやlocalStorage制限を確認する
- コピーが動かない: ブラウザの権限やHTTPS環境を確認する
- 画像が出ない: `assets/` のファイル名とHTML/CSSのパスを確認する

## 利用上の注意

- 当サイトはIB公式サイトではありません
- 掲載内容はIB公式の評価や認定を示すものではありません
- ツール結果は参考情報です
- 児童、保護者、教職員の個人情報を入力しないでください
- 指導案や内部資料を扱う場合は勤務先の規定を確認してください
- 著作権のある教材や書籍を無断転載しないでください
- 外部AIへ貼り付ける場合は、そのサービスの規約とデータ利用方針を確認してください
- 医療、心理、法律上の専門的助言を提供するサイトではありません
