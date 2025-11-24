
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Estate } from '../types';

interface ChartsProps {
  estates: Estate[];
}

export const Charts: React.FC<ChartsProps> = ({ estates }) => {
  const barData = estates.map(e => ({
    name: e.name.replace(' Estate', '').replace(' Gardens', ''), // Shorten name for x-axis
    Expected: e.totalExpected,
    Paid: e.totalActual,
  }));

  const pieData = [
    { name: 'Paid', value: estates.reduce((acc, e) => acc + e.totalActual, 0) },
    { name: 'Outstanding', value: estates.reduce((acc, e) => acc + e.totalOutstanding, 0) },
  ];

  const PIE_COLORS = ['#009e4d', '#ef4444']; // Brand Green and Red

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Revenue Comparison Chart */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-display font-bold text-slate-800 dark:text-white mb-6">Estate Financial Performance</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-700" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(240, 253, 244, 0.5)' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                wrapperClassName="dark:bg-slate-800 dark:text-white"
              />
              <Bar dataKey="Expected" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="Paid" fill="#009e4d" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment Distribution Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-display font-bold text-slate-800 dark:text-white mb-6">Payment Status</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value)} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
