
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig } from '@/utils/queryProcessor';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

interface VisualizationProps {
  chartConfig: ChartConfig;
}

const Visualization: React.FC<VisualizationProps> = ({ chartConfig }) => {
  // Colors for charts
  const colors = [
    '#3B82F6', // blue
    '#0EA5E9', // sky
    '#8B5CF6', // purple
    '#F97316', // orange
    '#10B981', // green
    '#EC4899', // pink
    '#64748B', // slate
    '#EF4444', // red
  ];

  const pieColors = [
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
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
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
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
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
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="x" name={chartConfig.xAxis} />
              <YAxis type="number" dataKey="y" name={chartConfig.yAxis?.[0]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
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
