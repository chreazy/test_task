export interface WorkType {
  id: string
  name: string
}

export interface JournalEntry {
  id: string
  performedDate: string
  workTypeId: string
  volume: string
  volumeUnit: string
  executorName: string
  workType?: WorkType
}

export interface CreateJournalEntryPayload {
  performedDate: string
  workTypeId: string
  volume: number
  volumeUnit: string
  executorName: string
}
