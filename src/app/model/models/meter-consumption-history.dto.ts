export interface ConsumptionDataPoint {
    date: string;
    consumption: string;
}

export interface MeterConsumptionHistoryDTO {
    period: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
    data: ConsumptionDataPoint[];
} 