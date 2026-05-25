import { useEffect, useState } from 'react'
import {
  createJournalEntry,
  createWorkType,
  deleteJournalEntry,
  getJournalEntries,
  getWorkTypes,
  toDateInputValue,
  updateJournalEntry,
} from './api'
import type { CreateJournalEntryPayload, JournalEntry, WorkType } from './types'
import './App.css'

const CUSTOM_WORK_TYPE_ID = '__custom__'

type FormState = {
  performedDate: string
  workTypeId: string
  customWorkTypeName: string
  volume: string
  volumeUnit: string
  executorName: string
}

const emptyForm = (): FormState => ({
  performedDate: new Date().toISOString().slice(0, 10),
  workTypeId: '',
  customWorkTypeName: '',
  volume: '',
  volumeUnit: 'м³',
  executorName: '',
})

function entryToForm(entry: JournalEntry): FormState {
  return {
    performedDate: toDateInputValue(entry.performedDate),
    workTypeId: entry.workTypeId,
    customWorkTypeName: '',
    volume: String(Number(entry.volume)),
    volumeUnit: entry.volumeUnit,
    executorName: entry.executorName,
  }
}

function validateForm(f: FormState): string | null {
  if (!f.performedDate) return 'Укажите дату'
  if (!f.workTypeId) return 'Выберите вид работ'
  if (f.workTypeId === CUSTOM_WORK_TYPE_ID) {
    const name = f.customWorkTypeName.trim()
    if (!name) return 'Введите название своего вида работ'
    if (name.length > 255) return 'Название не длиннее 255 символов'
  }
  const vol = Number(f.volume)
  if (Number.isNaN(vol) || vol < 0) return 'Укажите корректный объём'
  if (!f.volumeUnit.trim()) return 'Укажите единицу измерения'
  if (!f.executorName.trim()) return 'Укажите ФИО исполнителя'
  return null
}

function entriesWordRu(count: number): string {
  const n100 = count % 100
  const n10 = count % 10
  if (n100 >= 11 && n100 <= 14) return 'записей'
  if (n10 === 1) return 'запись'
  if (n10 >= 2 && n10 <= 4) return 'записи'
  return 'записей'
}

