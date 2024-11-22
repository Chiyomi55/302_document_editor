import Papa from 'papaparse';

// Download the form
export const onDownloadTable = (csvData: string, name: string, t) => {
  // Convert object array to CSV string
  function convertToCSV(data) {
    const headers = Object.keys(data[0]).join(",") + "\n"; // Get header
    const rows = data.map(row => Object.values(row).join(",")).join("\n"); // Retrieve data for each row
    return headers + rows;
  }

  const rows: any = Papa.parse(csvData, {
    comments: '```',
    skipEmptyLines: true,
  })
  if (rows.data.length) {
    const longestSublistIndex = rows.data.reduce((maxIndex: number, sublist: any, index: number, array: any[]) => {
      return sublist.length > array[maxIndex].length ? index : maxIndex;
    }, 0);
    const transposedData = rows.data[longestSublistIndex].map((_: any, colIndex: number) => rows.data.map((row: any) => row[colIndex]));
    const nonEmptyColumnIndices = transposedData.map((col: any, index: number) => col.some((cell: any) => cell) ? index : -1)
      .filter((index: number) => index !== -1);

    const tableData = rows.data.map((row: any) => nonEmptyColumnIndices.map((index: number) => row[index]))
      .filter((sublist: any) => !sublist.every((cell: any) => cell && cell?.trim()?.indexOf('---') > -1));

    const filename = `${name || t('Untitled')}.csv`;
    // Create and download CSV files
    const csvContent = convertToCSV(tableData);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Generate download link
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}


export const exportJSON = (title: string, novelContent: string, t) => {
  const jsonData = JSON.parse(novelContent);
  jsonData.isEditor = true;
  if (title) {
    jsonData.title = title;
  }

  const jsonString = JSON.stringify(jsonData, null, 2);

  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title || t('Untitled')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};