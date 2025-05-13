
import { Dataset, DataColumn } from './csvParser';

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter';

export interface ChartConfig {
  type: ChartType;
  title: string;
  xAxis?: string;
  yAxis?: string[];
  data: any;
}

/**
 * Simple Query Processor - Extracts keywords and tries to match to chart types and columns
 * This is a simplified version. In a real app, you'd use NLP or an AI API for this.
 */
export const processQuery = (query: string, dataset: Dataset): ChartConfig | null => {
  const lowercaseQuery = query.toLowerCase();
  
  // Determine chart type
  let chartType: ChartType = 'bar'; // Default
  if (lowercaseQuery.includes('line') || lowercaseQuery.includes('trend') || lowercaseQuery.includes('over time')) {
    chartType = 'line';
  } else if (lowercaseQuery.includes('pie') || lowercaseQuery.includes('distribution') || lowercaseQuery.includes('percentage')) {
    chartType = 'pie';
  } else if (lowercaseQuery.includes('scatter') || lowercaseQuery.includes('correlation') || lowercaseQuery.includes('relationship')) {
    chartType = 'scatter';
  }
  
  // Find potential columns mentioned in the query
  const potentialColumns: DataColumn[] = [];
  dataset.columns.forEach(column => {
    if (lowercaseQuery.includes(column.name.toLowerCase())) {
      potentialColumns.push(column);
    }
  });
  
  // Simple heuristics for axes selection
  let xAxis: string | undefined;
  let yAxes: string[] = [];
  
  if (potentialColumns.length >= 1) {
    // Find a suitable x-axis (prefer date/string for x-axis)
    const dateColumns = potentialColumns.filter(col => col.type === 'date');
    const stringColumns = potentialColumns.filter(col => col.type === 'string');
    const numberColumns = potentialColumns.filter(col => col.type === 'number');
    
    if (dateColumns.length > 0) {
      xAxis = dateColumns[0].name;
    } else if (stringColumns.length > 0) {
      xAxis = stringColumns[0].name;
    } else if (numberColumns.length > 0) {
      xAxis = numberColumns[0].name;
    }
    
    // Select remaining numeric columns for y-axis
    yAxes = potentialColumns
      .filter(col => col.name !== xAxis && col.type === 'number')
      .map(col => col.name);
    
    // If no y-axes found, select the first numeric column
    if (yAxes.length === 0) {
      const numericColumns = dataset.columns.filter(col => col.type === 'number');
      if (numericColumns.length > 0) {
        yAxes = [numericColumns[0].name];
      }
    }
  }
  
  // If we still don't have axes, make a best effort selection
  if (!xAxis && dataset.columns.length > 0) {
    // Prefer non-numeric for x-axis
    const nonNumericColumns = dataset.columns.filter(col => col.type !== 'number');
    if (nonNumericColumns.length > 0) {
      xAxis = nonNumericColumns[0].name;
    } else {
      xAxis = dataset.columns[0].name;
    }
  }
  
  if (yAxes.length === 0) {
    // Find numeric columns for y-axis
    const numericColumns = dataset.columns.filter(col => col.type === 'number' && col.name !== xAxis);
    if (numericColumns.length > 0) {
      yAxes = [numericColumns[0].name];
    }
  }
  
  // Generate chart data
  if (xAxis && yAxes.length > 0) {
    const xColumn = dataset.columns.find(col => col.name === xAxis);
    
    if (!xColumn) return null;
    
    const chartData = prepareChartData(chartType, xColumn, 
      yAxes.map(name => dataset.columns.find(col => col.name === name)).filter(Boolean) as DataColumn[]
    );
    
    return {
      type: chartType,
      title: generateTitle(chartType, xAxis, yAxes),
      xAxis,
      yAxis: yAxes,
      data: chartData
    };
  }
  
  return null;
};

/**
 * Generate a descriptive title based on the chart type and axes
 */
const generateTitle = (chartType: ChartType, xAxis: string, yAxes: string[]): string => {
  const yAxisLabel = yAxes.length === 1 
    ? yAxes[0] 
    : yAxes.slice(0, -1).join(', ') + ' and ' + yAxes[yAxes.length - 1];
  
  switch (chartType) {
    case 'bar':
      return `${yAxisLabel} by ${xAxis}`;
    case 'line':
      return `${yAxisLabel} Trends by ${xAxis}`;
    case 'pie':
      return `Distribution of ${yAxisLabel} by ${xAxis}`;
    case 'scatter':
      return `Correlation between ${xAxis} and ${yAxisLabel}`;
    default:
      return `${yAxisLabel} vs ${xAxis}`;
  }
};

/**
 * Prepare data in the format required by chart library
 */
const prepareChartData = (
  chartType: ChartType, 
  xColumn: DataColumn, 
  yColumns: DataColumn[]
) => {
  const xValues = xColumn.values;
  
  switch (chartType) {
    case 'bar':
    case 'line': {
      // Aggregate data by x-axis values to avoid duplicates
      const aggregatedData = new Map<string, { [key: string]: number }>();
      
      xValues.forEach((xValue, index) => {
        const xVal = String(xValue);
        
        if (!aggregatedData.has(xVal)) {
          aggregatedData.set(xVal, {});
        }
        
        const entry = aggregatedData.get(xVal)!;
        
        // Sum up values for each y-column
        yColumns.forEach(yCol => {
          const yValue = Number(yCol.values[index] || 0);
          entry[yCol.name] = (entry[yCol.name] || 0) + yValue;
        });
      });
      
      // Convert aggregated data to chart format
      const labels = Array.from(aggregatedData.keys());
      const datasets = yColumns.map(col => ({
        label: col.name,
        data: labels.map(label => aggregatedData.get(label)![col.name] || 0)
      }));
      
      return { labels, datasets };
    }
    
    case 'pie': {
      // For pie charts, we need to aggregate data if there are duplicates in x-axis
      const aggregated = new Map<string, number>();
      const yColumn = yColumns[0]; // Pie chart works with one y-axis
      
      xValues.forEach((x, index) => {
        const xVal = String(x);
        const yVal = Number(yColumn.values[index] || 0);
        aggregated.set(xVal, (aggregated.get(xVal) || 0) + yVal);
      });
      
      return {
        labels: [...aggregated.keys()],
        datasets: [{
          data: [...aggregated.values()]
        }]
      };
    }
    
    case 'scatter': {
      // For scatter plots, we need to aggregate points with the same x-value
      const aggregatedData = new Map<string, { [key: string]: number[] }>();
      
      xValues.forEach((xValue, index) => {
        const xVal = String(xValue);
        
        if (!aggregatedData.has(xVal)) {
          aggregatedData.set(xVal, {});
        }
        
        const entry = aggregatedData.get(xVal)!;
        
        // Collect all y-values for each point
        yColumns.forEach(yCol => {
          if (!entry[yCol.name]) {
            entry[yCol.name] = [];
          }
          
          const yValue = Number(yCol.values[index] || 0);
          entry[yCol.name].push(yValue);
        });
      });
      
      // Convert to scatter format, using average of y-values for same x
      return {
        datasets: yColumns.map(col => ({
          label: col.name,
          data: Array.from(aggregatedData.entries()).map(([x, values]) => {
            const yValues = values[col.name] || [];
            const avgY = yValues.length > 0 
              ? yValues.reduce((sum, val) => sum + val, 0) / yValues.length 
              : 0;
            
            return { x, y: avgY };
          })
        }))
      };
    }
    
    default:
      return { labels: xValues, datasets: [] };
  }
};
