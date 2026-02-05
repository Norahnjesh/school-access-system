import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Chart data interfaces
interface ChartDataPoint {
  [key: string]: any;
}

interface Dataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
  fill?: string;
}

interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

interface ChartsProps {
  type: 'line' | 'bar' | 'area' | 'pie' | 'doughnut';
  title: string;
  data: ChartData | { labels: string[]; datasets: { data: number[]; backgroundColor?: string[] }[] };
  height?: number;
  width?: string;
  options?: any;
  showLegend?: boolean;
  showGrid?: boolean;
  className?: string;
}

// Default colors for charts
const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // yellow
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#ec4899', // pink
  '#6b7280', // gray
  '#84cc16'  // lime
];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
        <p className="font-medium text-slate-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            <span className="font-medium">{entry.dataKey}:</span>{' '}
            {typeof entry.value === 'number' 
              ? entry.value.toLocaleString() 
              : entry.value
            }
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom label for pie charts
const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't show labels for small slices

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Transform data for recharts format
const transformDataForRecharts = (data: ChartData): ChartDataPoint[] => {
  const { labels, datasets } = data;
  
  return labels.map((label, index) => {
    const dataPoint: ChartDataPoint = { name: label };
    
    datasets.forEach((dataset, datasetIndex) => {
      dataPoint[dataset.label || `Dataset ${datasetIndex + 1}`] = dataset.data[index] || 0;
    });
    
    return dataPoint;
  });
};

const Charts: React.FC<ChartsProps> = ({
  type,
  title,
  data,
  height = 400,
  width = '100%',
  showLegend = true,
  showGrid = true,
  className = ''
}) => {
  // Handle different data formats
  const chartData = 'datasets' in data && Array.isArray(data.datasets) 
    ? transformDataForRecharts(data as ChartData)
    : [];

  // Get colors for datasets
  const getDatasetColors = (datasets: Dataset[] | { data: number[]; backgroundColor?: string[] }[]) => {
    return datasets.map((dataset, index) => {
      if ('backgroundColor' in dataset && Array.isArray(dataset.backgroundColor)) {
        return dataset.backgroundColor;
      }
      if ('backgroundColor' in dataset && typeof dataset.backgroundColor === 'string') {
        return dataset.backgroundColor;
      }
      if ('borderColor' in dataset) {
        return dataset.borderColor;
      }
      return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
    });
  };

  const renderLineChart = () => {
    const datasets = (data as ChartData).datasets;
    
    return (
      <ResponsiveContainer width={width} height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
          <XAxis 
            dataKey="name" 
            className="text-xs fill-slate-600"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            className="text-xs fill-slate-600"
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          {datasets.map((dataset, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={dataset.label || `Dataset ${index + 1}`}
              stroke={dataset.borderColor || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderAreaChart = () => {
    const datasets = (data as ChartData).datasets;
    
    return (
      <ResponsiveContainer width={width} height={height}>
        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
          <XAxis 
            dataKey="name" 
            className="text-xs fill-slate-600"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            className="text-xs fill-slate-600"
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          {datasets.map((dataset, index) => (
            <Area
              key={index}
              type="monotone"
              dataKey={dataset.label || `Dataset ${index + 1}`}
              stroke={dataset.borderColor || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              fill={dataset.backgroundColor || `${DEFAULT_COLORS[index % DEFAULT_COLORS.length]}40`}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  const renderBarChart = () => {
    const datasets = (data as ChartData).datasets;
    
    return (
      <ResponsiveContainer width={width} height={height}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" className="opacity-30" />}
          <XAxis 
            dataKey="name" 
            className="text-xs fill-slate-600"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            className="text-xs fill-slate-600"
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          {datasets.map((dataset, index) => (
            <Bar
              key={index}
              dataKey={dataset.label || `Dataset ${index + 1}`}
              fill={dataset.backgroundColor || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderPieChart = () => {
    const pieData = (data as any).labels.map((label: string, index: number) => ({
      name: label,
      value: (data as any).datasets[0].data[index],
      color: (data as any).datasets[0].backgroundColor?.[index] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
    }));

    return (
      <ResponsiveContainer width={width} height={height}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomPieLabel}
            outerRadius={Math.min(height * 0.35, 120)}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderDoughnutChart = () => {
    const doughnutData = (data as any).labels.map((label: string, index: number) => ({
      name: label,
      value: (data as any).datasets[0].data[index],
      color: (data as any).datasets[0].backgroundColor?.[index] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
    }));

    return (
      <ResponsiveContainer width={width} height={height}>
        <PieChart>
          <Pie
            data={doughnutData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomPieLabel}
            outerRadius={Math.min(height * 0.35, 120)}
            innerRadius={Math.min(height * 0.2, 60)}
            fill="#8884d8"
            dataKey="value"
          >
            {doughnutData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return renderLineChart();
      case 'area':
        return renderAreaChart();
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      case 'doughnut':
        return renderDoughnutChart();
      default:
        return renderLineChart();
    }
  };

  if (!data || (!('datasets' in data) || !data.datasets.length)) {
    return (
      <div className={`bg-white rounded-xl border border-slate-200 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-64 text-slate-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-sm">No data available</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
      <div className="w-full">
        {renderChart()}
      </div>
    </div>
  );
};

// Export individual chart components for direct use
export const LineChartComponent: React.FC<Omit<ChartsProps, 'type'>> = (props) => (
  <Charts {...props} type="line" />
);

export const BarChartComponent: React.FC<Omit<ChartsProps, 'type'>> = (props) => (
  <Charts {...props} type="bar" />
);

export const AreaChartComponent: React.FC<Omit<ChartsProps, 'type'>> = (props) => (
  <Charts {...props} type="area" />
);

export const PieChartComponent: React.FC<Omit<ChartsProps, 'type'>> = (props) => (
  <Charts {...props} type="pie" />
);

export const DoughnutChartComponent: React.FC<Omit<ChartsProps, 'type'>> = (props) => (
  <Charts {...props} type="doughnut" />
);

export default Charts;
