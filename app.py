
from flask import Flask, render_template, request, jsonify
import pandas as pd
import json
import os
from datetime import datetime
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['ALLOWED_EXTENSIONS'] = {'csv'}

# Make sure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Helper function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# Parse CSV and infer column types
def parse_csv(file_path):
    df = pd.read_csv(file_path)
    
    # Detect column types
    columns = []
    for col_name in df.columns:
        col_data = df[col_name]
        
        # Try to convert to datetime
        try:
            pd.to_datetime(col_data)
            col_type = "date"
        except:
            # Check if numeric
            if pd.api.types.is_numeric_dtype(col_data):
                col_type = "number"
            else:
                col_type = "string"
                
        columns.append({
            "name": col_name,
            "type": col_type
        })
    
    # Convert to records for JSON serialization
    rows = df.to_dict(orient='records')
    
    return {
        "columns": columns,
        "rows": rows,
        "rowCount": len(rows)
    }

# Process natural language query
def process_query(dataset, query):
    # This is a simplified version - in a real implementation, 
    # you would use AI/NLP to interpret the query
    
    # Sample response structure
    chart_config = {
        "type": "bar",  # Default chart type
        "title": query,
        "data": {
            "labels": [],
            "datasets": []
        },
        "xAxis": "",
        "yAxis": []
    }
    
    # Very basic query parsing
    query_lower = query.lower()
    
    # Determine chart type
    if "trend" in query_lower or "over time" in query_lower:
        chart_config["type"] = "line"
    elif "distribution" in query_lower or "compare" in query_lower:
        chart_config["type"] = "bar"
    elif "proportion" in query_lower or "percentage" in query_lower:
        chart_config["type"] = "pie"
    elif "correlation" in query_lower or "relationship" in query_lower:
        chart_config["type"] = "scatter"
        
    # Find columns mentioned in query
    df = pd.DataFrame(dataset["rows"])
    column_names = [col["name"].lower() for col in dataset["columns"]]
    
    # Find numeric columns for y-axis
    numeric_cols = [col["name"] for col in dataset["columns"] if col["type"] == "number"]
    if not numeric_cols:
        return {"error": "No numeric columns found in dataset"}
    
    # Find date/category columns for x-axis
    date_cols = [col["name"] for col in dataset["columns"] if col["type"] == "date"]
    category_cols = [col["name"] for col in dataset["columns"] if col["type"] == "string"]
    
    # Choose x-axis (prefer date, then category)
    x_axis = None
    if date_cols:
        x_axis = date_cols[0]
    elif category_cols:
        x_axis = category_cols[0]
    else:
        # Fallback to first column
        x_axis = dataset["columns"][0]["name"]
    
    # Populate chart data
    chart_config["xAxis"] = x_axis
    x_values = df[x_axis].tolist()
    chart_config["data"]["labels"] = x_values
    
    # Choose y-axis (use mentioned numeric columns or first numeric column)
    y_cols = [col for col in numeric_cols if col.lower() in query_lower]
    if not y_cols:
        # If no columns mentioned, use first numeric column
        y_cols = [numeric_cols[0]]
    
    chart_config["yAxis"] = y_cols
    
    # Create datasets
    for y_col in y_cols:
        y_values = df[y_col].tolist()
        chart_config["data"]["datasets"].append({
            "label": y_col,
            "data": y_values
        })
    
    return chart_config

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Save the file
        file.save(file_path)
        
        # Parse the CSV
        try:
            dataset = parse_csv(file_path)
            return jsonify(dataset)
        except Exception as e:
            return jsonify({'error': f'Error parsing CSV: {str(e)}'}), 500
    
    return jsonify({'error': 'Invalid file type. Only CSV files are allowed.'}), 400

@app.route('/process_query', methods=['POST'])
def handle_query():
    data = request.json
    
    if not data or 'query' not in data or 'dataset' not in data:
        return jsonify({'error': 'Missing query or dataset'}), 400
    
    try:
        chart_config = process_query(data['dataset'], data['query'])
        return jsonify(chart_config)
    except Exception as e:
        return jsonify({'error': f'Error processing query: {str(e)}'}), 500

@app.route('/sample_data/<sample_name>')
def get_sample_data(sample_name):
    if sample_name == 'sales':
        sample_data = """Date,Region,Product,Sales,Profit
2023-01-15,North,Electronics,12500,2500
2023-02-12,South,Clothing,8700,1700
2023-03-10,East,Electronics,14200,3100
2023-04-05,West,Home Goods,9500,1900
2023-05-20,North,Clothing,7800,1500
2023-06-18,South,Electronics,15300,3300
2023-07-22,East,Home Goods,11000,2200
2023-08-15,West,Clothing,9200,1800
2023-09-10,North,Electronics,13700,2900
2023-10-05,South,Home Goods,10300,2100"""
    elif sample_name == 'analytics':
        sample_data = """Date,Page,Visitors,BounceRate,AvgTimeOnPage
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
2023-03-20,Contact,390,0.41,90"""
    else:
        return jsonify({'error': 'Invalid sample name'}), 400
    
    # Create temp file and return parsed results
    temp_filename = f"temp_{sample_name}.csv"
    temp_path = os.path.join(app.config['UPLOAD_FOLDER'], temp_filename)
    
    with open(temp_path, 'w') as f:
        f.write(sample_data)
    
    try:
        dataset = parse_csv(temp_path)
        return jsonify(dataset)
    except Exception as e:
        return jsonify({'error': f'Error parsing sample CSV: {str(e)}'}), 500
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == '__main__':
    app.run(debug=True)
