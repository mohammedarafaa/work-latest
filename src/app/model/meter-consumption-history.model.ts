// meter-consumption-history.model.ts

// Base interfaces
export interface DailyRecord {
  date: string;
  meterReading: number;
  availableCredit: number;
}

// V2 API specific interfaces
export interface V2DailyRecord {
  date: string;
  meterReading: number;
  availableCredit: number;
  consumption: number; // V2 API includes consumption field
}

// Sort interface for pagination
export interface Sort {
  direction?: string;
  nullHandling?: string;
  ascending?: boolean;
  property?: string;
  ignoreCase?: boolean;
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

// Pageable interface
export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: Sort;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

// V2 Pageable response data structure
export interface V2PageableData {
  content: V2DailyRecord[];
  pageable: Pageable;
  last: boolean;
  totalPages: number;
  totalElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: Sort;
  numberOfElements: number;
  empty: boolean;
}

// V2 API Response with Pagination (matches Swagger exactly)
export interface ApiResponsePageableDailyRecord {
  status: number;
  message: string;
  data: V2PageableData;
  errors?: any;
}

// V2 API Response with List (matches Swagger exactly)
export interface ApiResponseListDailyRecord {
  status: number;
  message: string;
  data: V2DailyRecord[];
  errors?: any;
}

// Legacy meter consumption structure
export interface MeterDailyConsumption {
  meterId: number;
  meterSerial: string;
  type: "GAS" | "WATER" | "ELECTRICITY";
  propertyNo: string;
  block: string;
  availableCredit: number | null;
  consumption: number | null;
  dailyRecords: DailyRecord[];
}

// Legacy API response
export interface MeterDailyConsumptionDTO {
  status: number;
  message: string;
  data: MeterDailyConsumption[];
  errors?: any;
}

// Legacy pageable response data
export interface MeterPageableDTO {
  content: MeterDailyConsumption[];
  pageable: Pageable;
  last: boolean;
  totalPages: number;
  totalElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: Sort;
  numberOfElements: number;
  empty: boolean;
}

// Legacy pageable API response
export interface MeterPageableResponse {
  status: number;
  message: string;
  data: MeterPageableDTO;
  errors?: any;
}

// UI Data transformation interfaces
export interface ConsumptionRow {
  date: string;
  consumption: number;
  availableCredit: number;
  meterType: string;
}

export interface TableRecord {
  date: string;
  meterReading: number;
  availableCredit: number;
  dailyUsage: number;
}

export interface BillingRecord {
  month: string;
  consumption: number;
  unitRate: number;
  totalCost: number;
}

// Dashboard types
export type DashboardType = "consumption" | "billing";

// Dashboard options
export interface DashboardOption {
  value: DashboardType;
  label: string;
  icon: string;
}

export interface MonthOption {
  value: number;
  label: string;
}

// API Response union type for easier handling
export type ConsumptionApiResponse =
  | ApiResponsePageableDailyRecord
  | ApiResponseListDailyRecord
  | MeterPageableResponse
  | MeterDailyConsumptionDTO;

// Helper interface for data processing
export interface ProcessedMeterData {
  meterChartData: ConsumptionRow[];
  billingChartData: BillingRecord[];
  dailyConsumptionTable: TableRecord[];
  billingHistoryTable: BillingRecord[];
  totalElements: number;
  error?: string;
}

// Utility type guards
export interface TypeGuards {
  isV2PageableResponse(
    response: any
  ): response is ApiResponsePageableDailyRecord;
  isV2ListResponse(response: any): response is ApiResponseListDailyRecord;
  isLegacyPageableResponse(response: any): response is MeterPageableResponse;
  isLegacyResponse(response: any): response is MeterDailyConsumptionDTO;
}

// Type guard implementations
export const typeGuards: TypeGuards = {
  isV2PageableResponse(
    response: any
  ): response is ApiResponsePageableDailyRecord {
    return (
      response?.data?.content &&
      Array.isArray(response.data.content) &&
      response.data.content[0]?.hasOwnProperty("consumption") &&
      response.data?.totalElements !== undefined
    );
  },

  isV2ListResponse(response: any): response is ApiResponseListDailyRecord {
    return (
      Array.isArray(response?.data) &&
      response.data[0]?.hasOwnProperty("consumption")
    );
  },

  isLegacyPageableResponse(response: any): response is MeterPageableResponse {
    return (
      response?.data?.content &&
      Array.isArray(response.data.content) &&
      response.data.content[0]?.meterId !== undefined &&
      response.data?.totalElements !== undefined
    );
  },

  isLegacyResponse(response: any): response is MeterDailyConsumptionDTO {
    return (
      Array.isArray(response?.data) && response.data[0]?.meterId !== undefined
    );
  },
};

// Configuration interface
export interface MeterConsumptionConfig {
  defaultPageSize: number;
  maxPageSize: number;
  defaultMonths: number;
  maxMonths: number;
  pageSizeOptions: number[];
  chartPageSizeOptions: number[];
  tablePageSizeOptions: number[];
}

// Default configuration
export const DEFAULT_METER_CONSUMPTION_CONFIG: MeterConsumptionConfig = {
  defaultPageSize: 6,
  maxPageSize: 100,
  defaultMonths: 1,
  maxMonths: 12,
  pageSizeOptions: [6, 12, 18, 24],
  chartPageSizeOptions: [25, 50, 100, 200],
  tablePageSizeOptions: [5, 10, 15, 20, 25],
};
