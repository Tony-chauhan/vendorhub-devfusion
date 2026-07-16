import { NextResponse } from 'next/server';
import { customAuth as auth } from '@/lib/clerk-server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { cartData: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const cartData = user.cartData ? JSON.parse(user.cartData) : { cartItems: {}, total: 0 };
    return NextResponse.json({ cart: cartData });
  } catch (error) {
    console.error('[CART_GET]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { cartItems, total } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cartDataString = JSON.stringify({ cartItems, total });

    const user = await prisma.user.update({
      where: { clerkId: userId },
      data: { cartData: cartDataString },
    });

    return NextResponse.json({ success: true, cartData: user.cartData });
  } catch (error) {
    console.error('[CART_POST]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
