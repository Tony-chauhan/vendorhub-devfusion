import { prisma } from "@/lib/prisma";
import { isMockDb } from "@/lib/env";

/**
 * Records an immutable audit-trail entry for an admin-privileged mutation.
 * Never throws — a logging failure must not roll back or block the action
 * it's documenting.
 */
export async function logAdminAction(params: {
  adminUserId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  if (isMockDb()) return;

  try {
    await prisma.adminAuditLog.create({
      data: {
        adminUserId: params.adminUserId,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        metadata: params.metadata ? (params.metadata as object) : undefined,
      },
    });
  } catch (error) {
    console.error("[audit-log] Failed to write audit entry:", error);
  }
}
