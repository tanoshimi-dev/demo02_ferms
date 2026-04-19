# Database assets

このディレクトリは、FERMS の migration と seed を配置するための場所です。

- `migrations/`: スキーマ変更
- `seeds/`: 開発・デモ用データ

Phase 5 時点では、空の DB で backend が起動すると catalog seed により
デモ向けの施設 / 設備サンプルが自動投入されます。将来 migration / seed を
分離する場合も、このディレクトリを正本として整理します。

production compose では `db/migrations/*.sql` と `db/seeds/*.sql` を
`docker-entrypoint-initdb.d` にマウントし、`demo01_crm` と同じく
DB 初期化時に schema / seed を投入します。
