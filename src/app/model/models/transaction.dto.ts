export interface TransactionDTO {
    type: 'payment' | 'reading' | 'adjustment';
    amount: string;
    date: string;
    time: string;
    description: string;
    color: string;
} 