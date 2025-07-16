import * as ExcelJS from 'exceljs';

export class ExcelExport {
    constructor() { }
    public exportToExcel(listname: string, listOfExcelColumns: string[], list: any[]) {     
          
        if(list.length == 0)
            {
                return;
            }
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(listname);

        // Add column headers
        listOfExcelColumns.forEach((column, index) => {
            worksheet.getCell(1, index + 1).value = column;
        });

        // Add data rows
        list.forEach((row, rowIndex) => {
            Object.keys(row).forEach((key, columnIndex) => {
                // Use type assertion here to inform TypeScript about the type of 'key'
                worksheet.getCell(rowIndex + 2, columnIndex + 1).value = (row as any)[key];
            });
        });

        // Adjust column width
        worksheet.columns.forEach(column => {
            let maxWidth = 0;
            column.eachCell!({ includeEmpty: true }, cell => {
                if (cell.value) {
                    const cellWidth = cell.value.toString().length;
                    if (cellWidth > maxWidth) {
                        maxWidth = cellWidth;
                    }
                }
            });
            column.width = maxWidth < 10 ? 10 : maxWidth + 2; // Set minimum width
        });

        // Generate and download the Excel file
        workbook.xlsx.writeBuffer().then((data) => {
            const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = listname + '.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        });
    }

}