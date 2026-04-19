# Copilot 運用ガイド

## 1. 目的

このディレクトリは、`demo02_ferms` で GitHub Copilot に作業を依頼するときの**固定ルール**と**参照順**を整理するための場所です。

実装前にここを整備しておくと、毎回同じ前提を伝えやすくなり、仕様逸脱や不要な実装を減らせます。

## 2. 推奨ファイル構成

```text
doc/
  tips/
    copilot/
      README.md
      01-mandatory-rules.md
      02-reference-order.md
      03-prompt-template.md
```

## 3. 各ファイルの役割

| ファイル | 役割 | 使い方 |
| --- | --- | --- |
| `README.md` | 入口説明 | Copilot 運用の全体像を最初に確認する |
| `01-mandatory-rules.md` | 必ず守らせるルール | 実装依頼のたびに参照させる |
| `02-reference-order.md` | 読むべき文書の優先順 | 作業開始時に「この順で読んでから進める」と指示する |
| `03-prompt-template.md` | 依頼文の雛形 | 新しい実装依頼を出すときにコピペして使う |

## 4. どう利用するか

### 4.1 毎回の作業開始時

Copilot に最初に次のように伝えます。

1. `doc\tips\copilot\01-mandatory-rules.md` を読む
2. `doc\tips\copilot\02-reference-order.md` の順に文書を読む
3. 読んだ内容に従って実装またはドキュメント更新を行う

### 4.2 新しい作業を依頼するとき

`03-prompt-template.md` をベースに、その回のタスク内容だけ差し替えて使います。

### 4.3 ルールを更新するとき

- 長期的に守らせたいことは `01-mandatory-rules.md` に追記する
- 参照順が変わったら `02-reference-order.md` を更新する
- 単発の事情は prompt 本文にだけ書き、固定ルールには入れすぎない

## 5. 運用ルール

- **プロジェクト共通の恒久ルール** は `01-mandatory-rules.md`
- **読むべき資料の順番** は `02-reference-order.md`
- **毎回の依頼文** は `03-prompt-template.md`
- 実装中に得た知見を「今後も毎回使う」なら、この配下へ昇格する

## 6. この構成にする理由

- ルールと仕様参照を分離できる
- 毎回の依頼文が短くなる
- 変更履歴を追いやすい
- 実装前の読み漏れを減らせる
