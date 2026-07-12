export const STATUS_STEPS = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"] as const;
export type OrderStatusStep = (typeof STATUS_STEPS)[number];

export interface StatusTransitionResult {
  allowed: boolean;
  error?: string;
}

/**
 * Order status only ever moves forward through STATUS_STEPS — never
 * backward, and never sideways (re-setting the same status is a no-op that
 * should be rejected rather than silently succeeding, since a vendor
 * clicking twice shouldn't produce two "confirmed" events downstream).
 */
export function checkStatusTransition(
  current: OrderStatusStep | string,
  target: OrderStatusStep
): StatusTransitionResult {
  const currentIndex = STATUS_STEPS.indexOf(current as OrderStatusStep);
  const targetIndex = STATUS_STEPS.indexOf(target);

  if (targetIndex <= currentIndex) {
    return { allowed: false, error: `Cannot move status backward from ${current} to ${target}` };
  }

  return { allowed: true };
}
