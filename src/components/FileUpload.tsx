
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface FileUploadProps {
  onFileLoaded: (content: string, filename: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileLoaded }) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [fileSelected, setFileSelected] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    if (!file) return;
    
    // Check file type
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file format",
        description: "Please upload a CSV file.",
        variant: "destructive"
      });
      return;
    }
    
    setFileSelected(file);
    
    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        onFileLoaded(content, file.name);
        toast({
          title: "Success!",
          description: `File "${file.name}" loaded successfully.`
        });
      }
    };
    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "An error occurred while reading the file.",
        variant: "destructive"
      });
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging ? 'border-dashboard-blue bg-blue-50' : 'border-gray-300 hover:border-gray-400'} 
            cursor-pointer
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <input 
            type="file" 
            id="fileInput" 
            accept=".csv" 
            className="hidden" 
            onChange={handleFileInputChange} 
          />
          
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="rounded-full bg-blue-100 p-3">
              <svg 
                className="h-8 w-8 text-dashboard-blue" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="text-lg font-medium">
              {fileSelected ? `Selected: ${fileSelected.name}` : 'Upload your CSV file'}
            </div>
            <p className="text-sm text-gray-500">
              Drag and drop your file here, or click to browse
            </p>
            <Button className="mt-2 bg-dashboard-blue hover:bg-blue-600">
              Select File
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs text-gray-500">
            Sample datasets:
            <button 
              className="ml-2 text-dashboard-blue hover:underline"
              onClick={() => {
                // Simulate loading sales dataset
                const salesData = `Date,Region,Product,Sales,Profit
2023-01-15,North,Electronics,12500,2500
2023-02-12,South,Clothing,8700,1700
2023-03-10,East,Electronics,14200,3100
2023-04-05,West,Home Goods,9500,1900
2023-05-20,North,Clothing,7800,1500
2023-06-18,South,Electronics,15300,3300
2023-07-22,East,Home Goods,11000,2200
2023-08-15,West,Clothing,9200,1800
2023-09-10,North,Electronics,13700,2900
2023-10-05,South,Home Goods,10300,2100`;
                
                onFileLoaded(salesData, 'sales_data.csv');
                setFileSelected(new File([salesData], 'sales_data.csv', { type: 'text/csv' }));
                toast({
                  title: "Sample data loaded",
                  description: "Sales data sample has been loaded successfully."
                });
              }}
            >
              Sales Data
            </button>
            <button 
              className="ml-2 text-dashboard-blue hover:underline"
              onClick={() => {
                // Simulate loading website analytics dataset
                const analyticsData = `Date,Page,Visitors,BounceRate,AvgTimeOnPage
2023-01-10,Home,1250,0.35,120
2023-01-10,Products,870,0.42,95
2023-01-10,About,420,0.51,65
2023-01-10,Contact,310,0.48,80
2023-02-15,Home,1420,0.32,125
2023-02-15,Products,950,0.38,105
2023-02-15,About,480,0.47,70
2023-02-15,Contact,350,0.45,85
2023-03-20,Home,1680,0.29,135
2023-03-20,Products,1120,0.34,110
2023-03-20,About,530,0.43,75
2023-03-20,Contact,390,0.41,90`;
                
                onFileLoaded(analyticsData, 'analytics_data.csv');
                setFileSelected(new File([analyticsData], 'analytics_data.csv', { type: 'text/csv' }));
                toast({
                  title: "Sample data loaded",
                  description: "Analytics data sample has been loaded successfully."
                });
              }}
            >
              Analytics Data
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
