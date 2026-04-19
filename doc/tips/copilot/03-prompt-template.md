# Copilot 依頼テンプレート

以下は、このプロジェクトで Copilot に作業を依頼するときの基本テンプレートです。  
毎回この形をベースに、タスク内容だけ差し替えて使います。

## 1. 実装依頼テンプレート

```text
作業前に以下を読んでください。

1. doc\tips\copilot\01-mandatory-rules.md
2. doc\tips\copilot\02-reference-order.md
3. 今回のタスクに関係する文書

今回のタスク:
[ここに依頼内容を書く]

期待すること:
- 関連仕様を読んでから着手する
- 既存方針に沿って実装する
- 必要なら関連文書も更新する
- 変更は今回のタスクに必要な範囲へ絞る
```

## 2. 認証タスク用テンプレート

```text
作業前に以下を読んでください。

1. doc\tips\copilot\01-mandatory-rules.md
2. doc\tips\copilot\02-reference-order.md
3. doc\spec-auth\README.md
4. doc\dev-plan\phase2-auth-and-common.md

今回のタスク:
[認証まわりの依頼を書く]

注意:
- demo01_crm と整合する方式を崩さない
- portal_token を frontend で直接扱わない
- 認証の最終判定は backend に置く
```

## 3. 機能実装用テンプレート

```text
作業前に以下を読んでください。

1. doc\tips\copilot\01-mandatory-rules.md
2. doc\tips\copilot\02-reference-order.md
3. doc\spec\ferms-spec.md
4. 関連する dev-plan phase 文書

今回のタスク:
[機能実装の依頼を書く]

注意:
- Nuxt / NestJS の規約ベース構成に従う
- 予約ルールは backend で保証する
- 必要なら spec や dev-plan も更新する
```

## 4. ドキュメント整理用テンプレート

```text
作業前に以下を読んでください。

1. doc\tips\copilot\01-mandatory-rules.md
2. doc\tips\copilot\02-reference-order.md
3. 関連する既存ドキュメント

今回のタスク:
[文書作成・更新の依頼を書く]

注意:
- 本番環境固有の情報は、明示的な指示がない限り書かない
- 既存文書との重複や矛盾を避ける
- このプロジェクトの正本を壊さない
```

## 5. 運用のコツ

- 毎回すべてを長文で書かず、固定事項はこのディレクトリへ寄せる
- タスク本文には「今回だけ違うこと」だけを書く
- 依頼のたびに「どの文書を読むか」を明示する
