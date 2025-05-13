
import React, { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import DataPreview from '@/components/DataPreview';
import QueryInput from '@/components/QueryInput';
import Visualization from '@/components/Visualization';
import ThemeToggle from '@/components/ThemeToggle';
import { Dataset, parseCSV } from '@/utils/csvParser';
import { ChartConfig, processQuery } from '@/utils/queryProcessor';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);

  const handleFileLoaded = (content: string, filename: string) => {
    try {
      const parsedData = parseCSV(content);
      setDataset(parsedData);
      setFileName(filename);
      setChartConfig(null); // Reset chart when new data is loaded
    } catch (error) {
      toast({
        title: "Error parsing CSV",
        description: "Could not parse the uploaded file. Please check the format.",
        variant: "destructive"
      });
      console.error("CSV parsing error:", error);
    }
  };

  const handleSubmitQuery = (query: string) => {
    if (!dataset) return;
    
    setIsProcessing(true);
    
    // Add to query history
    setQueryHistory(prev => [query, ...prev.slice(0, 4)]);
    
    try {
      // Simulate processing delay
      setTimeout(() => {
        const result = processQuery(query, dataset);
        
        if (result) {
          setChartConfig(result);
          toast({
            title: "Chart generated",
            description: `Created a ${result.type} chart based on your query.`
          });
        } else {
          toast({
            title: "Could not process query",
            description: "Unable to determine what to visualize. Please try a different query.",
            variant: "destructive"
          });
        }
        
        setIsProcessing(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error processing query",
        description: "An error occurred while processing your request.",
        variant: "destructive"
      });
      setIsProcessing(false);
      console.error("Query processing error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-8 h-8 text-[hsl(var(--dashboard-blue))]"
              >
                <path d="M3 3v18h18" />
                <path d="M18.4 9.4a2.4 2.4 0 1 1 4.8 0 2.4 2.4 0 1 1 -4.8 0" />
                <path d="M8.4 15.4a2.4 2.4 0 1 1 4.8 0 2.4 2.4 0 1 1 -4.8 0" />
                <path d="M14.5 12.5l-4.5 -6" />
                <path d="M5.5 15.5l5 -1" />
              </svg>
              <h1 className="text-xl font-bold">AutoDash</h1>
            </div>
            <div className="flex items-center space-x-2">
              {fileName && (
                <div className="text-sm text-muted-foreground mr-4">
                  Working with: <span className="font-medium">{fileName}</span>
                </div>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6">
          {!dataset ? (
            <div className="max-w-4xl mx-auto w-full">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Welcome to AutoDash</h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Upload a CSV file and use natural language to create beautiful data visualizations. 
                  No coding required!
                </p>
              </div>
              
              <FileUpload onFileLoaded={handleFileLoaded} />
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="bg-card p-4 rounded-lg shadow-sm border">
                    <h2 className="text-lg font-medium mb-4">Dataset Info</h2>
                    <div className="text-sm">
                      <p><span className="font-medium">File:</span> {fileName}</p>
                      <p><span className="font-medium">Rows:</span> {dataset.rowCount}</p>
                      <p><span className="font-medium">Columns:</span> {dataset.columns.length}</p>
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">Columns</h3>
                      <ul className="text-sm space-y-1">
                        {dataset.columns.map((column, index) => (
                          <li key={index} className="flex justify-between">
                            <span>{column.name}</span>
                            <span className="text-muted-foreground">{column.type}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {queryHistory.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-medium mb-2">Recent Queries</h3>
                        <ul className="text-sm space-y-2">
                          {queryHistory.map((q, i) => (
                            <li key={i} className="p-2 bg-accent rounded text-xs text-accent-foreground">
                              {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="mt-6">
                      <button 
                        onClick={() => {
                          setDataset(null);
                          setFileName('');
                          setChartConfig(null);
                          setQueryHistory([]);
                        }}
                        className="text-sm text-[hsl(var(--dashboard-blue))] hover:underline"
                      >
                        Upload a different file
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2 space-y-6">
                  <DataPreview dataset={dataset} sampleSize={5} />
                  
                  {chartConfig && (
                    <Visualization chartConfig={chartConfig} />
                  )}
                  
                  <QueryInput 
                    dataset={dataset} 
                    onSubmitQuery={handleSubmitQuery} 
                    isLoading={isProcessing}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      
      <footer className="mt-12 py-6 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          AutoDash - Natural Language to Dashboard Generator
        </div>
      </footer>
    </div>
  );
};

export default Index;
