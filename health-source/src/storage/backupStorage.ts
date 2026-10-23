/** Raw strings preserve legacy, unknown and even malformed records without migration. */
export type MyFitBackup = { format: 'myfit-local-storage'; version: 1; createdAt: string; entries: Record<string, string> }
export const RESTORE_SNAPSHOT_KEY = 'myfit-backup-before-restore'
type StorageAccess = Pick<Storage, 'length' | 'key' | 'getItem' | 'setItem' | 'removeItem'>
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
const isDataKey = (key: string) => /^myfit(?:[-_:]|$)/i.test(key) && key !== RESTORE_SNAPSHOT_KEY

export function createBackup(storage: StorageAccess = localStorage): MyFitBackup {
  const entries: Record<string, string> = Object.create(null)
  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index)
    if (key && isDataKey(key)) {
      const value = storage.getItem(key)
      if (value !== null) entries[key] = value
    }
  }
  return { format: 'myfit-local-storage', version: 1, createdAt: new Date().toISOString(), entries }
}

export function parseBackup(text: string): MyFitBackup {
  const value: unknown = JSON.parse(text)
  if (!isRecord(value) || value.format !== 'myfit-local-storage' || value.version !== 1 || typeof value.createdAt !== 'string' || !Number.isFinite(Date.parse(value.createdAt)) || !isRecord(value.entries)) {
    throw new Error('MyFitのバックアップ形式ではありません。')
  }
  const entries: Record<string, string> = Object.create(null)
  for (const [key, raw] of Object.entries(value.entries)) {
    if (!isDataKey(key) || typeof raw !== 'string') throw new Error('復元できない保存項目が含まれています。')
    entries[key] = raw
  }
  return { format: 'myfit-local-storage', version: 1, createdAt: value.createdAt, entries }
}

/** Overlay only listed keys; never clear unrelated or omitted data. */
export function restoreBackup(backup: MyFitBackup, storage: StorageAccess = localStorage): void {
  const validated = parseBackup(JSON.stringify(backup))
  const previous = Object.entries(validated.entries).map(([key]) => [key, storage.getItem(key)] as const)
  // Abort before touching records if there is insufficient space for a safety snapshot.
  storage.setItem(RESTORE_SNAPSHOT_KEY, JSON.stringify(createBackup(storage)))
  try {
    for (const [key, value] of Object.entries(validated.entries)) storage.setItem(key, value)
  } catch {
    let rollbackFailed = false
    for (const [key, value] of previous) {
      try { if (value === null) storage.removeItem(key); else storage.setItem(key, value) } catch { rollbackFailed = true }
    }
    throw new Error(rollbackFailed ? '復元と一部の巻き戻しに失敗しました。復元前バックアップを保存してください。' : '保存に失敗したため、変更を元に戻しました。空き容量を確認してください。')
  }
}
