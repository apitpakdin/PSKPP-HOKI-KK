import ExcelJS from "exceljs";

// Reads the first sheet of an uploaded .xlsx/.xls file into an array of
// plain objects keyed by lowercase header name from row 1.
export async function parseSheetRows(file) {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const header = [];
  sheet.getRow(1).eachCell((cell, colNumber) => {
    header[colNumber] = String(cell.value ?? "").trim().toLowerCase();
  });

  const rows = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const obj = {};
    row.eachCell((cell, colNumber) => {
      const key = header[colNumber];
      if (key) obj[key] = cell.value;
    });
    if (Object.keys(obj).length) rows.push(obj);
  });
  return rows;
}
