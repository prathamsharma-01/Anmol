/**
 * Utility function to parse CSV data
 * @param {string} csvText - The CSV text content
 * @returns {Array} - Array of objects representing the CSV data
 */
export const parseCSV = (csvText) => {
  // Split the CSV text into lines
  const lines = csvText.split('\n');
  
  // Extract headers (first line)
  const headers = lines[0].split(',').map(header => header.trim());
  
  // Parse the data rows
  const data = lines.slice(1).filter(line => line.trim() !== '').map(line => {
    const values = line.split(',');
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] ? values[index].trim() : '';
    });
    
    return row;
  });
  
  return data;
};

/**
 * Fetch and parse CSV file
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<Array>} - Promise resolving to array of parsed CSV data
 */
export const fetchCSVData = async (filePath) => {
  try {
    const response = await fetch(filePath);
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error('Error fetching or parsing CSV:', error);
    return [];
  }
};