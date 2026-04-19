# Copilot 実装ワークフロー設計

## 1. 目的

この文書は、`demo02_ferms` で Copilot CLI を使って実装を進めるときに、**なるべく毎回同じ指示を書かずに済むようにする仕組み**を整理したものです。

単なる機能一覧ではなく、Copilot CLI で使える仕組みを一通り比較したうえで、**このプロジェクトに最適な運用案**を定義します。

## 2. 結論

このプロジェクトでは、以下の 4 層構成が最も効率的です。

1. **instructions** で恒久ルールを自動適用する
2. **`doc\tips\copilot`** を人間向けの正本として維持する
3. **prompt template** で毎回の依頼を最小化する
4. 必要に応じて **agents / plan / review / LSP / MCP** を補助的に使う

つまり、**常設ルールは instructions、詳説は docs、毎回の差分は prompt、重い作業は agents** という分担にする。

## 3. Copilot CLI で使える主な仕組み

公式ドキュメントと CLI の help から、この用途に関係する主な仕組みは以下です。

| 仕組み                    | 主用途                           | 自動化向きか | このプロジェクトでの位置づけ |
| ------------------------- | -------------------------------- | ------------ | ---------------------------- |
| `instructions`            | 恒久ルール、参照順、禁止事項     | 高い         | **最優先**                   |
| `skills`                  | 専用能力や特定用途の補助         | 中           | 補助。今回の中核ではない     |
| `MCP`                     | 外部ツールや追加能力の接続       | 中〜高       | 必要になれば導入             |
| `agents / subagents`      | 大きい作業の分担、調査、レビュー | 高い         | 実装時の補助として有効       |
| `/plan`                   | 実装前の計画作成                 | 中           | 複雑作業で有効               |
| `/review`                 | 変更レビュー                     | 中           | 品質確認で有効               |
| `/delegate`               | GitHub 側で PR 化まで進める      | 中           | 将来向け                     |
| `LSP`                     | コード理解、定義参照、補完強化   | 高い         | TypeScript 系で有効          |
| `copilot-setup-steps.yml` | cloud agent の実行環境準備       | 中           | cloud agent 前提なら有効     |
| prompt template           | 毎回の依頼文の標準化             | 高い         | instructions と並ぶ実務必須  |

## 4. 各仕組みの整理

### 4.1 instructions

Copilot CLI は以下の instruction file を自動参照できます。

- `.github/copilot-instructions.md`
- `.github/instructions/**/*.instructions.md`
- `AGENTS.md`
- `CLAUDE.md`
- `GEMINI.md`
- `$HOME/.copilot/copilot-instructions.md`

このプロジェクトではすでに以下を配置済みです。

```text
.github/
  copilot-instructions.md
  instructions/
    auth.instructions.md
    reservation.instructions.md
    docs.instructions.md
```

#### 向いていること

- 毎回必ず守ってほしいルール
- 認証や予約などの恒久的な設計制約
- README に書いてよい / 書いてはいけない内容
- 読むべき仕様の優先順位

#### 向いていないこと

- 毎回変わる細かなタスク内容
- その場限りの注意事項
- 長すぎる説明

#### このプロジェクトでの評価

**最重要。**  
「毎回指定するのが大変」を最も直接解決できる仕組みです。

### 4.2 skills

CLI には `/skills` があり、専用能力を切り替えたり追加できます。  
ただし skill は **毎回読むべきプロジェクトルールを自動適用するための仕組み** ではありません。

今回確認した `customize-cloud-agent` のように、skill は主に以下に向きます。

- cloud agent 実行環境の調整
- 特定分野の専用ワークフロー
- 特別な知識や能力の付与

#### 向いていること

- 環境構築の支援
- 特定ユースケースの専門化

#### 向いていないこと

- プロジェクト共通ルールの常時適用
- 参照順の固定

#### このプロジェクトでの評価

**補助的。**  
今の `demo02_ferms` では skill を主軸にする必要は薄いです。

### 4.3 MCP

CLI には `/mcp` があり、MCP server を追加して能力を拡張できます。  
これは「Copilot が何を参照できるか、何と連携できるか」を広げる仕組みです。

#### 向いていること

- 独自 API や社内ツールの参照
- DB や設計台帳、タスク管理との連携
- 再利用可能な外部能力の追加

#### 向いていないこと

- プロジェクトルールそのものの固定
- instructions の代替

#### このプロジェクトでの評価

**将来有効。**  
例えば以下が必要になれば有効です。

