
document.addEventListener('DOMContentLoaded', function() {
    // Global state
    let currentDataset = null;
    let chart = null;

    // DOM Elements
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const salesDataBtn = document.getElementById('salesDataBtn');
    const analyticsDataBtn = document.getElementById('analyticsDataBtn');
    const dataPreviewSection = document.querySelector('.data-preview-section');
    const headerRow = document.getElementById('headerRow');
    const dataRows = document.getElementById('dataRows');
    const rowCountEl = document.getElementById('rowCount');
    const columnCountEl = document.getElementById('columnCount');
    const querySection = document.querySelector('.query-section');
    const queryInput = document.getElementById('queryInput');
    const availableColumnsEl = document.getElementById('availableColumns');
    const submitQueryBtn = document.getElementById('submitQueryBtn');
    const suggestedQueriesEl = document.getElementById('suggestedQueries');
    const suggestionsEl = document.getElementById('suggestions');
    const chartsSection = document.querySelector('.charts-section');
    const chartTitle = document.getElementById('chartTitle');
    const chartCanvas = document.getElementById('chartCanvas');
    const themeToggle = document.getElementById('themeToggle');
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');
    const toastClose = document.getElementById('toastClose');

    // Theme handling
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.classList.add(savedTheme + '-theme');
    }

    themeToggle.addEventListener('click', function() {
        if (document.body.classList.contains('dark-theme')) {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        }

        // Update chart if it exists
        if (chart) {
            updateChartTheme();
        }
    });

    function updateChartTheme() {
        const isDark = document.body.classList.contains('dark-theme');
        
        chart.options.scales.x.grid.color = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        chart.options.scales.y.grid.color = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        chart.options.scales.x.ticks.color = isDark ? '#e2e8f0' : '#1e293b';
        chart.options.scales.y.ticks.color = isDark ? '#e2e8f0' : '#1e293b';
        
        chart.update();
    }

    // File Upload Handling
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', function() {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    });

    selectFileBtn.addEventListener('click', function() {
        fileInput.click();
    });

    dropZone.addEventListener('click', function() {
        fileInput.click();
    });

    fileInput.addEventListener('change', function() {
        if (fileInput.files && fileInput.files.length > 0) {
            handleFileSelection(fileInput.files[0]);
        }
    });

    salesDataBtn.addEventListener('click', function() {
        loadSampleData('sales');
    });

    analyticsDataBtn.addEventListener('click', function() {
        loadSampleData('analytics');
    });

    function handleFileSelection(file) {
        if (!file) return;
        
        // Check if file is CSV
        if (!file.name.toLowerCase().endsWith('.csv')) {
            showToast('Invalid file format', 'Please upload a CSV file.', 'error');
            return;
        }
        
        const formData = new FormData();
        formData.append('file', file);
        
        // Upload the file
        showToast('Uploading...', 'Please wait while we process your file.', 'info');
        
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showToast('Error', data.error, 'error');
                return;
            }
            
            // Process successful response
            currentDataset = data;
            showToast('Success!', `File "${file.name}" loaded successfully.`, 'success');
            displayDataPreview(currentDataset);
        })
        .catch(error => {
            showToast('Error', 'Failed to upload file: ' + error.message, 'error');
        });
    }

    function loadSampleData(sampleName) {
        showToast('Loading...', 'Please wait while we load the sample data.', 'info');
        
        fetch(`/sample_data/${sampleName}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    showToast('Error', data.error, 'error');
                    return;
                }
                
                currentDataset = data;
                showToast('Success!', `${sampleName} data loaded successfully.`, 'success');
                displayDataPreview(currentDataset);
            })
            .catch(error => {
                showToast('Error', 'Failed to load sample data: ' + error.message, 'error');
            });
    }

    // Display Data Preview
    function displayDataPreview(dataset) {
        // Update counts
        rowCountEl.textContent = dataset.rowCount;
        columnCountEl.textContent = dataset.columns.length;
        
        // Clear existing table
        headerRow.innerHTML = '';
        dataRows.innerHTML = '';
        
        // Add column headers
        dataset.columns.forEach(column => {
            const th = document.createElement('th');
            th.innerHTML = `
                ${column.name}
                <span class="column-type">(${column.type})</span>
            `;
            headerRow.appendChild(th);
        });
        
        // Add sample rows (up to 5)
        const sampleRows = dataset.rows.slice(0, 5);
        sampleRows.forEach(row => {
            const tr = document.createElement('tr');
            
            dataset.columns.forEach(column => {
                const td = document.createElement('td');
                td.textContent = formatCellValue(row[column.name]);
                tr.appendChild(td);
            });
            
            dataRows.appendChild(tr);
        });
        
        // Show sections
        dataPreviewSection.style.display = 'block';
        querySection.style.display = 'block';
        
        // Update available columns
        availableColumnsEl.textContent = dataset.columns.map(c => c.name).join(', ');
        
        // Enable query input
        submitQueryBtn.disabled = false;
        
        // Set up query input handlers
        setupQueryHandlers(dataset);
    }
    
    function formatCellValue(value) {
        if (value === null || value === undefined) {
            return '';
        }
        
        return String(value);
    }

    // Query Handling
    function setupQueryHandlers(dataset) {
        // Clear existing listeners
        queryInput.value = '';
        
        queryInput.addEventListener('input', function() {
            generateSuggestions(dataset, queryInput.value);
        });
        
        submitQueryBtn.addEventListener('click', function() {
            if (queryInput.value.trim()) {
                processQuery(dataset, queryInput.value.trim());
            }
        });
        
        queryInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (queryInput.value.trim()) {
                    processQuery(dataset, queryInput.value.trim());
                }
            }
        });
    }

    function generateSuggestions(dataset, query) {
        if (!query.trim()) {
            suggestedQueriesEl.style.display = 'none';
            return;
        }
        
        const lowercaseQuery = query.toLowerCase();
        
        // Only show suggestions if query is getting started
        if (lowercaseQuery.includes('show') || 
            lowercaseQuery.includes('display') || 
            lowercaseQuery.includes('create') ||
            lowercaseQuery.length < 10) {
            
            const suggestions = [];
            
            // Find column types
            const numericColumns = dataset.columns.filter(col => col.type === 'number');
            const dateColumns = dataset.columns.filter(col => col.type === 'date');
            const categoryColumns = dataset.columns.filter(col => col.type === 'string');
            
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
            
            // Display suggestions
            if (suggestions.length > 0) {
                suggestionsEl.innerHTML = '';
                suggestions.slice(0, 3).forEach(suggestion => {
                    const div = document.createElement('div');
                    div.className = 'suggestion';
                    div.textContent = suggestion;
                    div.addEventListener('click', function() {
                        queryInput.value = suggestion;
                        suggestedQueriesEl.style.display = 'none';
                    });
                    suggestionsEl.appendChild(div);
                });
                
                suggestedQueriesEl.style.display = 'block';
            } else {
                suggestedQueriesEl.style.display = 'none';
            }
        } else {
            suggestedQueriesEl.style.display = 'none';
        }
    }

    function processQuery(dataset, query) {
        showToast('Processing...', 'Generating visualization for your query.', 'info');
        submitQueryBtn.disabled = true;
        submitQueryBtn.textContent = 'Processing...';
        
        fetch('/process_query', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                dataset: dataset,
                query: query
            })
        })
        .then(response => response.json())
        .then(chartConfig => {
            if (chartConfig.error) {
                showToast('Error', chartConfig.error, 'error');
                return;
            }
            
            renderChart(chartConfig);
            showToast('Success!', 'Chart generated successfully.', 'success');
        })
        .catch(error => {
            showToast('Error', 'Failed to process query: ' + error.message, 'error');
        })
        .finally(() => {
            submitQueryBtn.disabled = false;
            submitQueryBtn.textContent = 'Generate Chart';
        });
    }

    // Chart Rendering
    function renderChart(chartConfig) {
        chartsSection.style.display = 'block';
        chartTitle.textContent = chartConfig.title;
        
        // Destroy previous chart if exists
        if (chart) {
            chart.destroy();
        }
        
        const isDark = document.body.classList.contains('dark-theme');
        
        // Get colors based on theme
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
              
        const config = {
            type: chartConfig.type,
            data: {
                labels: chartConfig.data.labels,
                datasets: chartConfig.data.datasets.map((dataset, index) => {
                    const baseConfig = {
                        label: dataset.label,
                        data: dataset.data,
                        backgroundColor: colors[index % colors.length] + '80', // Add transparency
                        borderColor: colors[index % colors.length],
                        borderWidth: 1
                    };
                    
                    // Add specific configs based on chart type
                    if (chartConfig.type === 'line') {
                        return {
                            ...baseConfig,
                            tension: 0.2,
                            fill: false,
                            pointBackgroundColor: colors[index % colors.length]
                        };
                    } else if (chartConfig.type === 'pie') {
                        return {
                            ...baseConfig,
                            backgroundColor: colors.map(color => color + 'C0'),
                            hoverOffset: 4
                        };
                    } else if (chartConfig.type === 'scatter') {
                        return {
                            ...baseConfig,
                            pointRadius: 6,
                            pointHoverRadius: 8
                        };
                    }
                    
                    return baseConfig;
                })
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: isDark ? '#e2e8f0' : '#1e293b'
                        }
                    },
                    tooltip: {
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        titleColor: isDark ? '#e2e8f0' : '#1e293b',
                        bodyColor: isDark ? '#e2e8f0' : '#1e293b',
                        borderColor: isDark ? '#475569' : '#e2e8f0',
                        borderWidth: 1,
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                            color: isDark ? '#e2e8f0' : '#1e293b'
                        }
                    },
                    y: {
                        grid: {
                            color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                            color: isDark ? '#e2e8f0' : '#1e293b'
                        }
                    }
                }
            }
        };
        
        // Special configurations for different chart types
        if (chartConfig.type === 'pie') {
            // Remove scales for pie charts
            delete config.options.scales;
        }
        
        // Create the chart
        chart = new Chart(chartCanvas, config);
        
        // Scroll to chart
        chartsSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Toast Notifications
    function showToast(title, message, type = 'info') {
        toastTitle.textContent = title;
        toastMessage.textContent = message;
        
        // Reset classes
        toast.className = 'toast';
        toast.classList.add(type);
        toast.classList.add('show');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            hideToast();
        }, 5000);
    }
    
    function hideToast() {
        toast.classList.remove('show');
    }
    
    toastClose.addEventListener('click', hideToast);

    // Initialize
    initTheme();
});
