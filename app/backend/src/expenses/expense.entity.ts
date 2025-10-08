export enum PaymentMethod {
  CARTAO_CREDITO = 'cartao_credito',
  DEBITO = 'debito',
  PIX = 'pix',
  DINHEIRO = 'dinheiro',
}

export interface Expense {
  id: string;
  userId: string;
  date: string;
  description: string;
  categoryId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  isRecurring: boolean;
  notes?: string;
}
