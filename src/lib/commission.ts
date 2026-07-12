/** Fallback commission rate when a product's store record can't be resolved. */
export const DEFAULT_COMMISSION_PERCENT = 10;

export interface CommissionLineItem {
  price: number;
  quantity: number;
  /** The selling store's commission rate for this line, as a percentage (e.g. 10 = 10%). */
  commissionPercent: number;
}

/**
 * Sums (price * quantity) across line items after deducting each line's own
 * store's commission rate. A cart can span multiple vendors with different
 * commission rates, so this can't be a single flat percentage off the order
 * total — each line is discounted independently, then summed.
 */
export function calculateNetAmount(items: CommissionLineItem[]): number {
  const net = items.reduce((sum, item) => {
    const lineTotal = item.price * item.quantity;
    const commissionRate = item.commissionPercent / 100;
    return sum + lineTotal * (1 - commissionRate);
  }, 0);
  return parseFloat(net.toFixed(2));
}
