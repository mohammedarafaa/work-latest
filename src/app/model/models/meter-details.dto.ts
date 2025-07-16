export interface MeterDetailsDTO {
    nickname: string;
    id: string;
    location: string;
    balance: number;
    status: 'active' | 'inactive' | 'low_balance';
    paymentType: 'prepaid' | 'postpaid';
    lastValue: string;
    lastReading: string;
    daysRemaining: number;
    installDate: string;
    serviceProvider: string;
    meterModel: string;
    serialNumber: string;
    contractNumber: string;
    currentPeriodConsumption: string;
    avgDailyUsage: string;
    peakUsageTime: string;
    costPerUnit: string;
    estimatedCost: string;
} 