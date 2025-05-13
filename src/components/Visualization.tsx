
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig } from '@/utils/queryProcessor';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

interface VisualizationProps {
  chartConfig: ChartConfig;
}

const Visualization: React.FC<VisualizationProps> = ({ chartConfig }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Colors for charts - adjusted for theme
  const colors = isDark 
    ? [
        '#60A5FA', // blue (brighter for dark mode)
        '#38BDF8', // sky (brighter for dark mode)
        '#A78BFA', // purple (brighter for dark mode)
        '#FB923C', // orange (brighter for dark mode)
        '#34D399', // green (brighter for dark mode)
        '#F472B6', // pink (brighter for dark mode)
        '#94A3B8', // slate (brighter for dark mode)
        '#F87171', // red (brighter for dark mode)
      ] 
    : [
        '#3B82F6', // blue
        '#0EA5E9', // sky
        '#8B5CF6', // purple
        '#F97316', // orange
        '#10B981', // green
        '#EC4899', // pink
        '#64748B', // slate
        '#EF4444', // red
      ];

  const pieColors = isDark
    ? [
        '#60A5FA', '#38BDF8', '#A78BFA', '#FB923C', 
        '#34D399', '#F472B6', '#94A3B8', '#F87171',
        '#C4B5FD', '#2DD4BF', '#FBBF24', '#818CF8'
      ]
    : [
        '#3B82F6', '#0EA5E9', '#8B5CF6', '#F97316', 
        '#10B981', '#EC4899', '#64748B', '#EF4444',
        '#A855F7', '#14B8A6', '#F59E0B', '#6366F1'
      ];

  const renderChart = () => {
    switch (chartConfig.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartConfig.data.labels.map((label: string, index: number) => {
              const dataPoint: any = { name: label };
              chartConfig.data.datasets.forEach((dataset: any, datasetIndex: number) => {
                dataPoint[dataset.label] = dataset.data[index];
              });
              return dataPoint;
            })}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
              <XAxis dataKey="name" tick={{ fill: isDark ? '#e2e8f0' : '#1e293b' }} />
              <YAxis tick={{ fill: isDark ? '#e2e8f0' : '#1e293b' }} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#475569' : '#e2e8f0', color: isDark ? '#e2e8f0' : '#1e293b' }} />
              <Legend />
              {chartConfig.data.datasets.map((dataset: any, index: number) => (
                <Bar 
                  key={index} 
                  dataKey={dataset.label} 
                  fill={colors[index % colors.length]} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartConfig.data.labels.map((label: string, index: number) => {
              const dataPoint: any = { name: label };
              chartConfig.data.datasets.forEach((dataset: any, datasetIndex: number) => {
                dataPoint[dataset.label] = dataset.data[index];
              });
              return dataPoint;
            })}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
              <XAxis dataKey="name" tick={{ fill: isDark ? '#e2e8f0' : '#1e293b' }} />
              <YAxis tick={{ fill: isDark ? '#e2e8f0' : '#1e293b' }} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#475569' : '#e2e8f0', color: isDark ? '#e2e8f0' : '#1e293b' }} />
              <Legend />
              {chartConfig.data.datasets.map((dataset: any, index: number) => (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={dataset.label}
                  stroke={colors[index % colors.length]}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartConfig.data.labels.map((label: string, index: number) => ({
                  name: label,
                  value: chartConfig.data.datasets[0].data[index]
                }))}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartConfig.data.labels.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#475569' : '#e2e8f0', color: isDark ? '#e2e8f0' : '#1e293b' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
              <XAxis type="number" dataKey="x" name={chartConfig.xAxis} tick={{ fill: isDark ? '#e2e8f0' : '#1e293b' }} />
              <YAxis type="number" dataKey="y" name={chartConfig.yAxis?.[0]} tick={{ fill: isDark ? '#e2e8f0' : '#1e293b' }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#475569' : '#e2e8f0', color: isDark ? '#e2e8f0' : '#1e293b' }} />
              <Legend />
              {chartConfig.data.datasets.map((dataset: any, index: number) => (
                <Scatter
                  key={index}
                  name={dataset.label}
                  data={dataset.data}
                  fill={colors[index % colors.length]}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        );
      
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <Card className="w-full shadow animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle>{chartConfig.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default Visualization;
