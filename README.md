# gas-gdrive-notice

Google Drive の特定のディレクトリ下を監視して、新しいファイルが追加されたら Discode に通知する Bot

## メモ

1. シートを作成
2. スクリプトに`main.js`を追加
3. プロパティを設定
   | プロパティ名 | 値の説明 |
   | --- | ------- |
   | folderId | 監視する Drive のディレクトリ ID |
   | webhookURL | Discode の WebhookURL |
4. お好みの間隔でトリガーを設定
