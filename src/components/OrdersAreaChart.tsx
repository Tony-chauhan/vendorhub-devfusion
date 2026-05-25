'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface OrdersAreaChartProps {
  allOrders: Array<{ createdAt: string; total: number }>;
}

export default function OrdersAreaChart({ allOrders }: OrdersAreaChartProps) {
  // Group orders by date
  const ordersPerDay = allOrders.reduce((acc: Record<string, number>, order) => {
    const date = new Date(order.createdAt).toISOString().split('T')[0]; // format: YYYY-MM-DD
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  // Convert to array for Recharts
  const chartData = Object.entries(ordersPerDay)
    .map(([date, count]) => ({
      date,
      orders: count,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="w-full max-w-4xl h-[320px] bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest">
          Hyperlocal Orders / Day
        </h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
          Moderation metrics
        </span>
      </div>

      <div className="w-full h-[220px] text-[10px] font-bold text-slate-450">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              dy={10}
              tickFormatter={(dateStr) => {
                const parts = dateStr.split('-');
                return parts.length > 2 ? `${parts[1]}/${parts[2]}` : dateStr;
              }}
            />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} dx={-5} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              }}
              labelStyle={{ fontWeight: 800, color: '#1e293b' }}
            />
            <Area
              type="monotone"
              dataKey="orders"
              stroke="#6366f1"
              fillOpacity={1}
              fill="url(#colorOrders)"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
