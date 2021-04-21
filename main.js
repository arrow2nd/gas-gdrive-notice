const config = PropertiesService.getScriptProperties().getProperties();

function main() {
  const lock = LockService.getScriptLock();

  if (lock.tryLock(3000)) {
    try {
      exec();
    } catch (err) {
      console.log(`error: ${err}`);
    } finally {
      lock.releaseLock();
    }
  } else {
    console.log("既にスクリプトが実行されています");
  }
}

function exec() {
  const id = config.folderId;
  const files = DriveApp.getFolderById(id).getFiles();
  const cacheIds = getCacheFileIds();

  let fields = [];
  let fileIds = [];

  // フォルダ直下のファイルを取得
  while (files.hasNext()) {
    const file = files.next();
    const fileId = file.getId();

    fileIds.push([fileId]);

    // キャッシュにあれば処理を飛ばす
    const existCache = cacheIds.find((e) => e == fileId);
    if (existCache) continue;

    // 更新通知文に追加
    const filename = file.getName();
    const filedesc =
      file.getDescription() || "説明文がありません…（カニの勝ち）";
    const fileURL = file.getUrl();
    const filetime = Utilities.formatDate(
      file.getDateCreated(),
      "JST",
      "yyyy年M月d日 H時m分"
    );

    fields.push({
      name: filename,
      value: `【説明】\n ${filedesc}\n\n【更新日時】\n ${filetime}\n\n[ダウンロード](${fileURL})`,
    });
  }

  // 更新がなければ終了する
  if (fields.length <= 0) {
    console.log("[ No update ]");
    return;
  }

  // 通知を飛ばす
  postDiscode(fields);

  // キャッシュ
  saveCacheFileIds(fileIds);
  console.log("[ success! ]");
}

// 確認済みファイルIDのリストを取得
function getCacheFileIds() {
  const ss = SpreadsheetApp.getActiveSheet();
  const endRow = ss.getLastRow() - 1;

  if (endRow <= 0) return [];

  return ss.getRange(2, 1, endRow, 1).getValues();
}

// 確認済みファイルIDのリストを保存
function saveCacheFileIds(fileIds) {
  const ss = SpreadsheetApp.getActiveSheet();

  ss.getRange(2, 1, fileIds.length, 1).setValues(fileIds);
}

// Discodeへ飛ばす
function postDiscode(fields) {
  const webhook = config.webhookURL;
  const payload = {
    username: "GDrive更新通知",
    // avatar_url: "",
    embeds: [
      {
        title: "新しいファイルが追加されました！",
        color: 0xff4079,
        fields: fields,
      },
    ],
  };
  const params = {
    method: "POST",
    headers: { "Content-type": "application/json" },
    payload: JSON.stringify(payload),
  };

  UrlFetchApp.fetch(webhook, params);
}
