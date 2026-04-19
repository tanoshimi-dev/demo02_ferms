# Database assets

このディレクトリは、FERMS の migration と seed を配置するための場所です。

- `migrations/`: スキーマ変更
- `seeds/`: 開発・デモ用データ

Phase 5 時点では、空の DB で backend が起動すると catalog seed により
デモ向けの施設 / 設備サンプルが自動投入されます。将来 migration / seed を
分離する場合も、このディレクトリを正本として整理します。