- 設計台帳やチケットを自動参照したい
- PostgreSQL や OpenAPI へ専用接続したい
- Figma やタスク管理を統合したい

現段階では未導入でも十分です。

### 4.4 agents / subagents

CLI には `/agent`, `/fleet`, `/tasks`, `/review`, `/delegate` などがあり、調査・実装・レビューを分担できます。

#### 向いていること

- 大きい作業の並列調査
- 変更差分レビュー
- PR 化前提の重い作業
- 長い実装タスクの段階処理

#### 向いていないこと

- 恒久ルールの保存
- 毎回の前提読込の自動化

#### このプロジェクトでの評価

**実装フェーズで有効。**  
特に以下で役立ちます。

- 仕様影響範囲の調査
- 認証変更のレビュー
- 大きなフェーズ作業の分担

### 4.5 `/plan`

複雑な実装前に計画を作るための仕組みです。

#### 向いていること

- フェーズを跨ぐ実装
- 変更箇所が多い作業
- 影響範囲の整理

#### このプロジェクトでの評価

**有効。**  
ただし `doc\dev-plan` がすでにあるため、毎回必須ではなく**大きい作業時のみ**で十分です。

### 4.6 `/review`

変更内容のレビューを行うための仕組みです。

#### 向いていること

- 認証変更
- 予約ルール変更
- 重要な API 変更

#### このプロジェクトでの評価

**推奨。**  
とくに認証や予約競合制御など、事故コストが高い箇所に向いています。

### 4.7 LSP

CLI は `/lsp` と `.github/lsp.json` により LSP を利用できます。

#### 向いていること

- TypeScript コード理解
- 定義ジャンプ
- 参照追跡
- 型エラーの把握

#### このプロジェクトでの評価

**導入価値が高い。**  
Nuxt / NestJS は TypeScript 前提なので、`typescript-language-server` の設定は効果が大きいです。

### 4.8 `copilot-setup-steps.yml`

これは cloud agent の開発環境を自動準備する仕組みです。

#### 向いていること

- 依存関係の事前インストール
- Node / Java / DB client の準備
- Windows runner や larger runner の利用

#### 向いていないこと

- ローカル CLI セッションでの毎回のルール読込
- instructions の代替

#### このプロジェクトでの評価

**cloud agent 中心にするなら有効。**  
ただし今の相談テーマである「毎回ルールを指定したくない」の解決には直接効きません。

## 5. 考えられる自動化・効率化の仕組み一覧

### 5.1 ルール固定系

1. `.github/copilot-instructions.md`
2. `.github/instructions/*.instructions.md`
3. `$HOME/.copilot/copilot-instructions.md`
4. `AGENTS.md` など互換 instruction files

### 5.2 依頼文短縮系

1. `doc\tips\copilot\03-prompt-template.md`
2. タスク別テンプレート
3. チーム共通の依頼フォーマット

### 5.3 調査・実装分担系

1. `/agent`
2. `/fleet`
3. `/tasks`
4. `/review`
5. `/delegate`

### 5.4 能力拡張系

1. `/mcp`
2. `/skills`
3. `/plugin`
4. `/lsp`

### 5.5 実行環境自動化系

1. `.github/workflows/copilot-setup-steps.yml`
2. `copilot` environment secrets / variables
3. self-hosted runner / larger runner

### 5.6 セッション効率化系

1. `/instructions`
2. `/env`
3. `/model`
4. `/plan`
5. `/compact`
6. `/resume`

## 6. 本プロジェクトでの最適案

## 6.1 推奨アーキテクチャ

このプロジェクトでは次の構成を採用するのが最適です。

```text
Layer 1: 自動適用
  .github/copilot-instructions.md
  .github/instructions/*.instructions.md

Layer 2: 詳細ルールの正本
  doc/tips/copilot/01-mandatory-rules.md
  doc/tips/copilot/02-reference-order.md

Layer 3: 実装の正本
  doc/spec/*
  doc/spec-auth/*
  doc/dev-plan/*

Layer 4: 毎回の差分指示
  doc/tips/copilot/03-prompt-template.md

Layer 5: 補助能力
  /review
  /plan
  /lsp
  /agent
  /mcp
```

## 6.2 この案が最適な理由

### 理由1: 毎回の説明量を最小にできる

instructions に恒久ルールを入れることで、毎回書くのは **今回の差分タスク** だけで済みます。

### 理由2: 変更に強い

ルール変更は `.github` と `doc\tips\copilot` の更新だけで済み、過去テンプレートを全部直す必要がありません。

### 理由3: 説明の長文化を避けられる