function App() {
  const [workTypes, setWorkTypes] = useState<WorkType[]>([])
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    Promise.resolve()
      .then(() => {
        if (!cancelled) {
          setLoading(true)
        }
        return Promise.all([
          getWorkTypes(),
          getJournalEntries({
            from: filterFrom || undefined,
            to: filterTo || undefined,
            sortOrder,
          }),
        ])
      })
      .then((result) => {
        if (cancelled || !result) return
        const [wt, list] = result
        setWorkTypes(wt)
        setEntries(list)
        setError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setError(
          err instanceof Error ? err.message : 'Не удалось загрузить данные',
        )
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [filterFrom, filterTo, sortOrder])

  const refetchAfterMutation = async () => {
    setError(null)
    setLoading(true)
    try {
      const [wt, list] = await Promise.all([
        getWorkTypes(),
        getJournalEntries({
          from: filterFrom || undefined,
          to: filterTo || undefined,
          sortOrder,
        }),
      ])
      setWorkTypes(wt)
      setEntries(list)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Не удалось загрузить данные',
      )
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm())
    setModalOpen(true)
  }

  const openEdit = (entry: JournalEntry) => {
    setEditingId(entry.id)
    setForm(entryToForm(entry))
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
  }

  const onSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    const msg = validateForm(form)
    if (msg) {
      setError(msg)
      return
    }
    setSaving(true)
    setError(null)
    try {
      let resolvedWorkTypeId = form.workTypeId
      if (form.workTypeId === CUSTOM_WORK_TYPE_ID) {
        const created = await createWorkType({
          name: form.customWorkTypeName.trim(),
        })
        resolvedWorkTypeId = created.id
      }
      const payload: CreateJournalEntryPayload = {
        performedDate: form.performedDate,
        workTypeId: resolvedWorkTypeId,
        volume: Number(form.volume),
        volumeUnit: form.volumeUnit.trim(),
        executorName: form.executorName.trim(),
      }
      if (editingId) {
        await updateJournalEntry(editingId, payload)
      } else {
        await createJournalEntry(payload)
      }
      setModalOpen(false)
      await refetchAfterMutation()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (entry: JournalEntry) => {
    if (
      !window.confirm(
        `Удалить запись от ${toDateInputValue(entry.performedDate)}?`,
      )
    ) {
      return
    }
    setError(null)
    try {
      await deleteJournalEntry(entry.id)
      await refetchAfterMutation()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось удалить')
    }
  }

  const entriesLabel = loading ? '…' : `${entries.length} ${entriesWordRu(entries.length)}`

  return (
    <div className="app-shell">
      <div className="app">
        <header className="hero">
          <div className="hero-inner hero-inner--single">
            <div>
              <h1 className="hero-title">Журнал работ</h1>
              <p className="hero-desc">
                Строки в таблице — что делали на объекте и кто делал.
              </p>
              <div className="hero-actions">
                <button
                  type="button"
                  className="primary btn-glow"
                  onClick={openCreate}
                >
                  Добавить запись
                </button>
                <div className="hero-stat">
                  Записей:{' '}
                  <span className="hero-stat-num">{entriesLabel}</span>
                </div>
                <div className="hero-stat">
                  Видов работ:{' '}
                  <span className="hero-stat-num">{workTypes.length}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="surface-card">
          {error && (
            <div className="banner error" role="alert">
              {error}
            </div>
          )}

          <section className="toolbar">
            <div className="filters">
              <label>
                <span className="field-hint">Дата с</span>
                <input
                  type="date"
                  value={filterFrom}
                  onChange={(e) => setFilterFrom(e.target.value)}
                />
              </label>
              <label>
                <span className="field-hint">По</span>
                <input
                  type="date"
                  value={filterTo}
                  onChange={(e) => setFilterTo(e.target.value)}
                />
              </label>
              <label>
                <span className="field-hint">Сортировка</span>
                <select
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as 'ASC' | 'DESC')
                  }
                >
                  <option value="DESC">Сначала новые</option>
                  <option value="ASC">Сначала старые</option>
                </select>
              </label>
            </div>
            <button type="button" className="primary btn-glow" onClick={openCreate}>
              Новая запись
            </button>
          </section>

          <div
            className={`table-wrap ${!loading ? 'table-shell--ready' : ''} ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <div className="sk-stack" aria-busy aria-label="Загрузка таблицы">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={`sk-row-${i}`} className="sk-row">
                    <span className="sk-bar sm" />
                    <span className="sk-bar lg" />
                    <span className="sk-bar sm" />
                    <span className="sk-bar lg" />
                  </div>
                ))}
              </div>
            ) : entries.length === 0 ? (
              <div className="table-empty">
                <div className="table-empty-visual" aria-hidden />
                <h3>Ничего не нашлось</h3>
                <p>Смените даты фильтра или добавьте запись.</p>
                <div style={{ marginTop: '1.15rem' }}>
                  <button
                    type="button"
                    className="primary btn-glow"
                    onClick={openCreate}
                  >
                    Добавить
                  </button>
                </div>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Вид работ</th>
                    <th>Объём</th>
                    <th>Исполнитель</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {entries.map((row, i) => (
                    <tr
                      key={row.id}
                      style={
                        { '--i': i } as React.CSSProperties & {
                          '--i'?: number
                        }
                      }
                    >
                      <td className="col-date">
                        {toDateInputValue(row.performedDate)}
                      </td>
                      <td className="col-work">
                        {row.workType?.name ?? '—'}
                      </td>
                      <td className="col-vol">
                        {row.volume} {row.volumeUnit}
                      </td>
                      <td>{row.executorName}</td>
                      <td className="actions">
                        <button
                          type="button"
                          className="link"
                          onClick={() => openEdit(row)}
                        >
                          Изменить
                        </button>
                        <button
                          type="button"
                          className="link danger"
                          onClick={() => void onDelete(row)}
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      {modalOpen && (
        <div className="modal-backdrop" role="presentation" onClick={closeModal}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="entry-form-title"
            onClick={(ev) => ev.stopPropagation()}
          >
            <h2 id="entry-form-title">
              {editingId ? 'Редактирование записи' : 'Новая запись'}
            </h2>
            <form onSubmit={(e) => void onSubmitForm(e)} className="form">
              <label>
                Дата выполнения
                <input
                  type="date"
                  required
                  value={form.performedDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, performedDate: e.target.value }))
                  }
                />
              </label>
              <label>
                Вид работ
                <select
                  required
                  value={form.workTypeId}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      workTypeId: e.target.value,
                      customWorkTypeName:
                        e.target.value === CUSTOM_WORK_TYPE_ID
                          ? f.customWorkTypeName
                          : '',
                    }))
                  }
                >
                  <option value="">— выберите —</option>
                  {workTypes.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                  <option value={CUSTOM_WORK_TYPE_ID}>
                    Свой вид работ…
                  </option>
                </select>
              </label>
              {form.workTypeId === CUSTOM_WORK_TYPE_ID && (
                <label className="field-accent">
                  <span className="field-hint">Как назвать в справочнике</span>
                  <input
                    type="text"
                    placeholder="Своё название"
                    maxLength={255}
                    value={form.customWorkTypeName}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        customWorkTypeName: e.target.value,
                      }))
                    }
                    autoComplete="off"
                  />
                </label>
              )}
              <div className="row2">
                <label>
                  Объём
                  <input
                    type="number"
                    step="any"
                    min={0}
                    required
                    value={form.volume}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, volume: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Ед. изм.
                  <input
                    type="text"
                    maxLength={32}
                    required
                    value={form.volumeUnit}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, volumeUnit: e.target.value }))
                    }
                  />
                </label>
              </div>
              <label>
                ФИО исполнителя
                <input
                  type="text"
                  required
                  maxLength={255}
                  value={form.executorName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, executorName: e.target.value }))
                  }
                />
              </label>
              <div className="form-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Отмена
                </button>
                <button type="submit" className="primary btn-glow" disabled={saving}>
                  {saving ? 'Сохранение…' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
