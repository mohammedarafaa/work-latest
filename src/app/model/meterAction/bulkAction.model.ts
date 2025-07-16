export interface BulkActionDto {
  id: string
  batchName: string
  meterType: string
  action: string
  parameters: string[]
  meterIds: number[]
}
