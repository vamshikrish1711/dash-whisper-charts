export interface DataColumn {
  name: string;
  type: 'string' | 'number' | 'date';
  values: (string | number | Date)[];
}

export interface Dataset {
  columns: DataColumn[];
  rowCount: number;
}

/**
 * Parse CSV string to usable dataset format
 */
export const parseCSV = (csvContent: string): Dataset => {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  
  // Initialize columns
  const columnsMap: Record<string, DataColumn> = {};
  headers.forEach(header => {
    columnsMap[header] = {
      name: header,
      type: 'string', // Default, will be inferred
      values: []
    };
  });
  
  // Parse values and infer types
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',').map(val => val.trim());
    
    headers.forEach((header, index) => {
      const value = values[index] || '';
      
      // Try to convert to number
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && isFinite(numValue)) {
        columnsMap[header].values.push(numValue);
        if (columnsMap[header].type === 'string') {
          columnsMap[header].type = 'number';
        }
      } 
      // Try to convert to date
      else if (!isNaN(Date.parse(value))) {
        columnsMap[header].values.push(new Date(value));
        if (columnsMap[header].type === 'string') {
          columnsMap[header].type = 'date';
        }
      } 
      // Keep as string
      else {
        columnsMap[header].values.push(value);
        // If even one value is a string, the column type is string
        columnsMap[header].type = 'string';
      }
    });
  }
  
  return {
    columns: Object.values(columnsMap),
    rowCount: lines.length - 1
  };
};

/**
 * Get sample data for preview
 */
export const getSampleData = (dataset: Dataset, sampleSize: number = 5): Record<string, any>[] => {
  const sample = [];
  
  for (let i = 0; i < Math.min(sampleSize, dataset.rowCount); i++) {
    const row: Record<string, any> = {};
    
    dataset.columns.forEach(column => {
      row[column.name] = column.values[i];
    });
    
    sample.push(row);
  }
  
  return sample;
};
