import { Meter } from './meter.model';
import { PagingDto } from './Utils/PagingDto';
export interface PaymentMethode {
  id: number;
  name: string;
  image: string;
  callbackAction: string;
  date: string;
  isSuccess: boolean;
}
interface SavedCard {
  id: string;
  maskedCard: string;
  brand: string;
}
