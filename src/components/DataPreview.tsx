
import React from 'react';
import { Dataset, getSampleData } from '@/utils/csvParser';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DataPreviewProps {
  dataset: Dataset;
  sampleSize?: number;
}

const DataPreview: React.FC<DataPreviewProps> = ({ dataset, sampleSize = 5 }) => {
  const sampleData = getSampleData(dataset, sampleSize);
  const columns = dataset.columns.map(col => col.name);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Data Preview</CardTitle>
          <span className="text-sm text-muted-foreground">
            {dataset.rowCount} rows, {dataset.columns.length} columns
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className="px-2 py-3 text-xs font-medium">
                  <div className="flex items-center">
                    <span>{column}</span>
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({dataset.columns[index].type})
                    </span>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex} className="px-2 py-2 text-sm">
                    {formatCellValue(row[column])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// Helper to format cell values for display
const formatCellValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  
  return String(value);
};

export default DataPreview;
