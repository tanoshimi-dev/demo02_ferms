# Seeds

Phase 5 時点では、本番 compose の DB 初期化時に
`sys\db\migrations\001_create_ferms_core.sql` と
`sys\db\seeds\001_seed_catalog.sql` から
デモ向け facility / equipment catalog が投入されます。

投入されるデータは次を意図しています。

- 利用者向け予約導線で最初に試しやすい有効な施設 / 設備
- 管理者画面で有効 / 無効切り替えを確認しやすいサンプル
- 停止中施設 / 停止中設備に対する予約禁止の確認用データ

将来 seed を外部ファイル化する場合も、この README を最新化してください。
