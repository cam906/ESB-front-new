import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/app/lib/cognitoServer', () => ({
  getCurrentUserFromRequest: vi.fn(),
  isAdminUser: vi.fn(),
}));

vi.mock('@/prisma', () => {
  const pick = {
    findUnique: vi.fn(),
    update: vi.fn(),
  };
  const unlockedPick = {
    findFirst: vi.fn(),
    findMany: vi.fn(),
  };
  const user = {
    findUnique: vi.fn(),
    update: vi.fn(),
  };
  const prismaMock = {
    pick,
    unlockedPick,
    user,
    $transaction: vi.fn(async (fn) => fn({ pick, unlockedPick, user })),
  };

  return {
    default: prismaMock,
  };
});

const { resolvers } = await import('../route');
const prisma = (await import('@/prisma')).default as any;
const { getCurrentUserFromRequest, isAdminUser } = await import('@/app/lib/cognitoServer');

describe('updatePick resolver - automatic credit refund', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (getCurrentUserFromRequest as any).mockResolvedValue({ id: 42 });
    (isAdminUser as any).mockReturnValue(true);

    prisma.pick.findUnique.mockResolvedValue({ status: 10 });
    prisma.pick.update.mockResolvedValue({ id: 1, status: 20 });
    prisma.unlockedPick.findMany.mockResolvedValue([
      { UserId: 11 },
      { UserId: 11 },
      { UserId: 12 },
    ]);
  });

  it('refunds one credit per unique user when status transitions to lost', async () => {
    const result = await resolvers.Mutation.updatePick(
      {},
      { id: '1', status: 20 },
      { request: new Request('http://localhost') }
    );

    expect(prisma.pick.findUnique).toHaveBeenCalledWith({ where: { id: 1 }, select: { status: true } });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.unlockedPick.findMany).toHaveBeenCalledWith({
      where: { PickId: 1 },
      select: { UserId: true },
    });
    expect(prisma.user.update).toHaveBeenCalledTimes(2);

    const creditedUserIds = prisma.user.update.mock.calls.map(([args]) => args.where.id);
    expect(creditedUserIds).toEqual([11, 12]);

    const creditPayloads = prisma.user.update.mock.calls.map(([args]) => args.data);
    creditPayloads.forEach((payload) => {
      expect(payload).toMatchObject({ credits: { increment: 1 } });
      expect(payload.updatedAt).toBeInstanceOf(Date);
    });

    expect(result).toEqual({ id: 1, status: 20 });
  });

  it('does not refund credits when status stays the same', async () => {
    prisma.pick.findUnique.mockResolvedValue({ status: 20 });

    const result = await resolvers.Mutation.updatePick(
      {},
      { id: '1', status: 20 },
      { request: new Request('http://localhost') }
    );

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(prisma.pick.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({ status: 20 }),
    });
    expect(result).toEqual({ id: 1, status: 20 });
  });
});
