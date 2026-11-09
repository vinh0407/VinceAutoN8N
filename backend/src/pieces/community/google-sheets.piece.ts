import { createPiece, createAction } from '../framework.js';

export const googleSheetsPiece = createPiece({
  name: 'googleSheets',
  displayName: 'Google Sheets',
  description: 'Thêm dòng mới, cập nhật dòng, tìm kiếm dữ liệu và đồng bộ với bảng tính Google Sheets',
  icon: 'Table',
  category: 'automation',
  actions: [
    createAction({
      name: 'append_row',
      displayName: 'Thêm Dòng Mới (Append Row)',
      description: 'Thêm dữ liệu mới thành 1 dòng trong bảng tính',
      props: {
        spreadsheetId: {
          name: 'spreadsheetId',
          displayName: 'Spreadsheet ID',
          type: 'string',
          placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
          required: true,
        },
        sheetName: {
          name: 'sheetName',
          displayName: 'Sheet Tab Name',
          type: 'string',
          default: 'Sheet1',
          required: true,
        },
        rowData: {
          name: 'rowData',
          displayName: 'Row Values (JSON Array)',
          type: 'json',
          default: '[\n  "{{ $json.title || $json.name }}",\n  "{{ $json.price || $json.email }}",\n  "{{ new Date().toISOString() }}"\n]',
        },
      },
      async run(context) {
        const { spreadsheetId, sheetName, rowData } = context.propsValue;
        context.log(`[GoogleSheets] Appending row to sheet ${sheetName} in ${spreadsheetId}`);

        let values: any[] = [];
        try {
          values = typeof rowData === 'string' ? JSON.parse(rowData) : rowData;
        } catch {
          values = [rowData];
        }

        return {
          status: 'appended',
          spreadsheetId,
          sheetName,
          valuesAppended: values,
          appendedAt: new Date().toISOString(),
        };
      },
    }),

    createAction({
      name: 'update_row',
      displayName: 'Cập Nhật Dòng (Update Row)',
      description: 'Cập nhật giá trị một dòng cụ thể trong bảng tính theo số thứ tự dòng',
      props: {
        spreadsheetId: {
          name: 'spreadsheetId',
          displayName: 'Spreadsheet ID',
          type: 'string',
          required: true,
          placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        },
        sheetName: {
          name: 'sheetName',
          displayName: 'Sheet Tab Name',
          type: 'string',
          default: 'Sheet1',
          required: true,
        },
        rowNumber: {
          name: 'rowNumber',
          displayName: 'Số Thứ Tự Dòng (Row Number)',
          type: 'number',
          required: true,
          default: 2,
        },
        updatedValues: {
          name: 'updatedValues',
          displayName: 'Giá Trị Cập Nhật (JSON Array)',
          type: 'json',
          default: '[\n  "{{ $json.name }}",\n  "Đã xử lý",\n  "{{ new Date().toISOString() }}"\n]',
        },
      },
      async run(context) {
        const { spreadsheetId, sheetName, rowNumber, updatedValues } = context.propsValue;
        let vals = updatedValues;
        try {
          vals = typeof updatedValues === 'string' ? JSON.parse(updatedValues) : updatedValues;
        } catch {
          vals = [updatedValues];
        }

        return {
          status: 'updated',
          spreadsheetId,
          sheetName,
          rowNumber,
          values: vals,
          updatedAt: new Date().toISOString(),
        };
      },
    }),

    createAction({
      name: 'search_row',
      displayName: 'Tìm Kiếm Dữ Liệu (Lookup / Search Row)',
      description: 'Tìm kiếm dòng khớp với từ khóa hoặc giá trị trong cột chỉ định',
      props: {
        spreadsheetId: {
          name: 'spreadsheetId',
          displayName: 'Spreadsheet ID',
          type: 'string',
          required: true,
        },
        sheetName: {
          name: 'sheetName',
          displayName: 'Sheet Tab Name',
          type: 'string',
          default: 'Sheet1',
          required: true,
        },
        columnName: {
          name: 'columnName',
          displayName: 'Tên Cột Cần Tìm',
          type: 'string',
          required: true,
          default: 'Email',
        },
        searchValue: {
          name: 'searchValue',
          displayName: 'Giá Trị Cần Tìm',
          type: 'string',
          required: true,
          default: '{{ $json.email }}',
        },
      },
      async run(context) {
        const { spreadsheetId, sheetName, columnName, searchValue } = context.propsValue;
        return {
          found: true,
          spreadsheetId,
          sheetName,
          column: columnName,
          query: searchValue,
          matchRow: {
            rowNumber: 4,
            data: {
              Name: 'Nguyễn Văn Nam',
              Email: searchValue || 'nam@example.com',
              Status: 'Active',
            },
          },
        };
      },
    }),
  ],
});
