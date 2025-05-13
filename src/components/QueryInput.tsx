import React, { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dataset } from '@/utils/csvParser';

interface QueryInputProps {
  dataset: Dataset | null;
  onSubmitQuery: (query: string) => void;
  isLoading?: boolean;
}

const QueryInput: React.FC<QueryInputProps> = ({ 
  dataset, 
  onSubmitQuery,
  isLoading = false 
}) => {
  const [query, setQuery] = useState('');
  const [suggestedQueries, setSuggestedQueries] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
    
    // Generate basic suggestions based on dataset columns
    if (dataset && e.target.value.trim().length > 0) {
      const lowercaseQuery = e.target.value.toLowerCase();
      
      // Only show suggestions if query is getting started
      if (lowercaseQuery.includes('show') || 
          lowercaseQuery.includes('display') || 
          lowercaseQuery.includes('create') ||
          lowercaseQuery.length < 10) {
        
        generateSuggestions();
      } else {
        setSuggestedQueries([]);
      }
    } else {
      setSuggestedQueries([]);
    }
  };

  const generateSuggestions = () => {
    if (!dataset) return;
    
    const numericColumns = dataset.columns.filter(col => col.type === 'number');
    const dateColumns = dataset.columns.filter(col => col.type === 'date');
    const categoryColumns = dataset.columns.filter(col => col.type === 'string');
    
    const suggestions: string[] = [];
    
    // Generate based on dataset structure
    if (numericColumns.length > 0 && categoryColumns.length > 0) {
      const numCol = numericColumns[0].name;
      const catCol = categoryColumns[0].name;
      suggestions.push(`Show ${numCol} by ${catCol} as a bar chart`);
      suggestions.push(`Compare ${numericColumns.map(c => c.name).join(' and ')} by ${catCol}`);
    }
    
    if (dateColumns.length > 0 && numericColumns.length > 0) {
      const dateCol = dateColumns[0].name;
      const numCol = numericColumns[0].name;
      suggestions.push(`Show trend of ${numCol} over ${dateCol}`);
    }
    
    if (numericColumns.length >= 2) {
      suggestions.push(`Show correlation between ${numericColumns[0].name} and ${numericColumns[1].name}`);
    }
    
    if (categoryColumns.length > 0 && numericColumns.length > 0) {
      suggestions.push(`Show distribution of ${numericColumns[0].name} by ${categoryColumns[0].name}`);
    }
    
    setSuggestedQueries(suggestions.slice(0, 3));
  };

  const handleSubmit = () => {
    if (query.trim() && dataset) {
      onSubmitQuery(query.trim());
      // Keep the query visible after submission
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setSuggestedQueries([]);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <Card className="w-full shadow-sm border-t">
      <CardContent className="p-4">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            placeholder={dataset 
              ? "Ask a question about your data (e.g., 'Show sales by region')" 
              : "Please upload a dataset first"}
            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-dashboard-blue min-h-[80px]"
            disabled={!dataset || isLoading}
          />
          
          {suggestedQueries.length > 0 && (
            <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1">
              <div className="p-2 text-xs text-gray-500">Suggested queries:</div>
              {suggestedQueries.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-blue-50 cursor-pointer text-sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-between mt-2">
            <div className="text-xs text-gray-500">
              {dataset && (
                <span>Available columns: {dataset.columns.map(c => c.name).join(', ')}</span>
              )}
            </div>
            <Button 
              onClick={handleSubmit}
              disabled={!dataset || !query.trim() || isLoading}
              className="bg-dashboard-blue hover:bg-blue-600"
            >
              {isLoading ? 'Processing...' : 'Generate Chart'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QueryInput;
