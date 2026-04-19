# Copilot 参照順

このファイルは、Copilot が `demo02_ferms` で作業するときに**どの文書をどの順で読むか**を定義します。

## 1. 常に最初に読む

1. `doc\tips\copilot\01-mandatory-rules.md`
2. `doc\policy.md`
3. `README.md`

## 2. 実装前に読む

1. `doc\spec\ferms-spec.md`
2. `doc\spec-auth\README.md`
3. `doc\dev-plan\README.md`

## 3. フェーズごとに追加で読む

| 作業内容 | 追加で読む文書 |
| --- | --- |
| 実行基盤 | `doc\dev-plan\phase1-foundation.md` |
| 認証 / 共通基盤 | `doc\dev-plan\phase2-auth-and-common.md` |
| 利用者向け予約導線 | `doc\dev-plan\phase3-reservation-user-flow.md` |
| 管理機能 | `doc\dev-plan\phase4-admin-and-operations.md` |
| 仕上げ / デモ準備 | `doc\dev-plan\phase5-hardening-and-release.md` |

## 4. タスク別の参照補助

### 4.1 認証に関わる場合

必ず以下を読む。

1. `doc\spec-auth\README.md`
2. `doc\dev-plan\phase2-auth-and-common.md`

### 4.2 施設・設備・予約機能に関わる場合

必ず以下を読む。

1. `doc\spec\ferms-spec.md`
2. `doc\dev-plan\phase3-reservation-user-flow.md`
3. 必要に応じて `doc\dev-plan\phase4-admin-and-operations.md`

### 4.3 README や説明文を書く場合

必ず以下を読む。

1. `README.md`
2. `doc\policy.md`
3. 関連する `doc\spec*`

## 5. 読み方のルール

1. まず固定ルールを読む
2. 次にプロジェクト全体方針を読む
3. 次に今回の対象仕様を読む
4. 最後に実装フェーズ文書を読む

この順番を崩すと、技術方針と個別タスクの整合が取りづらくなります。
