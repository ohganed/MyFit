import { useState } from 'react'
import { createBackup, parseBackup, restoreBackup, RESTORE_SNAPSHOT_KEY, type MyFitBackup } from '../storage/backupStorage'

function download(text: string, name: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function SettingsPage() {
  const [pending, setPending] = useState<MyFitBackup | null>(null)
  const [message, setMessage] = useState('')
  const act = (action: () => void) => {
    try { action() } catch (error) { setMessage(error instanceof Error ? error.message : '保存に失敗しました。') }
  }
  return (
    <section className="settings-page">
      <div className="page-heading"><p className="page-eyebrow">SETTINGS</p><h2>設定とデータ保護</h2><p>記録をバックアップして、安全に引き継ぎます。</p></div>
      <div className="settings-group">
        <h3>保存場所</h3>
        <div className="setting-row"><div><strong>筋トレ・ルーティン・生活の記録</strong><p>このブラウザのlocalStorageに保存します。同じブラウザ・同じURL（ホスト名とポート番号を含む）で開くと既存の記録を引き継げます。別のURLへ移るときは、元のURLでバックアップして移行先で復元してください。</p></div></div>
        <div className="setting-row"><div><strong>体重の記録は別の保存先です</strong><p>連携体重はサーバーの server/myfit.sqlite に保存され、このJSONには含まれません。Quick Addの手入力体重はブラウザ内に保存され、JSONに含まれます。移行時はアプリとAPIを停止して、このファイルも別途コピーしてください。</p></div></div>
      </div>
      <div className="settings-group">
        <h3>ブラウザ内の記録をバックアップ</h3>
        <p>MyFitの保存項目を、元の文字列のままJSONに保存します。</p>
        <button type="button" onClick={() => act(() => { download(JSON.stringify(createBackup(), null, 2), 'myfit-backup.json'); setMessage('バックアップのダウンロードを開始しました。') })}>バックアップを保存</button>
        <p><label>復元するJSONを選択 <input type="file" accept=".json,application/json" onChange={async event => {
          const file = event.target.files?.[0]
          setPending(null)
          setMessage('')
          if (!file) return
          try { setPending(parseBackup(await file.text())) } catch (error) { setMessage(error instanceof Error ? error.message : 'ファイルを読み込めませんでした。') }
          event.target.value = ''
        }} /></label></p>
        {pending && <div className="setting-row"><div>
          <strong>復元内容の確認</strong>
          <p>作成日時：{new Date(pending.createdAt).toLocaleString('ja-JP')}</p>
          <p>{Object.keys(pending.entries).length}個の保存項目を復元します。同じ名前の項目は置き換えます。ファイルにない項目は残します。</p>
          <ul>{Object.entries(pending.entries).map(([key, value]) => <li key={key}>{key}（{value.length.toLocaleString()}文字）</li>)}</ul>
          <p>復元前の全項目をブラウザ内に退避してから実行します。</p>
          <button type="button" disabled={!Object.keys(pending.entries).length} onClick={() => act(() => { restoreBackup(pending); setPending(null); setMessage('復元しました。再読み込みすると全画面に反映されます。') })}>この内容で復元する</button>{' '}
          <button type="button" onClick={() => setPending(null)}>キャンセル</button>
        </div></div>}
        <p><button type="button" onClick={() => act(() => {
          const snapshot = localStorage.getItem(RESTORE_SNAPSHOT_KEY)
          if (!snapshot) { setMessage('復元前バックアップはまだありません。'); return }
          download(snapshot, 'myfit-before-restore.json')
          setMessage('復元前バックアップのダウンロードを開始しました。')
        })}>直近の復元前バックアップを保存</button>{' '}<button type="button" onClick={() => window.location.reload()}>画面を再読み込み</button></p>
        {message && <p role="status">{message}</p>}
      </div>
    </section>
  )
}
export default SettingsPage
