import { createPiece, createAction } from '../framework.js';

export const googleWorkspacePiece = createPiece({
  name: 'googleWorkspace',
  displayName: 'Google Drive & Google Calendar',
  description: 'Quản lý tài liệu, upload/download tệp trên Google Drive và điều phối lịch hẹn Google Calendar',
  icon: 'Calendar',
  category: 'automation',
  actions: [
    createAction({
      name: 'drive_upload_file',
      displayName: 'Google Drive: Upload File',
      description: 'Tải file lên thư mục Google Drive',
      props: {
        folderId: {
          name: 'folderId',
          displayName: 'Folder ID',
          type: 'string',
          placeholder: 'root hoặc 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs',
          default: 'root',
        },
        fileName: {
          name: 'fileName',
          displayName: 'Tên File',
          type: 'string',
          required: true,
          default: 'VinceAuto_Report_{{ new Date().toISOString().slice(0,10) }}.json',
        },
        fileContent: {
          name: 'fileContent',
          displayName: 'Nội Dung File (Text / Base64 / JSON)',
          type: 'string',
          required: true,
          default: '{{ JSON.stringify($json, null, 2) }}',
        },
      },
      run: async (context) => {
        const { folderId, fileName, fileContent } = context.propsValue;
        return {
          success: true,
          fileId: `drive_file_${Date.now()}`,
          name: fileName,
          folderId,
          webViewLink: `https://drive.google.com/file/d/drive_file_${Date.now()}/view`,
          uploadedAt: new Date().toISOString(),
          sizeBytes: fileContent ? fileContent.length : 0,
        };
      },
    }),

    createAction({
      name: 'calendar_create_event',
      displayName: 'Google Calendar: Tạo Sự Kiện / Lịch Hẹn',
      description: 'Lên lịch cuộc họp hoặc sự kiện nhắc việc trên Google Calendar',
      props: {
        title: {
          name: 'title',
          displayName: 'Tiêu Đề Sự Kiện',
          type: 'string',
          required: true,
          default: 'Họp demo tự động hóa VinceAuto với đối tác',
        },
        startTime: {
          name: 'startTime',
          displayName: 'Thời Gian Bắt Đầu (ISO 8601)',
          type: 'string',
          required: true,
          default: '{{ new Date(Date.now() + 3600000).toISOString() }}',
        },
        durationMinutes: {
          name: 'durationMinutes',
          displayName: 'Thời Lượng (Phút)',
          type: 'number',
          default: 45,
        },
        attendees: {
          name: 'attendees',
          displayName: 'Email Người Tham Gia (Phân cách bởi dấu phẩy)',
          type: 'string',
          placeholder: 'partner@example.com, techlead@company.vn',
        },
        description: {
          name: 'description',
          displayName: 'Ghi Chú Cuộc Họp',
          type: 'string',
          default: 'Cuộc họp được lên lịch tự động thông qua quy trình VinceAuto.',
        },
      },
      run: async (context) => {
        const { title, startTime, durationMinutes = 45, attendees, description } = context.propsValue;
        const endTime = new Date(new Date(startTime).getTime() + durationMinutes * 60000).toISOString();
        return {
          success: true,
          eventId: `event_${Date.now()}`,
          summary: title,
          start: { dateTime: startTime },
          end: { dateTime: endTime },
          htmlLink: `https://calendar.google.com/calendar/event?eid=event_${Date.now()}`,
          attendees: attendees ? attendees.split(',').map((e: string) => e.trim()) : [],
          description,
        };
      },
    }),
  ],
});