instructions には短い命令だけを書き、詳細説明は `doc\tips\copilot` に逃がせます。

### 理由4: 実装正本がぶれない

設計判断は `doc\spec` と `doc\dev-plan` に集約し、Copilot 運用ルールと分離できます。

### 理由5: 今後の拡張にも対応しやすい

必要になれば LSP, MCP, cloud agent setup を足せますが、土台はそのまま使えます。

## 7. 推奨運用手順

### 7.1 初期状態

すでに本プロジェクトでは以下を整備済みです。

- `.github/copilot-instructions.md`
- `.github/instructions/auth.instructions.md`
- `.github/instructions/reservation.instructions.md`
- `.github/instructions/docs.instructions.md`
- `doc/tips/copilot/*`

### 7.2 毎回の実装依頼

毎回の依頼は次のレベルまで短くしてよいです。

```text
dev-planのphase1 を実装してください。
実装結果をdev-plan/resultディレクトリ配下に保存してください。
必要なら関連 spec と dev-plan も更新してください。
```

理由は、恒久ルールと参照順は instruction 側で既に持たせているためです。

### 7.3 大きい作業のとき

以下を併用します。

1. `/plan`
2. `/review`
3. `/agent` または `/fleet`

### 7.4 認証や予約競合のような重要箇所

以下を追加します。

1. 認証や予約の専用 instruction を使う
2. 実装後に `/review`
3. 対象サービス起動後のテスト実施

## 8. 本プロジェクトでの追加推奨

### 8.1 LSP の追加

TypeScript 向けに `.github/lsp.json` を追加する価値が高いです。

例:

```json
{
  "lspServers": {
    "typescript": {
      "command": "typescript-language-server",
      "args": ["--stdio"],
      "fileExtensions": {
        ".ts": "typescript",
        ".tsx": "typescript",
        ".vue": "typescript"
      }
    }
  }
}
```

### 8.2 cloud agent を使うなら setup steps を追加

もし GitHub 側の cloud agent で継続的に実装させるなら、`.github/workflows/copilot-setup-steps.yml` を追加して依存関係の準備を自動化すると効率が上がります。

ただしこれは **環境準備の自動化** であり、**ルール指示の自動化の主軸ではない** 点に注意します。

### 8.3 MCP は必要になってから導入

今は未導入でよいです。  
以下のどれかが発生したら導入を検討します。

- 外部設計台帳を参照したい
- タスク管理システムとつなぎたい
- DB や API を専用プロトコルで安全に扱いたい

## 9. 採用しない運用

このプロジェクトでは、以下を主軸にはしません。

### 9.1 skill 中心運用

理由:

- 恒久ルールの自動適用に向かない
- プロジェクト固有ルールの保守先としては重い

### 9.2 毎回長文 prompt

理由:

- 指示漏れや表現揺れが起きやすい
- 更新時の保守負荷が高い

### 9.3 prompt だけで参照文書を指示する運用

理由:

- 自動化効果が薄い
- instructions に寄せた方が再利用しやすい

## 10. 実務上のおすすめ運用

最終的には以下が最も実務的です。

1. `.github/copilot-instructions.md` に全体ルールを書く
2. `.github/instructions/*.instructions.md` に領域別ルールを書く
3. `doc/tips/copilot` に詳細ルールとテンプレートを置く
4. `doc/spec*` と `doc/dev-plan*` を正本にする
5. 大きい作業だけ `/plan` と `/review` を併用する
6. TypeScript の理解改善が必要になったら LSP を追加する
7. 外部連携が必要になったら MCP を追加する

## 11. すぐ使える短い依頼例

### 11.1 機能実装

```text
phase3 に沿って予約一覧 API と画面を実装してください。
必要なテストコードと関連ドキュメント更新も含めて進めてください。
```

### 11.2 認証変更

```text
phase2 と spec-auth に沿って handover 周りを修正してください。
demo01 と整合しない方式には変えないでください。
```

### 11.3 ドキュメント更新

```text
現在の実装に合わせて spec と dev-plan を更新してください。
README には本番環境依存の内容を追加しないでください。
```

## 12. まとめ

このプロジェクトで最適なのは、**instructions を中核にし、docs を正本として持ち、prompt は差分だけにする運用** です。  
skills, MCP, agents, LSP, setup steps は重要ですが、役割は補助です。  
まずは今作った `.github` と `doc\tips\copilot` を土台にし、必要に応じて **LSP → MCP → cloud agent setup** の順で拡張するのが最も無理がありません。
