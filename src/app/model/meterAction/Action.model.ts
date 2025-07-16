export interface ActionDto {
  meterIds: number[]
  functions: FunctionDto[]
}

export interface FunctionDto {
  obisCode: string
  functionType: string
  backupTariffValueDTO: BackupTariffValueDto
  friendlyHourDTO: FriendlyHourDto
  clockDate: string
  buckupTTariffActivationDate: string
  addingCharge: number
  swaitchPaymentMode: string
  friendlyDay: string[]
  holidayDTOs: HolidayDto[]
}

export interface BackupTariffValueDto {
  tariffValues: TariffValue[]
}

export interface TariffValue {
  index: string
  value: number
}

export interface FriendlyHourDto {
  startTime: StartTime
  endTime: EndTime
}

export interface StartTime {
  hour: number
  minute: number
  second: number
  hundredths: number
}

export interface EndTime {
  hour: number
  minute: number
  second: number
  hundredths: number
}

export interface HolidayDto {
  index: number
  timestamp: number
  dayId: number
}

