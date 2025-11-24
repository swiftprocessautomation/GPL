
import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Home } from 'lucide-react';
import { DashboardMetrics } from '../types';

interface MetricsProps {
  metrics: DashboardMetrics;
}

const MetricCard = ({ title, value, icon: Icon, trend, subtext, colorClass }: any) => {
  // Safety check to derive text color from bg color if possible, or default to a visible color
  const textColorClass = colorClass ? colorClass.replace('bg-', 'text-') : 'text-slate-700';
  
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClass || 'bg-slate-100'} bg-opacity-10 dark:bg-opacity-20`}>
          <Icon className={`w-6 h-6 ${textColorClass} dark:text-white`} />
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
            {trend === 'up' ? '+2.5%' : '-1.2%'}
          </span>
        )}
      </div>
      <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wide font-display">{title}</h3>
      <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-display">{value}</p>
      {subtext && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-sans">{subtext}</p>}
    </div>
  );
};

export const Metrics: React.FC<MetricsProps> = ({ metrics }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="Total Properties"
        value={metrics.totalProperties}
        icon={Home}
        colorClass="bg-slate-800"
        subtext="Across all Estates"
      />
      <MetricCard
        title="Total Expected Rent"
        value={formatCurrency(metrics.totalExpectedRent)}
        icon={DollarSign}
        colorClass="bg-blue-600"
      />
      <MetricCard
        title="Total Rent Paid"
        value={formatCurrency(metrics.totalRentPaid)}
        icon={TrendingUp}
        colorClass="bg-brand-500"
        trend="up"
      />
      <MetricCard
        title="Total Outstanding"
        value={formatCurrency(metrics.totalOutstanding)}
        icon={TrendingDown}
        colorClass="bg-red-500"
        trend="down"
      />
    </div>
  );
};
