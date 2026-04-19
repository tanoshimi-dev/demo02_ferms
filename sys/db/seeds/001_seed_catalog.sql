INSERT INTO facilities (id, name, description, location, is_active)
VALUES
  (
    'f7c6ffb6-62d7-4f3f-a7cc-3fd0768a9d11',
    'Creative Studio A',
    '撮影・収録・配信のデモ確認に使いやすい、小規模スタジオです。',
    'Tokyo / Floor 3',
    TRUE
  ),
  (
    '3cbd9de5-bb4f-4865-a2b7-7961f733d447',
    'Meeting Room B',
    '打ち合わせ、ワークショップ、利用者予約フローのデモ向け会議室です。',
    'Tokyo / Floor 5',
    TRUE
  ),
  (
    '378fe687-e8f5-4c89-aaca-b1ea9f72031f',
    'Event Hall C',
    'イベントや説明会の想定を含む、広めのデモ用ホールです。',
    'Tokyo / Floor 8',
    TRUE
  ),
  (
    '6e4dbb0f-e229-4f65-8d0f-3c2e53bd5cdb',
    'Archive Room D',
    '停止中施設の挙動確認に使う、運用停止サンプルの保管室です。',
    'Tokyo / Floor 1',
    FALSE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO equipments (id, facility_id, name, description, is_active)
VALUES
  (
    'f678dcb7-e468-4694-bbfd-0db7fa86f8b8',
    'f7c6ffb6-62d7-4f3f-a7cc-3fd0768a9d11',
    '4K Camera Set',
    '三脚・照明込みの撮影セットです。',
    TRUE
  ),
  (
    '6959977c-cf46-4782-a5f3-e0e844fd81a1',
    'f7c6ffb6-62d7-4f3f-a7cc-3fd0768a9d11',
    'Wireless Microphone',
    '収録用のワイヤレスマイクです。',
    TRUE
  ),
  (
    'df59d350-8f77-4d6e-b582-593effa960f8',
    '3cbd9de5-bb4f-4865-a2b7-7961f733d447',
    'Projector',
    '会議投影用プロジェクターです。',
    TRUE
  ),
  (
    'cfc35691-05b0-424d-a9f7-63dbef6dd380',
    '3cbd9de5-bb4f-4865-a2b7-7961f733d447',
    'Conference Speaker',
    'オンライン会議用のスピーカーフォンです。',
    TRUE
  ),
  (
    '2bf0a331-caf7-4db6-8a44-a06e70599d9d',
    '378fe687-e8f5-4c89-aaca-b1ea9f72031f',
    'Stage Lighting Kit',
    '簡易ステージ用の照明セットです。',
    TRUE
  ),
  (
    '7d48ceef-4ea0-4c1c-a376-6f5f3926eb3a',
    '378fe687-e8f5-4c89-aaca-b1ea9f72031f',
    'Recording Mixer',
    '配信用の音声ミキサーです。',
    FALSE
  ),
  (
    'be9e19da-dd7c-4abf-b2f4-2ca4fcb4b52c',
    '6e4dbb0f-e229-4f65-8d0f-3c2e53bd5cdb',
    'Inventory Scanner',
    '棚卸し用のスキャナーです。',
    FALSE
  )
ON CONFLICT (id) DO NOTHING;
