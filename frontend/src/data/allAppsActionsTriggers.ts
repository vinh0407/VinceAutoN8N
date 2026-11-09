export type IntegrationStatusType =
  | 'NATIVE'
  | 'API_ADAPTER'
  | 'HTTP_FALLBACK'
  | 'COMMUNITY'
  | 'UNVERIFIED'
  | 'UNAVAILABLE';

export type TriggerMechanismType = 'W' | 'P' | 'API'; // W = Webhook, P = Polling, API = Direct API/Event

export type IntegrationCategoryGroup =
  | 'productivity'
  | 'communication'
  | 'ecommerce_crm'
  | 'database_dev'
  | 'ai_finance';

export interface IAppTriggerSpec {
  id: string;
  title: string;
  desc: string;
  type: string;
  resource?: string;
  eventValue: string;
  mechanism?: TriggerMechanismType; // W (Webhook) or P (Polling)
  status?: IntegrationStatusType;
  defaultParams?: Record<string, any>;
}

export interface IAppActionSpec {
  id: string;
  title: string;
  desc: string;
  type: string;
  resource: string;
  operation: string;
  status?: IntegrationStatusType;
  defaultParams?: Record<string, any>;
}

export interface IAdditionalFieldSpec {
  key: string;
  label: string;
  type: 'string' | 'boolean' | 'number' | 'options';
  placeholder?: string;
  default?: any;
  options?: { name: string; value: string }[];
  description?: string;
}

export interface IIntegrationArchitectureMeta {
  authType: string;
  apiCapabilities: string;
  rateLimits: string;
  permissions: string;
  errorHandling: string;
  limitations?: string;
  docsUrl?: string;
}

export interface IAppCatalogItem {
  id: string;
  name: string;
  desc: string;
  iconKey: string;
  categoryGroup: IntegrationCategoryGroup;
  status: IntegrationStatusType;
  credentialKey: string;
  credentialTitle: string;
  notice?: string;
  secondaryNotice?: string;
  architecture?: IIntegrationArchitectureMeta;
  fields: {
    key: string;
    label: string;
    type: 'string' | 'password';
    placeholder: string;
  }[];
  triggers: IAppTriggerSpec[];
  actions: IAppActionSpec[];
  additionalFields: IAdditionalFieldSpec[];
  sampleOutput: Record<string, any>;
}

// ============================================================================
// PHẦN 7.1: 13 TRIGGER NỀN TẢNG ĐỘC LẬP CỦA VINCEAUTO
// ============================================================================
export const VINCEAUTO_PLATFORM_TRIGGERS = [
  {
    id: 'trigger.manual',
    title: 'Manual Trigger',
    desc: 'Chạy bằng nút bấm trực tiếp trên giao diện VinceAuto Editor',
    mechanism: 'API',
    status: 'NATIVE' as IntegrationStatusType,
  },
  {
    id: 'trigger.cron',
    title: 'Schedule Trigger',
    desc: 'Chạy định kỳ theo lịch Cron / Interval (mỗi phút, giờ, ngày, tuần)',
    mechanism: 'P',
    status: 'NATIVE' as IntegrationStatusType,
  },
  {
    id: 'trigger.webhook',
    title: 'Webhook Trigger',
    desc: 'Nhận HTTP Request (GET/POST/PUT) kèm xác thực chữ ký HMAC & Deduplication',
    mechanism: 'W',
    status: 'NATIVE' as IntegrationStatusType,
  },
  {
    id: 'trigger.form',
    title: 'Form Trigger',
    desc: 'Tạo biểu mẫu webform VinceAuto và nhận dữ liệu người dùng nộp vào workflow',
    mechanism: 'W',
    status: 'NATIVE' as IntegrationStatusType,
  },
  {
    id: 'trigger.chat',
    title: 'Chat Trigger',
    desc: 'Nhận yêu cầu hội thoại trực tiếp từ người dùng gửi cho AI Agent',
    mechanism: 'W',
    status: 'NATIVE' as IntegrationStatusType,
  },
  {
    id: 'flow.subworkflow',
    title: 'Workflow Trigger',
    desc: 'Kích hoạt khi được gọi bởi một bản vẽ (Sub-workflow) khác',
    mechanism: 'API',
    status: 'NATIVE' as IntegrationStatusType,
  },
  {
    id: 'trigger.error',
    title: 'Error Trigger',
    desc: 'Tự động kích hoạt khi có lỗi runtime phát sinh ở workflow khác',
    mechanism: 'API',
    status: 'NATIVE' as IntegrationStatusType,
  },
  {
    id: 'trigger.file',
    title: 'File Trigger',
    desc: 'Theo dõi thay đổi tệp tin (tạo mới, sửa đổi) trên hệ thống hoặc Cloud Storage',
    mechanism: 'P',
    status: 'API_ADAPTER' as IntegrationStatusType,
  },
  {
    id: 'trigger.database',
    title: 'Database Trigger',
    desc: 'Theo dõi thay đổi bản ghi (Insert, Update, Delete) qua Cursor/Watermark hoặc CDC',
    mechanism: 'P',
    status: 'API_ADAPTER' as IntegrationStatusType,
  },
  {
    id: 'trigger.queue',
    title: 'Queue Trigger',
    desc: 'Nhận message từ hàng đợi RabbitMQ, Kafka, Redis Streams hoặc AWS SQS',
    mechanism: 'W',
    status: 'API_ADAPTER' as IntegrationStatusType,
  },
  {
    id: 'vince.supervisor',
    title: 'AI Agent Trigger',
    desc: 'Kích hoạt khi AI Agent Supervisor giao nhiệm vụ hoặc bàn giao Handoff',
    mechanism: 'API',
    status: 'NATIVE' as IntegrationStatusType,
  },
  {
    id: 'core.guardianApproval',
    title: 'Approval Trigger',
    desc: 'Kích hoạt khi con người bấm Phê duyệt / Từ chối tại cổng Human-in-the-loop',
    mechanism: 'W',
    status: 'NATIVE' as IntegrationStatusType,
  },
  {
    id: 'trigger.systemEvent',
    title: 'System Event Trigger',
    desc: 'Lắng nghe sự kiện nội bộ của hệ thống VinceAuto (Deploy, Quota, Cảnh báo)',
    mechanism: 'API',
    status: 'NATIVE' as IntegrationStatusType,
  },
];

// ============================================================================
// THƯ VIỆN TÍCH HỢP ĐỘC LẬP VINCEAUTO (5 NHÓM NGÀNH CHUẨN)
// ============================================================================
export const ALL_APPS_CATALOG: Record<string, IAppCatalogItem> = {
  // ==========================================================================
  // PHẦN 1: GOOGLE, MICROSOFT & PRODUCTIVITY (P1)
  // ==========================================================================
  googleSheets: {
    id: 'googleSheets',
    name: 'Google Sheets',
    desc: 'Spreadsheet, Sheet, Row & Data: Đọc, ghi, thêm dòng, cập nhật, xóa và tra cứu bảng tính',
    iconKey: 'googleSheets',
    categoryGroup: 'productivity',
    status: 'NATIVE',
    credentialKey: 'GOOGLE_SHEETS_SERVICE_ACCOUNT',
    credentialTitle: 'Google Sheets OAuth2 / Service Account',
    notice: 'Ensure the first row of your sheet contains column headers for automatic field mapping.',
    secondaryNotice: 'Các thao tác trong nhóm Data (Lookup/Clear) được ánh xạ qua Google Sheets API v4.',
    architecture: {
      authType: 'OAuth2 Authorization Code / Service Account JSON',
      apiCapabilities: 'Google Sheets API v4, BatchUpdate, ValueRanges, Cursor Pagination',
      rateLimits: '300 requests / minute / project (Exponential Backoff tự động)',
      permissions: 'https://www.googleapis.com/auth/spreadsheets',
      errorHandling: 'Tự động retry lỗi 429 Quota Exceeded & 503 Service Unavailable',
      limitations: 'Polling Trigger kiểm tra theo watermark dòng cuối hoặc lịch sử revision.',
    },
    fields: [
      { key: 'GOOGLE_SHEETS_SERVICE_ACCOUNT', label: 'Service Account JSON / OAuth Token', type: 'password', placeholder: 'Dán nội dung Service Account JSON' },
    ],
    triggers: [
      { id: 'trigger.sheets.row_added', title: 'Row Added', desc: '[T/P] Kích hoạt khi có dòng mới được thêm vào bảng tính', type: 'trigger.database', resource: 'Row', eventValue: 'Row Added', mechanism: 'P', status: 'NATIVE', defaultParams: { tableName: 'Google Sheets', event: 'row_created' } },
      { id: 'trigger.sheets.row_updated', title: 'Row Updated', desc: '[T/P] Kích hoạt khi một dòng hiện có bị thay đổi giá trị', type: 'trigger.database', resource: 'Row', eventValue: 'Row Updated', mechanism: 'P', status: 'NATIVE', defaultParams: { tableName: 'Google Sheets', event: 'row_updated' } },
      { id: 'trigger.sheets.row_added_or_updated', title: 'Row Added or Updated', desc: '[T/P] Kích hoạt khi có dòng mới hoặc dòng được cập nhật', type: 'trigger.database', resource: 'Row', eventValue: 'Row Added or Updated', mechanism: 'P', status: 'NATIVE', defaultParams: { tableName: 'Google Sheets', event: 'row_upserted' } },
    ],
    actions: [
      // Resource: Document (Spreadsheet)
      { id: 'piece.googleSheets.doc_create', title: 'Create Spreadsheet', desc: 'Tạo tài liệu bảng tính Google Spreadsheet mới', type: 'piece.googleSheets.append_row', resource: 'Document', operation: 'Create', status: 'NATIVE' },
      { id: 'piece.googleSheets.doc_get', title: 'Get Spreadsheet', desc: 'Lấy metadata và danh sách các trang tính trong Spreadsheet', type: 'piece.googleSheets.search_row', resource: 'Document', operation: 'Get', status: 'NATIVE' },
      { id: 'piece.googleSheets.doc_delete', title: 'Delete Spreadsheet', desc: 'Xóa tài liệu bảng tính khỏi Google Drive', type: 'piece.googleSheets.update_row', resource: 'Document', operation: 'Delete', status: 'NATIVE' },
      // Resource: Sheet
      { id: 'piece.googleSheets.sheet_create', title: 'Create Sheet', desc: 'Tạo thêm một tab trang tính (Sheet) mới trong tài liệu', type: 'piece.googleSheets.append_row', resource: 'Sheet', operation: 'Create', status: 'NATIVE' },
      { id: 'piece.googleSheets.sheet_get', title: 'Get Sheet', desc: 'Lấy cấu trúc và thuộc tính của một tab trang tính', type: 'piece.googleSheets.search_row', resource: 'Sheet', operation: 'Get', status: 'NATIVE' },
      { id: 'piece.googleSheets.sheet_update', title: 'Update Sheet', desc: 'Đổi tên hoặc cập nhật thuộc tính trang tính', type: 'piece.googleSheets.update_row', resource: 'Sheet', operation: 'Update', status: 'NATIVE' },
      { id: 'piece.googleSheets.sheet_delete', title: 'Delete Sheet', desc: 'Xóa một tab trang tính khỏi Spreadsheet', type: 'piece.googleSheets.update_row', resource: 'Sheet', operation: 'Delete', status: 'NATIVE' },
      // Resource: Row
      { id: 'piece.googleSheets.append_row', title: 'Append Row', desc: 'Thêm một dòng dữ liệu mới vào cuối trang tính', type: 'piece.googleSheets.append_row', resource: 'Row', operation: 'Append', status: 'NATIVE' },
      { id: 'piece.googleSheets.update_row', title: 'Update Row', desc: 'Cập nhật dữ liệu tại dòng chỉ định', type: 'piece.googleSheets.update_row', resource: 'Row', operation: 'Update', status: 'NATIVE' },
      { id: 'piece.googleSheets.upsert_row', title: 'Append or Update Row', desc: 'Thêm dòng mới hoặc cập nhật nếu khóa chính đã tồn tại (Upsert)', type: 'piece.googleSheets.update_row', resource: 'Row', operation: 'Append or Update', status: 'NATIVE' },
      { id: 'piece.googleSheets.get_many_rows', title: 'Get Many Rows', desc: 'Đọc danh sách nhiều dòng dữ liệu từ trang tính', type: 'piece.googleSheets.search_row', resource: 'Row', operation: 'Get Many', status: 'NATIVE' },
      { id: 'piece.googleSheets.delete_row', title: 'Delete Row', desc: 'Xóa dòng hoặc cột chỉ định khỏi trang tính', type: 'piece.googleSheets.update_row', resource: 'Row', operation: 'Delete', status: 'NATIVE' },
      // Resource: Data
      { id: 'piece.googleSheets.data_read', title: 'Read Data Range', desc: 'Đọc dữ liệu theo vùng địa chỉ A1 Notation (ví dụ Sheet1!A1:F50)', type: 'piece.googleSheets.search_row', resource: 'Data', operation: 'Read', status: 'API_ADAPTER' },
      { id: 'piece.googleSheets.data_clear', title: 'Clear Data Range', desc: 'Xóa trắng dữ liệu trong vùng chọn nhưng giữ nguyên định dạng', type: 'piece.googleSheets.update_row', resource: 'Data', operation: 'Clear', status: 'NATIVE' },
      { id: 'piece.googleSheets.data_lookup', title: 'Lookup Data Row', desc: 'Tìm kiếm dòng khớp điều kiện giá trị cột', type: 'piece.googleSheets.search_row', resource: 'Data', operation: 'Lookup', status: 'API_ADAPTER' },
    ],
    additionalFields: [
      { key: 'valueInputMode', label: 'Value Input Mode', type: 'options', default: 'USER_ENTERED', options: [{ name: 'User Entered (Parse Formulas)', value: 'USER_ENTERED' }, { name: 'Raw', value: 'RAW' }] },
      { key: 'headerRow', label: 'Header Row Index', type: 'number', default: 1 },
      { key: 'firstDataRow', label: 'First Data Row Index', type: 'number', default: 2 },
    ],
    sampleOutput: {
      row_number: 15,
      customer_name: 'Trần Quốc Bảo',
      email: 'baotran@company.vn',
      phone: '0909123456',
      status: 'Qualified Lead',
      created_at: '2026-11-09 09:45:00',
    },
  },

  googleDrive: {
    id: 'googleDrive',
    name: 'Google Drive',
    desc: 'File, Folder & Shared Drive: Tải lên, tải xuống, tìm kiếm, di chuyển & phân quyền tệp',
    iconKey: 'googleDrive',
    categoryGroup: 'productivity',
    status: 'NATIVE',
    credentialKey: 'GOOGLE_DRIVE_TOKEN',
    credentialTitle: 'Google Drive OAuth2 account',
    architecture: {
      authType: 'OAuth2 / Service Account',
      apiCapabilities: 'Google Drive API v3, Multipart Upload, Resumable Upload',
      rateLimits: '12,000 queries / minute',
      permissions: 'https://www.googleapis.com/auth/drive',
      errorHandling: 'Exponential backoff cho lỗi 403 User Rate Limit Exceeded',
    },
    fields: [
      { key: 'GOOGLE_DRIVE_TOKEN', label: 'OAuth2 Token / Service Account', type: 'password', placeholder: 'ya29...' },
    ],
    triggers: [
      { id: 'trigger.drive.file_created', title: 'File Created', desc: '[T/P] Kích hoạt khi có tệp mới được tải lên thư mục theo dõi', type: 'trigger.webhook', resource: 'File', eventValue: 'File Created', mechanism: 'P', status: 'NATIVE', defaultParams: { app: 'google_drive', event: 'file_created' } },
      { id: 'trigger.drive.file_updated', title: 'File Updated', desc: '[T/P] Kích hoạt khi tệp tin trong thư mục được cập nhật nội dung', type: 'trigger.webhook', resource: 'File', eventValue: 'File Updated', mechanism: 'P', status: 'NATIVE', defaultParams: { app: 'google_drive', event: 'file_updated' } },
    ],
    actions: [
      // Resource: File
      { id: 'piece.drive.file_create', title: 'Create File from Text', desc: 'Tạo tệp văn bản mới trên Google Drive', type: 'automation.http', resource: 'File', operation: 'Create', status: 'NATIVE' },
      { id: 'piece.drive.file_upload', title: 'Upload File', desc: 'Tải tệp nhị phân lên Google Drive', type: 'automation.http', resource: 'File', operation: 'Upload', status: 'NATIVE' },
      { id: 'piece.drive.file_download', title: 'Download File', desc: 'Tải tệp từ Google Drive về workflow', type: 'automation.http', resource: 'File', operation: 'Download', status: 'NATIVE' },
      { id: 'piece.drive.file_get', title: 'Get File Metadata', desc: 'Lấy thông tin chi tiết tệp tin theo File ID', type: 'automation.http', resource: 'File', operation: 'Get', status: 'NATIVE' },
      { id: 'piece.drive.file_search', title: 'Search Files', desc: 'Tìm kiếm tệp theo tên, MIME type hoặc thư mục cha', type: 'automation.http', resource: 'File', operation: 'Search', status: 'NATIVE' },
      { id: 'piece.drive.file_update', title: 'Update File', desc: 'Cập nhật tên, nội dung hoặc metadata của tệp', type: 'automation.http', resource: 'File', operation: 'Update', status: 'NATIVE' },
      { id: 'piece.drive.file_delete', title: 'Delete File', desc: 'Đưa tệp vào thùng rác hoặc xóa vĩnh viễn', type: 'automation.http', resource: 'File', operation: 'Delete', status: 'NATIVE' },
      // Resource: Folder
      { id: 'piece.drive.folder_create', title: 'Create Folder', desc: 'Tạo thư mục mới trên Google Drive', type: 'automation.http', resource: 'Folder', operation: 'Create', status: 'NATIVE' },
      { id: 'piece.drive.folder_search', title: 'Search Folders', desc: 'Tìm kiếm thư mục trên Google Drive', type: 'automation.http', resource: 'Folder', operation: 'Search', status: 'NATIVE' },
      { id: 'piece.drive.folder_delete', title: 'Delete Folder', desc: 'Xóa thư mục khỏi Google Drive', type: 'automation.http', resource: 'Folder', operation: 'Delete', status: 'NATIVE' },
      // Resource: Shared Drive
      { id: 'piece.drive.shared_get', title: 'Get Shared Drive', desc: 'Lấy thông tin bộ nhớ dùng chung (Shared Drive)', type: 'automation.http', resource: 'Shared Drive', operation: 'Get', status: 'NATIVE' },
      { id: 'piece.drive.shared_search', title: 'Search Shared Drives', desc: 'Liệt kê các Shared Drive trong tổ chức', type: 'automation.http', resource: 'Shared Drive', operation: 'Search', status: 'NATIVE' },
      { id: 'piece.drive.shared_update', title: 'Update Shared Drive', desc: 'Cập nhật cấu hình Shared Drive', type: 'automation.http', resource: 'Shared Drive', operation: 'Update', status: 'NATIVE' },
      // Resource: File & Folder
      { id: 'piece.drive.copy', title: 'Copy File', desc: 'Tạo bản sao của một tệp tin', type: 'automation.http', resource: 'File & Folder', operation: 'Copy', status: 'NATIVE' },
      { id: 'piece.drive.move', title: 'Move File / Folder', desc: 'Di chuyển tệp hoặc thư mục sang thư mục đích khác', type: 'automation.http', resource: 'File & Folder', operation: 'Move', status: 'NATIVE' },
      { id: 'piece.drive.share', title: 'Share Permission', desc: 'Cấp quyền xem/sửa (Reader/Commenter/Writer) cho người dùng', type: 'automation.http', resource: 'File & Folder', operation: 'Share', status: 'NATIVE' },
    ],
    additionalFields: [
      { key: 'parentFolderId', label: 'Parent Folder ID', type: 'string', placeholder: 'root' },
      { key: 'convertToGoogleDocs', label: 'Convert to Google Docs Format', type: 'boolean', default: false },
    ],
    sampleOutput: {
      kind: 'drive#file',
      id: '1x9A8b7C6d5E4f3G2h1I',
      name: 'Bao_Cao_Tai_Chinh_Q4_2026.pdf',
      mimeType: 'application/pdf',
      webViewLink: 'https://drive.google.com/file/d/1x9A8b7C6d5E4f3G2h1I/view',
    },
  },

  gmail: {
    id: 'gmail',
    name: 'Gmail',
    desc: 'Message, Draft, Label & Thread: Gửi, nhận, trả lời email, quản lý nhãn & phê duyệt',
    iconKey: 'gmail',
    categoryGroup: 'productivity',
    status: 'NATIVE',
    credentialKey: 'GMAIL_OAUTH_TOKEN',
    credentialTitle: 'Gmail OAuth2 account',
    notice: 'Poll frequency and label filters can be customized in the trigger parameters.',
    architecture: {
      authType: 'OAuth2 (Google Workspace / Gmail Personal)',
      apiCapabilities: 'Gmail API v1, MIME Multipart, Threading, History ID cursor',
      rateLimits: '250 quota units / user / second',
      permissions: 'https://mail.google.com/ hoặc gmail.modify, gmail.send',
      errorHandling: 'Tự động refresh Access Token khi hết hạn (401)',
    },
    fields: [
      { key: 'GMAIL_OAUTH_TOKEN', label: 'Gmail OAuth2 / App Password', type: 'password', placeholder: 'ya29.a0AfH6SM...' },
      { key: 'GMAIL_EMAIL', label: 'Email Address', type: 'string', placeholder: 'you@company.com' },
    ],
    triggers: [
      { id: 'trigger.gmail.new_email', title: 'New Email', desc: '[T/P] Kích hoạt khi có email mới gửi đến hộp thư (Polling theo điều kiện)', type: 'trigger.appEvent', resource: 'Message', eventValue: 'New Email', mechanism: 'P', status: 'NATIVE', defaultParams: { app: 'gmail', updates: ['New Email'] } },
      { id: 'trigger.gmail.poll_mode', title: 'Poll Mode (Filtered Query)', desc: '[T/P] Kiểm tra định kỳ email khớp bộ lọc (ví dụ: is:unread label:invoice)', type: 'trigger.appEvent', resource: 'Message', eventValue: 'Poll Mode', mechanism: 'P', status: 'NATIVE', defaultParams: { app: 'gmail', updates: ['Poll Mode'] } },
    ],
    actions: [
      // Resource: Message
      { id: 'piece.gmail.send_email', title: 'Send Message', desc: 'Gửi email mới (Text/HTML) kèm tệp đính kèm', type: 'piece.gmail.send_email', resource: 'Message', operation: 'Send', status: 'NATIVE' },
      { id: 'piece.gmail.reply_email', title: 'Reply to Message', desc: 'Trả lời trực tiếp vào luồng email hiện có', type: 'piece.gmail.send_email', resource: 'Message', operation: 'Reply', status: 'NATIVE' },
      { id: 'piece.gmail.get_message', title: 'Get Message', desc: 'Lấy chi tiết nội dung và tệp đính kèm của một email', type: 'piece.gmail.send_email', resource: 'Message', operation: 'Get', status: 'NATIVE' },
      { id: 'piece.gmail.get_many_messages', title: 'Get Many Messages', desc: 'Truy vấn danh sách nhiều email theo bộ lọc tìm kiếm', type: 'piece.gmail.send_email', resource: 'Message', operation: 'Get Many', status: 'NATIVE' },
      { id: 'piece.gmail.delete_message', title: 'Delete Message', desc: 'Xóa một email khỏi hộp thư', type: 'piece.gmail.send_email', resource: 'Message', operation: 'Delete', status: 'NATIVE' },
      { id: 'piece.gmail.add_label', title: 'Add Label to Message', desc: 'Gắn thêm nhãn (Label) cho email', type: 'piece.gmail.send_email', resource: 'Message', operation: 'Add Label', status: 'NATIVE' },
      { id: 'piece.gmail.remove_label', title: 'Remove Label from Message', desc: 'Gỡ nhãn (Label) khỏi email', type: 'piece.gmail.send_email', resource: 'Message', operation: 'Remove Label', status: 'NATIVE' },
      { id: 'piece.gmail.mark_read', title: 'Mark as Read', desc: 'Đánh dấu email là đã đọc', type: 'piece.gmail.send_email', resource: 'Message', operation: 'Mark as Read', status: 'NATIVE' },
      { id: 'piece.gmail.mark_unread', title: 'Mark as Unread', desc: 'Đánh dấu email là chưa đọc', type: 'piece.gmail.send_email', resource: 'Message', operation: 'Mark as Unread', status: 'NATIVE' },
      { id: 'piece.gmail.send_and_wait', title: 'Send and Wait for Approval', desc: 'Gửi email xin phê duyệt và chờ người nhận bấm nút xác nhận', type: 'piece.gmail.send_email', resource: 'Message', operation: 'Send and Wait for Approval', status: 'NATIVE' },
      // Resource: Draft
      { id: 'piece.gmail.draft_create', title: 'Create Draft', desc: 'Tạo thư nháp mới trong Gmail', type: 'piece.gmail.send_email', resource: 'Draft', operation: 'Create', status: 'NATIVE' },
      { id: 'piece.gmail.draft_get', title: 'Get Draft', desc: 'Lấy thông tin một thư nháp theo ID', type: 'piece.gmail.send_email', resource: 'Draft', operation: 'Get', status: 'NATIVE' },
      { id: 'piece.gmail.draft_get_many', title: 'Get Many Drafts', desc: 'Liệt kê danh sách các thư nháp', type: 'piece.gmail.send_email', resource: 'Draft', operation: 'Get Many', status: 'NATIVE' },
      { id: 'piece.gmail.draft_send', title: 'Send Draft', desc: 'Phát hành (gửi đi) một thư nháp đã tạo', type: 'piece.gmail.send_email', resource: 'Draft', operation: 'Send', status: 'NATIVE' },
      { id: 'piece.gmail.draft_delete', title: 'Delete Draft', desc: 'Xóa thư nháp', type: 'piece.gmail.send_email', resource: 'Draft', operation: 'Delete', status: 'NATIVE' },
      // Resource: Label
      { id: 'piece.gmail.label_create', title: 'Create Label', desc: 'Tạo nhãn phân loại mới trong Gmail', type: 'piece.gmail.send_email', resource: 'Label', operation: 'Create', status: 'NATIVE' },
      { id: 'piece.gmail.label_get', title: 'Get Label', desc: 'Lấy chi tiết một nhãn Gmail', type: 'piece.gmail.send_email', resource: 'Label', operation: 'Get', status: 'NATIVE' },
      { id: 'piece.gmail.label_get_many', title: 'Get Many Labels', desc: 'Lấy toàn bộ danh sách nhãn trong tài khoản', type: 'piece.gmail.send_email', resource: 'Label', operation: 'Get Many', status: 'NATIVE' },
      { id: 'piece.gmail.label_delete', title: 'Delete Label', desc: 'Xóa nhãn khỏi Gmail', type: 'piece.gmail.send_email', resource: 'Label', operation: 'Delete', status: 'NATIVE' },
      // Resource: Thread
      { id: 'piece.gmail.thread_get', title: 'Get Thread', desc: 'Lấy toàn bộ chuỗi hội thoại email (Thread)', type: 'piece.gmail.send_email', resource: 'Thread', operation: 'Get', status: 'NATIVE' },
      { id: 'piece.gmail.thread_get_many', title: 'Get Many Threads', desc: 'Tìm kiếm danh sách các chuỗi hội thoại', type: 'piece.gmail.send_email', resource: 'Thread', operation: 'Get Many', status: 'NATIVE' },
      { id: 'piece.gmail.thread_reply', title: 'Reply to Thread', desc: 'Phản hồi vào chuỗi hội thoại', type: 'piece.gmail.send_email', resource: 'Thread', operation: 'Reply', status: 'NATIVE' },
      { id: 'piece.gmail.thread_trash', title: 'Trash Thread', desc: 'Chuyển chuỗi hội thoại vào thùng rác', type: 'piece.gmail.send_email', resource: 'Thread', operation: 'Trash', status: 'NATIVE' },
    ],
    additionalFields: [
      { key: 'cc', label: 'CC', type: 'string', placeholder: 'cc@example.com' },
      { key: 'bcc', label: 'BCC', type: 'string', placeholder: 'bcc@example.com' },
      { key: 'senderName', label: 'Sender Name', type: 'string', placeholder: 'VinceAuto AI' },
    ],
    sampleOutput: {
      id: '1930f8a92b1c8e12',
      threadId: '1930f8a92b1c8e12',
      labelIds: ['INBOX', 'IMPORTANT', 'UNREAD'],
      From: 'Khách Hàng Doanh Nghiệp <ceo@enterprise.vn>',
      To: 'contact@vinceauto.vn',
      Subject: 'Yêu cầu báo giá giải pháp tự động hóa AI 2026',
      snippet: 'Chào đội ngũ VinceAuto, công ty chúng tôi muốn triển khai hệ thống tự động hóa...',
    },
  },

  googleCalendar: {
    id: 'googleCalendar',
    name: 'Google Calendar & Docs',
    desc: 'Calendar, Event & Google Docs: Quản lý lịch biểu, cuộc hẹn Google Meet & tài liệu',
    iconKey: 'googleCalendar',
    categoryGroup: 'productivity',
    status: 'NATIVE',
    credentialKey: 'GOOGLE_CALENDAR_TOKEN',
    credentialTitle: 'Google Calendar OAuth2 account',
    fields: [
      { key: 'GOOGLE_CALENDAR_TOKEN', label: 'Google OAuth2 Access Token', type: 'password', placeholder: 'ya29...' },
    ],
    triggers: [
      { id: 'trigger.gcal.event_created', title: 'Event Created', desc: '[T/P] Kích hoạt khi có sự kiện lịch mới được tạo', type: 'trigger.appEvent', resource: 'Event', eventValue: 'Event Created', mechanism: 'P', status: 'NATIVE' },
      { id: 'trigger.gcal.event_updated', title: 'Event Updated', desc: '[T/P] Kích hoạt khi sự kiện lịch được chỉnh sửa thời gian/người tham gia', type: 'trigger.appEvent', resource: 'Event', eventValue: 'Event Updated', mechanism: 'P', status: 'NATIVE' },
      { id: 'trigger.gcal.event_cancelled', title: 'Event Cancelled / Deleted', desc: '[T/P] Kích hoạt khi cuộc hẹn bị hủy (cần kiểm tra cấu hình event)', type: 'trigger.appEvent', resource: 'Event', eventValue: 'Event Cancelled', mechanism: 'P', status: 'API_ADAPTER' },
    ],
    actions: [
      // Calendar
      { id: 'piece.gcal.cal_get', title: 'Get Calendar', desc: 'Lấy thông tin lịch biểu', type: 'automation.http', resource: 'Calendar', operation: 'Get', status: 'NATIVE' },
      { id: 'piece.gcal.cal_get_many', title: 'Get Many Calendars', desc: 'Liệt kê danh sách các lịch trong tài khoản', type: 'automation.http', resource: 'Calendar', operation: 'Get Many', status: 'NATIVE' },
      { id: 'piece.gcal.cal_create', title: 'Create Calendar', desc: 'Tạo lịch biểu phụ mới', type: 'automation.http', resource: 'Calendar', operation: 'Create', status: 'NATIVE' },
      { id: 'piece.gcal.cal_update', title: 'Update Calendar', desc: 'Cập nhật thông tin lịch biểu', type: 'automation.http', resource: 'Calendar', operation: 'Update', status: 'NATIVE' },
      { id: 'piece.gcal.cal_delete', title: 'Delete Calendar', desc: 'Xóa lịch biểu phụ', type: 'automation.http', resource: 'Calendar', operation: 'Delete', status: 'NATIVE' },
      // Event
      { id: 'piece.gcal.event_create', title: 'Create Event', desc: 'Tạo cuộc hẹn mới kèm link Google Meet', type: 'automation.http', resource: 'Event', operation: 'Create', status: 'NATIVE' },
      { id: 'piece.gcal.event_get', title: 'Get Event', desc: 'Lấy chi tiết sự kiện theo Event ID', type: 'automation.http', resource: 'Event', operation: 'Get', status: 'NATIVE' },
      { id: 'piece.gcal.event_get_many', title: 'Get Many Events', desc: 'Lấy danh sách sự kiện trong khoảng thời gian', type: 'automation.http', resource: 'Event', operation: 'Get Many', status: 'NATIVE' },
      { id: 'piece.gcal.event_update', title: 'Update Event', desc: 'Dời lịch hoặc cập nhật khách mời của sự kiện', type: 'automation.http', resource: 'Event', operation: 'Update', status: 'NATIVE' },
      { id: 'piece.gcal.event_delete', title: 'Delete Event', desc: 'Hủy và xóa sự kiện khỏi lịch', type: 'automation.http', resource: 'Event', operation: 'Delete', status: 'NATIVE' },
      // Google Docs
      { id: 'piece.gdocs.doc_create', title: 'Create Google Doc', desc: 'Tạo tài liệu Google Docs mới', type: 'automation.http', resource: 'Google Docs', operation: 'Create', status: 'NATIVE' },
      { id: 'piece.gdocs.doc_get', title: 'Get Google Doc Content', desc: 'Đọc toàn bộ nội dung văn bản của Google Docs', type: 'automation.http', resource: 'Google Docs', operation: 'Get Content', status: 'NATIVE' },
      { id: 'piece.gdocs.doc_update', title: 'Update / Insert / Replace Content', desc: 'Chèn hoặc thay thế văn bản trong Google Docs', type: 'automation.http', resource: 'Google Docs', operation: 'Update', status: 'NATIVE' },
    ],
    additionalFields: [
      { key: 'sendUpdates', label: 'Send Invitations to Attendees', type: 'boolean', default: true },
      { key: 'conferenceData', label: 'Add Google Meet Link', type: 'boolean', default: true },
    ],
    sampleOutput: {
      id: 'cal_evt_882910',
      summary: 'Họp triển khai AI Agent cho khách hàng Enterprise',
      start: { dateTime: '2026-11-10T10:00:00+07:00' },
      end: { dateTime: '2026-11-10T11:00:00+07:00' },
      hangoutLink: 'https://meet.google.com/abc-defg-hij',
    },
  },

  microsoft365: {
    id: 'microsoft365',
    name: 'Microsoft 365 (Excel, Outlook, Teams, OneDrive, SharePoint)',
    desc: 'Bộ tích hợp Microsoft Graph: Excel 365, Outlook Email/Calendar, Teams, OneDrive & SharePoint',
    iconKey: 'microsoft',
    categoryGroup: 'productivity',
    status: 'NATIVE',
    credentialKey: 'MS_GRAPH_TOKEN',
    credentialTitle: 'Microsoft OAuth2 Graph API account',
    notice: 'Sự kiện Outlook, Teams và OneDrive phụ thuộc quyền Microsoft Graph API (Mail.ReadWrite, ChannelMessage.Send, Files.ReadWrite).',
    architecture: {
      authType: 'OAuth2 Microsoft Entra ID (Azure AD)',
      apiCapabilities: 'Microsoft Graph REST API v1.0, Delta Query, Webhook Subscriptions',
      rateLimits: 'Theo giới hạn throttling của từng dịch vụ Microsoft Graph',
      permissions: 'User.Read, Mail.ReadWrite, Calendars.ReadWrite, Files.ReadWrite.All, Sites.ReadWrite.All',
      errorHandling: 'Tự động tôn trọng header Retry-After khi nhận mã 429',
    },
    fields: [
      { key: 'MS_GRAPH_TOKEN', label: 'Microsoft Graph OAuth2 Token', type: 'password', placeholder: 'eyJ0eXAiOiJKV1Qi...' },
    ],
    triggers: [
      { id: 'trigger.ms.outlook_email', title: 'Outlook: New Email', desc: '[T/P] Kích hoạt khi có email mới trong hộp thư Microsoft Outlook', type: 'trigger.appEvent', resource: 'Outlook', eventValue: 'New Email', mechanism: 'P', status: 'NATIVE' },
      { id: 'trigger.ms.teams_message', title: 'Teams: New Channel / Chat Message', desc: '[T/W] Kích hoạt khi có tin nhắn hoặc sự kiện mới trên Microsoft Teams', type: 'trigger.appEvent', resource: 'Teams', eventValue: 'New Message', mechanism: 'W', status: 'NATIVE' },
      { id: 'trigger.ms.onedrive_file', title: 'OneDrive: File Created / Updated', desc: '[T/P] Kích hoạt khi có tệp mới hoặc cập nhật trên OneDrive', type: 'trigger.appEvent', resource: 'OneDrive', eventValue: 'File Updated', mechanism: 'P', status: 'NATIVE' },
    ],
    actions: [
      // Excel 365
      { id: 'piece.ms.excel_workbook', title: 'Excel: Get / Create / Update Workbook', desc: 'Thao tác trên sổ tính Excel 365', type: 'automation.http', resource: 'Excel Workbook', operation: 'Get / Create / Update', status: 'NATIVE' },
      { id: 'piece.ms.excel_worksheet', title: 'Excel: Get / Add / Delete / Update Worksheet', desc: 'Quản lý trang tính Worksheet trong Excel 365', type: 'automation.http', resource: 'Excel Worksheet', operation: 'Manage Worksheet', status: 'NATIVE' },
      { id: 'piece.ms.excel_row', title: 'Excel: Get / Add / Update / Delete Row', desc: 'Thêm, đọc, sửa, xóa dòng trong bảng Excel Table', type: 'automation.http', resource: 'Excel Row', operation: 'Manage Row', status: 'NATIVE' },
      { id: 'piece.ms.excel_range', title: 'Excel: Read / Update Range', desc: 'Đọc và cập nhật vùng ô dữ liệu (Range) trong Excel', type: 'automation.http', resource: 'Excel Range', operation: 'Read / Update', status: 'NATIVE' },
      // Outlook
      { id: 'piece.ms.outlook_send', title: 'Outlook: Send / Reply / Get / Delete Message', desc: 'Gửi, trả lời, đọc và xóa email trên Microsoft Outlook', type: 'automation.http', resource: 'Outlook Message', operation: 'Send / Reply / Get', status: 'NATIVE' },
      { id: 'piece.ms.outlook_event', title: 'Outlook: Create / Get / Update / Delete Event', desc: 'Quản lý lịch hẹn trên Outlook Calendar', type: 'automation.http', resource: 'Outlook Event', operation: 'Manage Event', status: 'NATIVE' },
      // Microsoft Teams
      { id: 'piece.ms.teams_send', title: 'Teams: Send Message to Channel / Chat', desc: 'Gửi tin nhắn hoặc Adaptive Card vào kênh Microsoft Teams', type: 'automation.http', resource: 'Teams Message', operation: 'Send', status: 'NATIVE' },
      { id: 'piece.ms.teams_channel', title: 'Teams: Get / Create Channel & Team', desc: 'Lấy thông tin Team, Member và tạo Channel mới', type: 'automation.http', resource: 'Teams Channel', operation: 'Get / Create', status: 'NATIVE' },
      // OneDrive & SharePoint
      { id: 'piece.ms.onedrive_file', title: 'OneDrive: Upload / Download / Search / Share File', desc: 'Quản lý tệp tin và thư mục trên Microsoft OneDrive', type: 'automation.http', resource: 'OneDrive File', operation: 'Upload / Download / Share', status: 'NATIVE' },
      { id: 'piece.ms.sharepoint_list', title: 'SharePoint: Create / Get / Update / Delete List Item', desc: 'Thao tác trên Site, List, List Item và File của SharePoint', type: 'automation.http', resource: 'SharePoint', operation: 'Manage List Item', status: 'NATIVE' },
    ],
    additionalFields: [
      { key: 'importance', label: 'Importance', type: 'options', default: 'normal', options: [{ name: 'Low', value: 'low' }, { name: 'Normal', value: 'normal' }, { name: 'High', value: 'high' }] },
    ],
    sampleOutput: {
      id: 'AAMkAGI2THVSAAA=',
      subject: 'Báo cáo tiến độ dự án Q4 trên Microsoft 365',
      from: { emailAddress: { name: 'Giám đốc Dự án', address: 'pm@enterprise.com' } },
    },
  },

  notion: {
    id: 'notion',
    name: 'Notion',
    desc: 'Page, Database & Block: Tạo trang, truy vấn Database, thêm Block nội dung & tự động hóa Notion',
    iconKey: 'notion',
    categoryGroup: 'productivity',
    status: 'NATIVE',
    credentialKey: 'NOTION_API_KEY',
    credentialTitle: 'Notion API Integration Secret',
    architecture: {
      authType: 'Bearer Token (Internal Integration Secret) / OAuth2',
      apiCapabilities: 'Notion API Version 2022-06-28, Filter & Sort Query, Cursor Pagination',
      rateLimits: '3 requests / second trung bình mỗi integration',
      permissions: 'Read content, Update content, Insert content trên các trang được chia sẻ',
      errorHandling: 'Tự động retry lỗi 429 rate_limited',
    },
    fields: [
      { key: 'NOTION_API_KEY', label: 'Internal Integration Secret', type: 'password', placeholder: 'secret_...' },
    ],
    triggers: [
      { id: 'trigger.notion.page_added', title: 'Page Added to Database', desc: '[T/P] Kích hoạt khi có trang mới được thêm vào Notion Database', type: 'trigger.database', resource: 'Database', eventValue: 'Page Added to Database', mechanism: 'P', status: 'NATIVE', defaultParams: { tableName: 'Notion Database', event: 'page_added' } },
      { id: 'trigger.notion.page_updated', title: 'Page Updated in Database', desc: '[T/P] Kích hoạt khi thuộc tính của trang trong Database được cập nhật', type: 'trigger.database', resource: 'Database', eventValue: 'Page Updated in Database', mechanism: 'P', status: 'NATIVE', defaultParams: { tableName: 'Notion Database', event: 'page_updated' } },
    ],
    actions: [
      // Resource: Page
      { id: 'piece.notion.page_create', title: 'Create Page', desc: 'Tạo trang mới trong Page hoặc Database', type: 'automation.http', resource: 'Page', operation: 'Create', status: 'NATIVE' },
      { id: 'piece.notion.page_get', title: 'Get Page', desc: 'Lấy thông tin và thuộc tính của một trang Notion', type: 'automation.http', resource: 'Page', operation: 'Get', status: 'NATIVE' },
      { id: 'piece.notion.page_update', title: 'Update Page Properties / Archive', desc: 'Cập nhật thuộc tính (Status, Tag, Date) hoặc lưu trữ trang', type: 'automation.http', resource: 'Page', operation: 'Update', status: 'NATIVE' },
      // Resource: Database
      { id: 'piece.notion.db_get', title: 'Get Database', desc: 'Lấy cấu trúc schema của Notion Database', type: 'automation.http', resource: 'Database', operation: 'Get', status: 'NATIVE' },
      { id: 'piece.notion.db_query', title: 'Query Database', desc: 'Truy vấn và lọc danh sách các mục trong Notion Database', type: 'automation.http', resource: 'Database', operation: 'Query', status: 'NATIVE' },
      // Resource: Block
      { id: 'piece.notion.block_get', title: 'Get Block Children', desc: 'Đọc danh sách các khối nội dung bên trong một trang', type: 'automation.http', resource: 'Block', operation: 'Get', status: 'NATIVE' },
      { id: 'piece.notion.block_append', title: 'Append Block', desc: 'Chèn thêm đoạn văn, tiêu đề, danh sách việc cần làm hoặc bảng', type: 'automation.http', resource: 'Block', operation: 'Append', status: 'NATIVE' },
      { id: 'piece.notion.block_update', title: 'Update Block', desc: 'Chỉnh sửa nội dung của một khối (Block) hiện có', type: 'automation.http', resource: 'Block', operation: 'Update', status: 'NATIVE' },
      { id: 'piece.notion.block_delete', title: 'Delete Block', desc: 'Xóa một khối nội dung khỏi trang', type: 'automation.http', resource: 'Block', operation: 'Delete', status: 'NATIVE' },
    ],
    additionalFields: [
      { key: 'databaseId', label: 'Database ID', type: 'string', placeholder: 'a892bc12-3456-7890-abcd-ef1234567890' },
      { key: 'iconEmoji', label: 'Page Icon Emoji', type: 'string', placeholder: '🚀' },
    ],
    sampleOutput: {
      object: 'page',
      id: 'b9123456-7890-4abc-def0-123456789abc',
      url: 'https://www.notion.so/Ke-hoach-Marketing-AI-b9123456',
      properties: { Name: 'Kế hoạch ra mắt tính năng AI Agent 2026', Status: 'In Progress' },
    },
  },

  projectManagement: {
    id: 'projectManagement',
    name: 'Jira, Linear, Trello, Asana & ClickUp',
    desc: 'Quản lý dự án & công việc: Jira Issue/Transition, Linear Cycle/Issue, Trello Card, Asana & ClickUp Task',
    iconKey: 'jira',
    categoryGroup: 'productivity',
    status: 'NATIVE',
    credentialKey: 'PM_API_TOKEN',
    credentialTitle: 'Project Management API Token',
    notice: 'Linear Trigger hỗ trợ đầy đủ các sự kiện: Issue, Issue Comment, Cycle, Project, Issue Label và Comment Reaction.',
    fields: [
      { key: 'PM_API_TOKEN', label: 'API Token / Personal Access Token', type: 'password', placeholder: 'lin_api_... / ATATT3xFfGF0...' },
    ],
    triggers: [
      { id: 'trigger.pm.jira', title: 'Jira Trigger (Issue Created / Updated)', desc: '[T/W] Kích hoạt khi có Issue mới, đổi trạng thái hoặc bình luận trên Jira', type: 'trigger.appEvent', resource: 'Jira', eventValue: 'Jira Issue Event', mechanism: 'W', status: 'NATIVE' },
      { id: 'trigger.pm.linear', title: 'Linear Trigger (Issue, Comment, Cycle, Project, Label)', desc: '[T/W] Kích hoạt theo sự kiện Issue, Cycle, Project, Label trên Linear', type: 'trigger.appEvent', resource: 'Linear', eventValue: 'Linear Event', mechanism: 'W', status: 'NATIVE' },
      { id: 'trigger.pm.trello', title: 'Trello Trigger (Board / Card Moved)', desc: '[T/W] Kích hoạt khi thẻ Trello được tạo, kéo sang cột khác hoặc bình luận', type: 'trigger.appEvent', resource: 'Trello', eventValue: 'Trello Card Event', mechanism: 'W', status: 'NATIVE' },
      { id: 'trigger.pm.asana', title: 'Asana Trigger (Task Completed / Created)', desc: '[T/W] Kích hoạt khi Task trong Asana được tạo hoặc hoàn thành', type: 'trigger.appEvent', resource: 'Asana', eventValue: 'Asana Task Event', mechanism: 'W', status: 'NATIVE' },
      { id: 'trigger.pm.clickup', title: 'ClickUp Trigger (Task Status Updated)', desc: '[T/W] Kích hoạt khi Task trong ClickUp thay đổi trạng thái', type: 'trigger.appEvent', resource: 'ClickUp', eventValue: 'ClickUp Task Event', mechanism: 'W', status: 'NATIVE' },
    ],
    actions: [
      // Jira
      { id: 'piece.pm.jira_issue', title: 'Jira: Create / Get / Update / Delete Issue', desc: 'Tạo, đọc, cập nhật và xóa Issue trên Jira Software', type: 'automation.http', resource: 'Jira Issue', operation: 'CRUD Issue', status: 'NATIVE' },
      { id: 'piece.pm.jira_transition', title: 'Jira: Execute Issue Transition', desc: 'Chuyển trạng thái workflow của Issue (To Do -> In Progress -> Done)', type: 'automation.http', resource: 'Jira Transition', operation: 'Execute', status: 'NATIVE' },
      { id: 'piece.pm.jira_comment', title: 'Jira: Create / Get Comment', desc: 'Thêm hoặc lấy bình luận trong Jira Issue', type: 'automation.http', resource: 'Jira Comment', operation: 'Create / Get', status: 'NATIVE' },
      // Linear
      { id: 'piece.pm.linear_issue', title: 'Linear: Create / Get / Update Issue', desc: 'Quản lý Issue trên Linear qua GraphQL API', type: 'automation.http', resource: 'Linear Issue', operation: 'Create / Get / Update', status: 'NATIVE' },
      { id: 'piece.pm.linear_project', title: 'Linear: Create / Get Project & Cycle', desc: 'Quản lý Project và chu kỳ Sprint (Cycle) trên Linear', type: 'automation.http', resource: 'Linear Project', operation: 'Create / Get', status: 'NATIVE' },
      // Trello
      { id: 'piece.pm.trello_card', title: 'Trello: Create / Get / Update / Delete Card', desc: 'Thao tác trên Thẻ (Card), Cột (List), Bảng (Board), Member & Label', type: 'automation.http', resource: 'Trello Card', operation: 'CRUD Card', status: 'NATIVE' },
      // Asana & ClickUp
      { id: 'piece.pm.asana_task', title: 'Asana: Create / Get / Update / Delete Task & Project', desc: 'Quản lý Task, Project và User trên Asana', type: 'automation.http', resource: 'Asana Task', operation: 'CRUD Task', status: 'NATIVE' },
      { id: 'piece.pm.clickup_task', title: 'ClickUp: Create / Get / Update / Delete Task, List & Folder', desc: 'Quản lý Task, List và Folder trên ClickUp', type: 'automation.http', resource: 'ClickUp Task', operation: 'CRUD Task', status: 'NATIVE' },
    ],
    additionalFields: [
      { key: 'projectKey', label: 'Project Key / Board ID', type: 'string', placeholder: 'VNC / ENG' },
      { key: 'priority', label: 'Priority', type: 'options', default: 'High', options: [{ name: 'Urgent', value: 'Urgent' }, { name: 'High', value: 'High' }, { name: 'Medium', value: 'Medium' }, { name: 'Low', value: 'Low' }] },
    ],
    sampleOutput: {
      key: 'VNC-108',
      title: 'Triển khai thư viện Integration chuẩn cho VinceAuto',
      status: 'In Progress',
      assignee: 'AI Engineering Agent',
    },
  },

  // ==========================================================================
  // PHẦN 2: SOCIAL MEDIA & COMMUNICATION (P1)
  // ==========================================================================
  telegram: {
    id: 'telegram',
    name: 'Telegram',
    desc: 'Message, Chat, Callback & File: Đầy đủ 12 Webhook Triggers & 24 Actions chuẩn Telegram Bot API',
    iconKey: 'telegram',
    categoryGroup: 'communication',
    status: 'NATIVE',
    credentialKey: 'TELEGRAM_BOT_TOKEN',
    credentialTitle: 'Telegram account',
    notice: 'Due to Telegram API limitations, you can use just one Telegram trigger for each bot at a time',
    secondaryNotice:
      'Every uploaded attachment, even if sent in a group, will trigger a separate event. You can identify that an attachment belongs to a certain group by media_group_id .',
    architecture: {
      authType: 'Bot Token (BotFather)',
      apiCapabilities: 'Telegram Bot API, Webhook Updates, Multipart File Upload/Download, Inline Keyboards',
      rateLimits: '30 messages / second (1 message / second trong cùng 1 nhóm)',
      permissions: 'Bot cần được thêm làm Admin trong Group/Channel để dùng Pin, Delete, Set Title',
      errorHandling: 'Tự động đợi retry_after giây khi nhận mã 429 Too Many Requests',
    },
    fields: [
      { key: 'TELEGRAM_BOT_TOKEN', label: 'Access Token (BotFather)', type: 'password', placeholder: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ' },
      { key: 'TELEGRAM_CHAT_ID', label: 'Default Chat ID / Channel', type: 'string', placeholder: '@my_channel hoặc -100123456789' },
    ],
    triggers: [
      { id: 'trigger.telegram.message', title: 'On Message', desc: '[T/W] Triggers when a new message of any kind — text, photo, sticker, etc. — is received', type: 'trigger.appEvent', resource: 'Message', eventValue: 'Message', mechanism: 'W', status: 'NATIVE', defaultParams: { app: 'telegram', updates: ['Message'] } },
      { id: 'trigger.telegram.callback_query', title: 'On Callback Query', desc: '[T/W] Triggers when a new incoming callback query from an inline button is received', type: 'trigger.appEvent', resource: 'Callback', eventValue: 'Callback Query', mechanism: 'W', status: 'NATIVE', defaultParams: { app: 'telegram', updates: ['Callback Query'] } },
      { id: 'trigger.telegram.channel_post', title: 'On Channel Post', desc: '[T/W] Triggers when a new incoming channel post of any kind is published', type: 'trigger.appEvent', resource: 'Channel', eventValue: 'Channel Post', mechanism: 'W', status: 'NATIVE', defaultParams: { app: 'telegram', updates: ['Channel Post'] } },
      { id: 'trigger.telegram.edited_message', title: 'On Edited Message', desc: '[T/W] Triggers when a message that is known to the bot is edited', type: 'trigger.appEvent', resource: 'Message', eventValue: 'Edited Message', mechanism: 'W', status: 'NATIVE', defaultParams: { app: 'telegram', updates: ['Edited Message'] } },
      { id: 'trigger.telegram.edited_channel_post', title: 'On Edited Channel Post', desc: '[T/W] Triggers when a channel post is edited', type: 'trigger.appEvent', resource: 'Channel', eventValue: 'Edited Channel Post', mechanism: 'W', status: 'NATIVE', defaultParams: { app: 'telegram', updates: ['Edited Channel Post'] } },
      { id: 'trigger.telegram.inline_query', title: 'On Inline Query', desc: '[T/W] Triggers when a user sends an inline query (@bot) to the bot', type: 'trigger.appEvent', resource: 'Callback', eventValue: 'Inline Query', mechanism: 'W', status: 'NATIVE', defaultParams: { app: 'telegram', updates: ['Inline Query'] } },
      { id: 'trigger.telegram.poll', title: 'On Poll Change / Answer', desc: '[T/W] Triggers when a poll state updates or receives new answers', type: 'trigger.appEvent', resource: 'Poll', eventValue: 'Poll', mechanism: 'W', status: 'NATIVE', defaultParams: { app: 'telegram', updates: ['Poll'] } },
      { id: 'trigger.telegram.pre_checkout_query', title: 'On Pre-Checkout Query', desc: '[T/W] Triggers when a user requests payment checkout', type: 'trigger.appEvent', resource: 'Payment', eventValue: 'Pre-Checkout Query', mechanism: 'W', status: 'NATIVE', defaultParams: { app: 'telegram', updates: ['Pre-Checkout Query'] } },
      { id: 'trigger.telegram.shipping_query', title: 'On Shipping Query', desc: '[T/W] Triggers when shipping address query is received', type: 'trigger.appEvent', resource: 'Payment', eventValue: 'Shipping Query', mechanism: 'W', status: 'NATIVE', defaultParams: { app: 'telegram', updates: ['Shipping Query'] } },
      { id: 'trigger.telegram.chat_member', title: 'On Chat Member Updated', desc: '[T/W] Triggers when a member status changes in a chat', type: 'trigger.appEvent', resource: 'Chat', eventValue: 'Chat Member', mechanism: 'W', status: 'NATIVE', defaultParams: { app: 'telegram', updates: ['Chat Member'] } },
      { id: 'trigger.telegram.chat_join_request', title: 'On Chat Join Request', desc: '[T/W] Triggers when a user requests to join a group/channel', type: 'trigger.appEvent', resource: 'Chat', eventValue: 'Chat Join Request', mechanism: 'W', status: 'NATIVE', defaultParams: { app: 'telegram', updates: ['Chat Join Request'] } },
      { id: 'trigger.telegram.all', title: 'On Any Update (*)', desc: '[T/W] Listen to all incoming Telegram events simultaneously', type: 'trigger.appEvent', resource: 'All', eventValue: '*', mechanism: 'W', status: 'NATIVE', defaultParams: { app: 'telegram', updates: ['*'] } },
    ],
    actions: [
      // Chat
      { id: 'vince.telegram.get_chat', title: 'Get a chat', desc: 'Get up-to-date information about a chat', type: 'vince.telegram', resource: 'Chat', operation: 'Get', status: 'NATIVE', defaultParams: { resource: 'chat', operation: 'get' } },
      { id: 'vince.telegram.get_administrators', title: 'Get chat administrators', desc: 'Get a list of all administrators in a chat', type: 'vince.telegram', resource: 'Chat', operation: 'Get Administrators', status: 'NATIVE', defaultParams: { resource: 'chat', operation: 'administrators' } },
      { id: 'vince.telegram.get_member', title: 'Get a chat member', desc: 'Get member details of a user in a chat', type: 'vince.telegram', resource: 'Chat', operation: 'Get Member', status: 'NATIVE', defaultParams: { resource: 'chat', operation: 'member' } },
      { id: 'vince.telegram.leave_chat', title: 'Leave a chat', desc: 'Leave a group, supergroup or channel', type: 'vince.telegram', resource: 'Chat', operation: 'Leave', status: 'NATIVE', defaultParams: { resource: 'chat', operation: 'leave' } },
      { id: 'vince.telegram.set_chat_description', title: 'Set description on a chat', desc: 'Change description of a group or channel', type: 'vince.telegram', resource: 'Chat', operation: 'Set Description', status: 'NATIVE', defaultParams: { resource: 'chat', operation: 'setDescription' } },
      { id: 'vince.telegram.set_chat_title', title: 'Set title on a chat', desc: 'Change title of a group or channel', type: 'vince.telegram', resource: 'Chat', operation: 'Set Title', status: 'NATIVE', defaultParams: { resource: 'chat', operation: 'setTitle' } },
      // Callback
      { id: 'vince.telegram.answer_callback_query', title: 'Answer a callback query', desc: 'Send answers to callback queries from inline keyboards', type: 'vince.telegram', resource: 'Callback', operation: 'Answer Query', status: 'NATIVE', defaultParams: { resource: 'callback', operation: 'answerQuery' } },
      { id: 'vince.telegram.answer_inline_query', title: 'Answer an inline query', desc: 'Send answers to an incoming inline query', type: 'vince.telegram', resource: 'Callback', operation: 'Answer Inline Query', status: 'NATIVE', defaultParams: { resource: 'callback', operation: 'answerInlineQuery' } },
      // File
      { id: 'vince.telegram.get_file', title: 'Get a file', desc: 'Get file info and download file from Telegram', type: 'vince.telegram', resource: 'File', operation: 'Get File', status: 'NATIVE', defaultParams: { resource: 'file', operation: 'get' } },
      // Message
      { id: 'vince.telegram.send_message', title: 'Send a text message', desc: 'Send a text message (Markdown/HTML) with optional inline keyboard', type: 'vince.telegram', resource: 'Message', operation: 'Send', status: 'NATIVE', defaultParams: { resource: 'message', operation: 'sendMessage' } },
      { id: 'vince.telegram.send_and_wait', title: 'Send a message and wait for response', desc: 'Send message with approval buttons and wait for user reply', type: 'vince.telegram', resource: 'Message', operation: 'Send and Wait', status: 'NATIVE', defaultParams: { resource: 'message', operation: 'sendAndWait' } },
      { id: 'vince.telegram.edit_message', title: 'Edit a text message', desc: 'Edit a previously sent text message', type: 'vince.telegram', resource: 'Message', operation: 'Edit', status: 'NATIVE', defaultParams: { resource: 'message', operation: 'editMessageText' } },
      { id: 'vince.telegram.delete_message', title: 'Delete a chat message', desc: 'Delete a message from a chat', type: 'vince.telegram', resource: 'Message', operation: 'Delete', status: 'NATIVE', defaultParams: { resource: 'message', operation: 'deleteMessage' } },
      { id: 'vince.telegram.pin_message', title: 'Pin a chat message', desc: 'Pin a message in a group or channel', type: 'vince.telegram', resource: 'Message', operation: 'Pin', status: 'NATIVE', defaultParams: { resource: 'message', operation: 'pinChatMessage' } },
      { id: 'vince.telegram.unpin_message', title: 'Unpin a chat message', desc: 'Unpin a message in a group or channel', type: 'vince.telegram', resource: 'Message', operation: 'Unpin', status: 'NATIVE', defaultParams: { resource: 'message', operation: 'unpinChatMessage' } },
      { id: 'vince.telegram.send_photo', title: 'Send a photo', desc: 'Send an image/photo to a chat or channel', type: 'vince.telegram', resource: 'Message', operation: 'Send Photo', status: 'NATIVE', defaultParams: { resource: 'message', operation: 'sendPhoto' } },
      { id: 'vince.telegram.send_video', title: 'Send a video', desc: 'Send a video file to a chat', type: 'vince.telegram', resource: 'Message', operation: 'Send Video', status: 'NATIVE', defaultParams: { resource: 'message', operation: 'sendVideo' } },
      { id: 'vince.telegram.send_audio', title: 'Send an audio file', desc: 'Send an audio file to a chat', type: 'vince.telegram', resource: 'Message', operation: 'Send Audio', status: 'NATIVE', defaultParams: { resource: 'message', operation: 'sendAudio' } },
      { id: 'vince.telegram.send_document', title: 'Send a document', desc: 'Send a PDF, ZIP, CSV or general document file', type: 'vince.telegram', resource: 'Message', operation: 'Send Document', status: 'NATIVE', defaultParams: { resource: 'message', operation: 'sendDocument' } },
      { id: 'vince.telegram.send_animation', title: 'Send an animated file (GIF)', desc: 'Send animation files (GIF or video without sound)', type: 'vince.telegram', resource: 'Message', operation: 'Send Animation', status: 'NATIVE', defaultParams: { resource: 'message', operation: 'sendAnimation' } },
      { id: 'vince.telegram.send_media_group', title: 'Send a media group', desc: 'Send a group of photos or videos as an album', type: 'vince.telegram', resource: 'Message', operation: 'Send Media Group', status: 'NATIVE', defaultParams: { resource: 'message', operation: 'sendMediaGroup' } },
      { id: 'vince.telegram.send_location', title: 'Send a location', desc: 'Send latitude and longitude coordinates on map', type: 'vince.telegram', resource: 'Message', operation: 'Send Location', status: 'NATIVE', defaultParams: { resource: 'message', operation: 'sendLocation' } },
      { id: 'vince.telegram.send_sticker', title: 'Send a sticker', desc: 'Send static .WEBP or animated .TGS sticker', type: 'vince.telegram', resource: 'Message', operation: 'Send Sticker', status: 'NATIVE', defaultParams: { resource: 'message', operation: 'sendSticker' } },
      { id: 'vince.telegram.send_chat_action', title: 'Send a chat action', desc: 'Broadcast typing..., upload_photo, record_video status', type: 'vince.telegram', resource: 'Message', operation: 'Send Chat Action', status: 'NATIVE', defaultParams: { resource: 'message', operation: 'sendChatAction' } },
    ],
    additionalFields: [
      { key: 'downloadImages', label: 'Download Images/Files', type: 'boolean', default: true },
      { key: 'imageSize', label: 'Image Size', type: 'options', default: 'large', options: [{ name: 'Small', value: 'small' }, { name: 'Medium', value: 'medium' }, { name: 'Large', value: 'large' }] },
      { key: 'restrictChatIds', label: 'Restrict to Chat IDs', type: 'string', placeholder: '-1001234567, 987654321' },
      { key: 'restrictUserIds', label: 'Restrict to User IDs', type: 'string', placeholder: '12345678, 87654321' },
      { key: 'parseMode', label: 'Parse Mode', type: 'options', default: 'HTML', options: [{ name: 'HTML', value: 'HTML' }, { name: 'Markdown (Legacy)', value: 'Markdown' }, { name: 'MarkdownV2', value: 'MarkdownV2' }] },
      { key: 'disableNotification', label: 'Disable Notification', type: 'boolean', default: false },
      { key: 'replyToMessageId', label: 'Reply To Message ID', type: 'string', placeholder: '{{ $json.message.message_id }}' },
    ],
    sampleOutput: {
      update_id: 894120394,
      message: {
        message_id: 142,
        from: { id: 581920391, is_bot: false, first_name: 'Minh', last_name: 'Nguyen', username: 'minhnguyen_vn' },
        chat: { id: 581920391, first_name: 'Minh', last_name: 'Nguyen', type: 'private' },
        date: 1731142800,
        text: 'Xin chào AI Agent, hãy kiểm tra báo cáo doanh thu hôm nay giúp tôi!',
      },
    },
  },

  facebook: {
    id: 'facebook',
    name: 'Facebook Graph API & Instagram',
    desc: 'Page, Post, Photo, Video, Comment, Lead Ads & Instagram Business Media/Insights',
    iconKey: 'facebook',
    categoryGroup: 'communication',
    status: 'NATIVE',
    credentialKey: 'FB_PAGE_ACCESS_TOKEN',
    credentialTitle: 'Meta Graph API account',
    notice: 'Giới hạn (L): Cần Meta App, quyền Page phù hợp và App Review cho môi trường Production. Không truy cập tài khoản cá nhân.',
    architecture: {
      authType: 'OAuth2 Meta Graph API (Page Access Token / System User Token)',
      apiCapabilities: 'Graph API v20.0, Webhooks (Page, Leadgen, Instagram), Resumable Video Upload',
      rateLimits: '200 calls / hour / user (Business Use Case Rate Limits)',
      permissions: 'pages_manage_posts, pages_messaging, pages_read_engagement, leads_retrieval, instagram_basic, instagram_content_publish',
      errorHandling: 'Chuẩn hóa mã lỗi Graph API (#100, #190 Token Expired, #4 Rate Limit)',
      limitations: 'Instagram yêu cầu tài khoản Chuyên nghiệp (Business/Creator) liên kết với Facebook Page.',
    },
    fields: [
      { key: 'FB_PAGE_ACCESS_TOKEN', label: 'Page / System User Access Token', type: 'password', placeholder: 'EAAB...' },
      { key: 'FB_PAGE_ID', label: 'Fanpage ID', type: 'string', placeholder: '1029384756' },
    ],
    triggers: [
      { id: 'trigger.facebook.webhook', title: 'Facebook Trigger (Page & Messenger Events)', desc: '[T/W] Nhận sự kiện tin nhắn, bình luận, bài viết từ Facebook Page Webhook', type: 'trigger.appEvent', resource: 'Page', eventValue: 'Facebook Webhook', mechanism: 'W', status: 'NATIVE' },
      { id: 'trigger.facebook.lead_ads', title: 'Facebook Lead Ads Trigger', desc: '[T/W] Nhận thông tin khách hàng tiềm năng ngay khi nộp form Lead Ads', type: 'trigger.socialMedia', resource: 'Lead', eventValue: 'Lead Ads', mechanism: 'W', status: 'NATIVE' },
      { id: 'trigger.instagram.webhook', title: 'Instagram Webhook Events (Comment / Mention / Story)', desc: '[T/W] Nhận sự kiện bình luận và tương tác từ tài khoản Instagram Business', type: 'trigger.socialMedia', resource: 'Instagram', eventValue: 'Instagram Event', mechanism: 'W', status: 'API_ADAPTER' },
    ],
    actions: [
      // Facebook Graph API
      { id: 'piece.facebook.page_get', title: 'Page: Get / Get Many / Page Information', desc: 'Lấy thông tin chi tiết và danh sách các Fanpage quản trị', type: 'piece.facebook.publish_page_post', resource: 'Page', operation: 'Get / Get Many', status: 'NATIVE' },
      { id: 'piece.facebook.publish_page_post', title: 'Post: Create / Get / Update / Delete', desc: 'Đăng bài mới, đọc, cập nhật hoặc xóa bài viết trên Fanpage', type: 'piece.facebook.publish_page_post', resource: 'Post', operation: 'Create / Get / Update / Delete', status: 'NATIVE' },
      { id: 'piece.facebook.photo_create', title: 'Photo: Create / Get', desc: 'Đăng ảnh mới hoặc lấy thông tin ảnh trên Page', type: 'piece.facebook.publish_page_post', resource: 'Photo', operation: 'Create / Get', status: 'NATIVE' },
      { id: 'piece.facebook.video_upload', title: 'Video: Upload / Get', desc: 'Tải lên video hoặc lấy thông tin video trên Fanpage', type: 'piece.facebook.publish_page_post', resource: 'Video', operation: 'Upload / Get', status: 'NATIVE' },
      { id: 'piece.facebook.reply_comment', title: 'Comment: Get / Create / Reply / Delete', desc: 'Đọc bình luận, phản hồi tự động hoặc xóa bình luận trên bài viết', type: 'piece.facebook.reply_comment', resource: 'Comment', operation: 'Get / Create / Reply / Delete', status: 'NATIVE' },
      { id: 'piece.facebook.send_messenger_message', title: 'Messenger: Send Text / Template', desc: 'Gửi tin nhắn văn bản hoặc mẫu nút bấm qua Send API', type: 'piece.facebook.send_messenger_message', resource: 'Messenger', operation: 'Send Message', status: 'NATIVE' },
      { id: 'piece.facebook.lead_retrieve', title: 'Lead: Retrieve via Lead Ads API', desc: 'Truy xuất dữ liệu khách hàng từ form quảng cáo Lead Ads theo leadgen_id', type: 'piece.facebook.publish_page_post', resource: 'Lead', operation: 'Retrieve', status: 'NATIVE' },
      // Instagram
      { id: 'piece.instagram.media_publish', title: 'Instagram Media: Create / Publish / Get', desc: 'Khởi tạo container và xuất bản ảnh/Reels/Story lên Instagram Business', type: 'piece.facebook.publish_page_post', resource: 'Instagram Media', operation: 'Create / Publish / Get', status: 'API_ADAPTER' },
      { id: 'piece.instagram.comment_reply', title: 'Instagram Comment: Get / Reply / Hide', desc: 'Trả lời hoặc ẩn bình luận trên bài đăng Instagram', type: 'piece.facebook.reply_comment', resource: 'Instagram Comment', operation: 'Get / Reply / Hide', status: 'API_ADAPTER' },
      { id: 'piece.instagram.insights', title: 'Instagram User & Insights: Get Business Profile / Insights', desc: 'Lấy thống kê tương tác và hồ sơ Instagram Business', type: 'piece.facebook.publish_page_post', resource: 'Instagram Insights', operation: 'Get', status: 'API_ADAPTER' },
    ],
    additionalFields: [
      { key: 'published', label: 'Publish Immediately', type: 'boolean', default: true },
    ],
    sampleOutput: {
      object: 'page',
      sender_psid: '789102938475612',
      post_id: '1029384756_9988776655',
      message: 'Shop báo giá giúp mình gói giải pháp AI Automation nhé!',
    },
  },

  zalo: {
    id: 'zalo',
    name: 'Zalo Official Account',
    desc: 'Adapter độc lập VinceAuto: Tin nhắn Tư vấn, ZNS, Người quan tâm, Tag & Webhook OA',
    iconKey: 'zalo',
    categoryGroup: 'communication',
    status: 'API_ADAPTER',
    credentialKey: 'ZALO_ACCESS_TOKEN',
    credentialTitle: 'Zalo OA Developer Account',
    notice: 'Đây là Adapter riêng của VinceAuto kết nối Zalo Open API v3.0 & ZNS API. Yêu cầu Zalo OA đã xác thực.',
    fields: [
      { key: 'ZALO_ACCESS_TOKEN', label: 'Zalo OA Access Token', type: 'password', placeholder: 'Nhập OA Access Token' },
      { key: 'ZALO_OA_ID', label: 'Official Account ID', type: 'string', placeholder: '1928301928301' },
    ],
    triggers: [
      { id: 'trigger.zalo.user_send_text', title: 'User Send Text Message', desc: '[T/W] Khi khách hàng gửi tin nhắn văn bản tới Zalo OA', type: 'trigger.appEvent', resource: 'Message', eventValue: 'user_send_text', mechanism: 'W', status: 'API_ADAPTER' },
      { id: 'trigger.zalo.user_send_image', title: 'User Send Image / File', desc: '[T/W] Khi khách hàng gửi hình ảnh hoặc tệp đính kèm', type: 'trigger.appEvent', resource: 'Message', eventValue: 'user_send_image', mechanism: 'W', status: 'API_ADAPTER' },
      { id: 'trigger.zalo.follow', title: 'User Follow / Unfollow OA', desc: '[T/W] Khi khách hàng bấm Quan Tâm hoặc Bỏ Quan Tâm Zalo OA', type: 'trigger.appEvent', resource: 'Follower', eventValue: 'follow', mechanism: 'W', status: 'API_ADAPTER' },
    ],
    actions: [
      { id: 'piece.zalo.send_consultant_message', title: 'Send Consultant Message (Text / Image / List)', desc: 'Gửi tin nhắn tư vấn CSKH qua Zalo OA Open API', type: 'piece.zalo.send_consultant_message', resource: 'Message', operation: 'Send Consultant Message', status: 'API_ADAPTER' },
      { id: 'piece.zalo.send_zns', title: 'Send ZNS Template Notification', desc: 'Gửi thông báo ZNS qua số điện thoại khách hàng', type: 'piece.zalo.send_zns', resource: 'ZNS', operation: 'Send ZNS', status: 'API_ADAPTER' },
      { id: 'piece.zalo.get_followers', title: 'Get Follower Profile & Tag Management', desc: 'Truy vấn hồ sơ người quan tâm và gắn nhãn phân loại', type: 'piece.zalo.get_followers', resource: 'User', operation: 'Get Profile / Tag', status: 'API_ADAPTER' },
    ],
    additionalFields: [
      { key: 'templateId', label: 'ZNS Template ID', type: 'string', placeholder: '283910' },
    ],
    sampleOutput: {
      event_name: 'user_send_text',
      sender: { id: '8491827364519283' },
      message: { msg_id: 'msg_zalo_998123', text: 'Tư vấn giúp mình gói dịch vụ AI Automation' },
    },
  },

  slack: {
    id: 'slack',
    name: 'Slack',
    desc: 'Message, Channel, User, Reaction, File, Conversation & Pin: Tích hợp Slack Workspace',
    iconKey: 'slack',
    categoryGroup: 'communication',
    status: 'NATIVE',
    credentialKey: 'SLACK_BOT_TOKEN',
    credentialTitle: 'Slack Bot OAuth2 account',
    fields: [
      { key: 'SLACK_BOT_TOKEN', label: 'Bot User OAuth Token', type: 'password', placeholder: 'xoxb-...' },
    ],
    triggers: [
      { id: 'trigger.slack.events', title: 'Slack Trigger (Message, Mention, Reaction, Channel, Member)', desc: '[T/W] Lắng nghe các sự kiện Slack Events API theo quyền OAuth', type: 'trigger.appEvent', resource: 'Event', eventValue: 'Slack Event', mechanism: 'W', status: 'NATIVE' },
    ],
    actions: [
      { id: 'piece.slack.send_message', title: 'Message: Send / Get / Update / Delete / Send and Wait', desc: 'Gửi tin nhắn, cập nhật, xóa hoặc chờ phê duyệt trên Slack', type: 'piece.slack.send_message', resource: 'Message', operation: 'Send / Get / Update / Delete', status: 'NATIVE' },
      { id: 'piece.slack.channel', title: 'Channel: Create / Get / Archive', desc: 'Tạo kênh mới, lấy thông tin hoặc lưu trữ kênh Slack', type: 'piece.slack.send_message', resource: 'Channel', operation: 'Create / Get / Archive', status: 'NATIVE' },
      { id: 'piece.slack.user', title: 'User: Get / Get Many', desc: 'Lấy hồ sơ người dùng và danh sách thành viên trong Workspace', type: 'piece.slack.send_message', resource: 'User', operation: 'Get / Get Many', status: 'NATIVE' },
      { id: 'piece.slack.reaction', title: 'Reaction: Add / Remove', desc: 'Thả hoặc gỡ biểu tượng cảm xúc (Emoji Reaction) vào tin nhắn', type: 'piece.slack.send_message', resource: 'Reaction', operation: 'Add / Remove', status: 'NATIVE' },
      { id: 'piece.slack.file', title: 'File: Upload / Get', desc: 'Tải tệp lên kênh Slack hoặc lấy thông tin tệp', type: 'piece.slack.send_message', resource: 'File', operation: 'Upload / Get', status: 'NATIVE' },
      { id: 'piece.slack.conversation', title: 'Conversation & Pin: Get / History / Add & Remove Pin', desc: 'Lấy lịch sử hội thoại và ghim/bỏ ghim tin nhắn', type: 'piece.slack.send_message', resource: 'Conversation & Pin', operation: 'History / Pin', status: 'NATIVE' },
    ],
    additionalFields: [
      { key: 'thread_ts', label: 'Thread Timestamp (ts)', type: 'string', placeholder: '{{ $json.ts }}' },
    ],
    sampleOutput: {
      ok: true,
      channel: 'C06ABC123XY',
      ts: '1731142910.001200',
      text: 'Đã triển khai thành công bản vẽ lên Production!',
    },
  },

  discord: {
    id: 'discord',
    name: 'Discord',
    desc: 'Message, Channel, Guild, Member, Role, Reaction & Webhook',
    iconKey: 'discord',
    categoryGroup: 'communication',
    status: 'NATIVE',
    credentialKey: 'DISCORD_BOT_TOKEN',
    credentialTitle: 'Discord Bot / Webhook account',
    fields: [
      { key: 'DISCORD_BOT_TOKEN', label: 'Bot Token or Webhook URL', type: 'password', placeholder: 'https://discord.com/api/webhooks/...' },
    ],
    triggers: [
      { id: 'trigger.discord.events', title: 'Discord Trigger (Message / Member / Reaction Events)', desc: '[T/W] Lắng nghe sự kiện từ Discord Bot theo Gateway/Webhook được cấu hình', type: 'trigger.appEvent', resource: 'Guild', eventValue: 'Discord Event', mechanism: 'W', status: 'API_ADAPTER' },
    ],
    actions: [
      { id: 'piece.discord.send_webhook', title: 'Message: Send / Get / Edit / Delete', desc: 'Gửi, đọc, sửa và xóa tin nhắn trong kênh Discord', type: 'piece.discord.send_webhook', resource: 'Message', operation: 'Send / Get / Edit / Delete', status: 'NATIVE' },
      { id: 'piece.discord.channel', title: 'Channel & Guild: Get / Create / Update', desc: 'Quản lý thông tin Server (Guild) và tạo/cập nhật Channel', type: 'piece.discord.send_webhook', resource: 'Channel & Guild', operation: 'Get / Create / Update', status: 'NATIVE' },
      { id: 'piece.discord.member_role', title: 'Member & Role: Get / Add / Remove / Create / Update', desc: 'Quản lý thành viên và phân quyền Role trên Discord Server', type: 'piece.discord.send_webhook', resource: 'Member & Role', operation: 'Manage Member & Role', status: 'NATIVE' },
      { id: 'piece.discord.reaction_webhook', title: 'Reaction & Webhook: Add / Get / Remove / Manage Webhook', desc: 'Thao tác Emoji Reaction và quản lý Discord Webhook', type: 'piece.discord.send_webhook', resource: 'Reaction & Webhook', operation: 'Manage Reaction & Webhook', status: 'NATIVE' },
    ],
    additionalFields: [
      { key: 'username', label: 'Override Bot Username', type: 'string', placeholder: 'VinceAuto Bot' },
    ],
    sampleOutput: {
      id: '1304918273645123',
      channel_id: '1102938475610293',
      content: 'Hệ thống AI Agent đã hoàn thành kiểm thử!',
    },
  },

  tiktok: {
    id: 'tiktok',
    name: 'TikTok (Content Posting & Business API)',
    desc: 'Đăng Video trực tiếp, Photo Carousel, Kiểm tra trạng thái xuất bản, Lấy danh sách Video & Thống kê kênh',
    iconKey: 'tiktok',
    categoryGroup: 'communication',
    status: 'API_ADAPTER',
    credentialKey: 'TIKTOK_ACCESS_TOKEN',
    credentialTitle: 'TikTok Developer OAuth2 account',
    notice: 'Giới hạn (L): TikTok Login Kit & Content Posting API cần được cấp quyền (user.info.basic, video.upload, video.publish, video.list).',
    architecture: {
      authType: 'OAuth 2.0 TikTok Login Kit (open_id + Bearer Access Token & Refresh Token)',
      apiCapabilities: 'Direct Post Video, Upload Video to Inbox (Draft), Publish Photo Mode Carousel, Query Publish Status, Video List & Metrics',
      rateLimits: '60 requests / minute / user; giới hạn số bài Direct Post mỗi ngày theo quy định TikTok Creator',
      permissions: 'user.info.basic, user.info.stats, video.upload, video.publish, video.list',
      errorHandling: 'Xử lý mã lỗi TikTok v2 (access_token_invalid, rate_limit_exceeded, spam_risk_too_many_pending_share)',
      limitations: 'Video Direct Post cần khai báo privacy_level, disable_duet, disable_stitch, disable_comment hợp lệ.',
    },
    fields: [
      { key: 'TIKTOK_ACCESS_TOKEN', label: 'TikTok OAuth2 Access Token', type: 'password', placeholder: 'act.example123456789...' },
      { key: 'TIKTOK_OPEN_ID', label: 'TikTok Open ID', type: 'string', placeholder: '_000abc123def456...' },
    ],
    triggers: [
      { id: 'trigger.tiktok.publish_status', title: 'On Video Publish Status Changed', desc: '[T/W] Nhận sự kiện Webhook khi video đăng lên TikTok hoàn tất xử lý hoặc xuất bản thành công', type: 'trigger.socialMedia', resource: 'Video', eventValue: 'post.publish.complete', mechanism: 'W', status: 'API_ADAPTER' },
      { id: 'trigger.tiktok.comment', title: 'On New TikTok Comment / Mention (Business)', desc: '[T/W] Nhận sự kiện khi có bình luận mới trên video TikTok Business', type: 'trigger.socialMedia', resource: 'Comment', eventValue: 'comment.create', mechanism: 'W', status: 'API_ADAPTER' },
      { id: 'trigger.tiktok.new_video', title: 'On New Video Posted on Channel', desc: '[T/P] Định kỳ kiểm tra video mới xuất bản trên kênh TikTok', type: 'trigger.socialMedia', resource: 'Video', eventValue: 'video.list.poll', mechanism: 'P', status: 'API_ADAPTER' },
    ],
    actions: [
      { id: 'vince.tiktok.publish_video', title: 'Video: Publish Direct Video', desc: 'Đăng trực tiếp video lên kênh TikTok kèm caption, hashtags (#xuhuong) và cài đặt quyền riêng tư', type: 'vince.tiktok.action', resource: 'Video', operation: 'Publish Direct Video', status: 'API_ADAPTER', defaultParams: { resource: 'Video', operation: 'publishVideo', privacyLevel: 'PUBLIC_TO_EVERYONE' } },
      { id: 'vince.tiktok.upload_draft', title: 'Video: Upload Video to Inbox (Draft)', desc: 'Tải tệp video lên hộp thư nháp TikTok để người sáng tạo thêm nhạc/hiệu ứng và đăng', type: 'vince.tiktok.action', resource: 'Video', operation: 'Upload Draft', status: 'API_ADAPTER', defaultParams: { resource: 'Video', operation: 'uploadDraft' } },
      { id: 'vince.tiktok.publish_photo', title: 'Photo: Publish Photo Mode Carousel', desc: 'Đăng bộ ảnh trượt (Photo Carousel) tối đa 35 ảnh lên TikTok', type: 'vince.tiktok.action', resource: 'Photo', operation: 'Publish Photo Carousel', status: 'API_ADAPTER', defaultParams: { resource: 'Photo', operation: 'publishPhotoCarousel' } },
      { id: 'vince.tiktok.query_status', title: 'Status: Query Publish Status', desc: 'Kiểm tra trạng thái xử lý và kiểm duyệt của video/ảnh theo publish_id', type: 'vince.tiktok.action', resource: 'Status', operation: 'Query Status', status: 'API_ADAPTER', defaultParams: { resource: 'Status', operation: 'queryPublishStatus' } },
      { id: 'vince.tiktok.video_list', title: 'Video Information: Query Video List & Insights', desc: 'Lấy danh sách video trên kênh kèm lượt xem (view_count), tim (like_count), bình luận và chia sẻ', type: 'vince.tiktok.action', resource: 'Video Information', operation: 'Query Videos', status: 'API_ADAPTER', defaultParams: { resource: 'Video Information', operation: 'queryVideoList' } },
      { id: 'vince.tiktok.user_profile', title: 'User: Get Creator Profile & Stats', desc: 'Lấy thông tin hồ sơ TikTok (Display Name, Avatar, Follower count, Likes count)', type: 'vince.tiktok.action', resource: 'User', operation: 'Get Profile', status: 'API_ADAPTER', defaultParams: { resource: 'User', operation: 'getProfile' } },
      { id: 'vince.tiktok.reply_comment', title: 'Comment: Reply to Video Comment (Business API)', desc: 'Trả lời tự động bình luận của người xem trên video TikTok Business', type: 'vince.tiktok.action', resource: 'Comment', operation: 'Reply Comment', status: 'API_ADAPTER', defaultParams: { resource: 'Comment', operation: 'replyComment' } },
    ],
    additionalFields: [
      { key: 'privacyLevel', label: 'Privacy Level', type: 'options', default: 'PUBLIC_TO_EVERYONE', options: [{ name: 'Public to Everyone', value: 'PUBLIC_TO_EVERYONE' }, { name: 'Mutual Follow Friends', value: 'MUTUAL_FOLLOW_FRIENDS' }, { name: 'Self Only (Private)', value: 'SELF_ONLY' }] },
      { key: 'disableDuet', label: 'Disable Duet', type: 'boolean', default: false },
      { key: 'disableStitch', label: 'Disable Stitch', type: 'boolean', default: false },
    ],
    sampleOutput: {
      data: {
        publish_id: 'v_pub_url~v2.7391827364519283746',
        status: 'PUBLISH_COMPLETE',
        share_url: 'https://www.tiktok.com/@vinceauto.vn/video/7391827364519283746',
      },
      error: { code: 'ok', message: '' },
    },
  },

  threads: {
    id: 'threads',
    name: 'Threads (Meta Threads API)',
    desc: 'Đăng bài Text, Ảnh, Video, Chuỗi Carousel, Tự động trả lời bình luận, Ẩn reply & Lấy thống kê Threads',
    iconKey: 'threads',
    categoryGroup: 'communication',
    status: 'API_ADAPTER',
    credentialKey: 'THREADS_ACCESS_TOKEN',
    credentialTitle: 'Meta Threads OAuth2 account',
    notice: 'Sử dụng chính thức Meta Threads Graph API (graph.threads.net/v1.0). Hỗ trợ đăng bài đơn, Carousel 20 mục, quản lý Reply và đọc Insights.',
    architecture: {
      authType: 'OAuth 2.0 Meta Threads API (Long-lived User Access Token 60 ngày, tự động Refresh)',
      apiCapabilities: 'Single Thread Post (Text/Image/Video), Carousel Posts (up to 20 items), Reply Management, Conversation Tree, Insights API, Webhooks',
      rateLimits: '250 bài đăng / 24h; 1.000 replies / 24h theo hạn mức Meta Threads API',
      permissions: 'threads_basic, threads_content_publish, threads_manage_replies, threads_read_replies, threads_manage_insights',
      errorHandling: 'Tự động xử lý quy trình 2 bước (Create Media Container -> Wait Status FINISHED -> Publish Container)',
      limitations: 'Văn bản giới hạn tối đa 500 ký tự mỗi bài đăng Threads.',
    },
    fields: [
      { key: 'THREADS_ACCESS_TOKEN', label: 'Threads User Access Token', type: 'password', placeholder: 'THQVJ...' },
      { key: 'THREADS_USER_ID', label: 'Threads User ID', type: 'string', placeholder: '2591827364519283' },
    ],
    triggers: [
      { id: 'trigger.threads.reply', title: 'On New Reply to Thread', desc: '[T/W] Nhận sự kiện Webhook khi có người bình luận/trả lời bài đăng Threads của bạn', type: 'trigger.socialMedia', resource: 'Reply', eventValue: 'threads_reply', mechanism: 'W', status: 'API_ADAPTER' },
      { id: 'trigger.threads.mention', title: 'On New Mention (@username)', desc: '[T/W] Nhận sự kiện khi tài khoản Threads của bạn được nhắc tên (@mention)', type: 'trigger.socialMedia', resource: 'Mention', eventValue: 'threads_mention', mechanism: 'W', status: 'API_ADAPTER' },
      { id: 'trigger.threads.new_post', title: 'On New Thread Published', desc: '[T/P] Định kỳ kiểm tra bài đăng mới trên trang cá nhân Threads', type: 'trigger.socialMedia', resource: 'Thread', eventValue: 'threads_poll', mechanism: 'P', status: 'API_ADAPTER' },
    ],
    actions: [
      { id: 'vince.threads.publish_text', title: 'Thread: Publish Text Post', desc: 'Đăng bài viết văn bản (tối đa 500 ký tự, đính kèm link preview) lên Threads', type: 'vince.threads.action', resource: 'Thread', operation: 'Publish Text', status: 'API_ADAPTER', defaultParams: { resource: 'Thread', operation: 'publishText', mediaType: 'TEXT' } },
      { id: 'vince.threads.publish_media', title: 'Thread: Publish Image / Video Post', desc: 'Tạo container và xuất bản bài đăng kèm hình ảnh hoặc video lên Threads', type: 'vince.threads.action', resource: 'Thread', operation: 'Publish Media', status: 'API_ADAPTER', defaultParams: { resource: 'Thread', operation: 'publishMedia', mediaType: 'IMAGE' } },
      { id: 'vince.threads.publish_carousel', title: 'Thread: Publish Carousel Post (Up to 20 Items)', desc: 'Đăng chuỗi nhiều ảnh và video trong cùng một bài đăng Threads Carousel', type: 'vince.threads.action', resource: 'Thread', operation: 'Publish Carousel', status: 'API_ADAPTER', defaultParams: { resource: 'Thread', operation: 'publishCarousel', mediaType: 'CAROUSEL' } },
      { id: 'vince.threads.reply', title: 'Reply: Create Reply to Thread (Threadstorm)', desc: 'Trả lời bình luận của người dùng hoặc tạo chuỗi bài viết nối tiếp (Threadstorm)', type: 'vince.threads.action', resource: 'Reply', operation: 'Create Reply', status: 'API_ADAPTER', defaultParams: { resource: 'Reply', operation: 'createReply' } },
      { id: 'vince.threads.get_replies', title: 'Reply: Get Conversation & Replies', desc: 'Lấy danh sách phản hồi và cây hội thoại dưới một bài đăng Threads', type: 'vince.threads.action', resource: 'Reply', operation: 'Get Replies', status: 'API_ADAPTER', defaultParams: { resource: 'Reply', operation: 'getReplies' } },
      { id: 'vince.threads.manage_reply', title: 'Reply: Hide / Unhide Reply', desc: 'Ẩn hoặc hiện các bình luận spam trên bài đăng Threads', type: 'vince.threads.action', resource: 'Reply', operation: 'Hide Reply', status: 'API_ADAPTER', defaultParams: { resource: 'Reply', operation: 'hideReply', hide: true } },
      { id: 'vince.threads.insights', title: 'Insights: Get Thread & Account Metrics', desc: 'Lấy chỉ số Views, Likes, Replies, Reposts, Quotes và Follower Demographics', type: 'vince.threads.action', resource: 'Insights', operation: 'Get Insights', status: 'API_ADAPTER', defaultParams: { resource: 'Insights', operation: 'getInsights', metrics: 'views,likes,replies,reposts,quotes' } },
      { id: 'vince.threads.profile', title: 'Profile: Get User Profile & Threads List', desc: 'Lấy thông tin hồ sơ Threads và danh sách các bài đã đăng', type: 'vince.threads.action', resource: 'Profile', operation: 'Get Profile', status: 'API_ADAPTER', defaultParams: { resource: 'Profile', operation: 'getProfile' } },
    ],
    additionalFields: [
      { key: 'replyControl', label: 'Who Can Reply', type: 'options', default: 'everyone', options: [{ name: 'Everyone', value: 'everyone' }, { name: 'Accounts You Follow', value: 'accounts_you_follow' }, { name: 'Mentioned Only', value: 'mentioned_only' }] },
      { key: 'linkAttachment', label: 'Link Attachment URL', type: 'string', placeholder: 'https://vinceauto.vn' },
    ],
    sampleOutput: {
      id: '18029384756192837',
      permalink: 'https://www.threads.net/@vinceauto.vn/post/DB9xYz123',
      media_type: 'TEXT_POST',
      text: 'Tự động hóa quy trình đa kênh cùng AI Agent Opencode2 trên VinceAuto! 🚀',
      timestamp: '2026-11-09T03:05:00+0000',
    },
  },

  instagram: {
    id: 'instagram',
    name: 'Instagram Business (Reels, Stories, Feed & DM)',
    desc: 'Đăng Reels, Story, Ảnh Carousel, Trả lời Comment & Gửi tin nhắn Private Reply DM tự động',
    iconKey: 'instagram',
    categoryGroup: 'communication',
    status: 'NATIVE',
    credentialKey: 'IG_ACCESS_TOKEN',
    credentialTitle: 'Instagram Graph & Messaging account',
    notice: 'Yêu cầu tài khoản Instagram Professional (Business / Creator) kết nối với Facebook Page.',
    architecture: {
      authType: 'OAuth2 Meta Graph API (instagram_basic, instagram_content_publish, instagram_manage_comments, instagram_manage_messages)',
      apiCapabilities: 'Publish Reels, Stories, Single Photo & Carousel, Comment Moderation, Automated Private Reply via Instagram DM, Media Insights',
      rateLimits: '50 API-published posts / 24h; 200 calls / hour / user',
      permissions: 'instagram_basic, instagram_content_publish, instagram_manage_comments, instagram_manage_messages, instagram_manage_insights',
      errorHandling: 'Kiểm tra trạng thái container (FINISHED) trước khi gọi media_publish',
    },
    fields: [
      { key: 'IG_ACCESS_TOKEN', label: 'Instagram Graph Access Token', type: 'password', placeholder: 'EAAB...' },
      { key: 'IG_BUSINESS_ID', label: 'Instagram Business Account ID', type: 'string', placeholder: '17841400000000000' },
    ],
    triggers: [
      { id: 'trigger.instagram.comment', title: 'On New Comment on Post / Reel', desc: '[T/W] Nhận sự kiện ngay khi khách hàng bình luận vào bài viết hoặc Reels Instagram', type: 'trigger.socialMedia', resource: 'Comment', eventValue: 'ig_comment', mechanism: 'W', status: 'NATIVE' },
      { id: 'trigger.instagram.dm', title: 'On Incoming Instagram Direct Message (DM)', desc: '[T/W] Nhận tin nhắn mới từ khách hàng trong hộp thư Instagram Direct', type: 'trigger.socialMedia', resource: 'Message', eventValue: 'ig_messages', mechanism: 'W', status: 'NATIVE' },
      { id: 'trigger.instagram.story_mention', title: 'On Story Mention (@mention)', desc: '[T/W] Khi người dùng gắn thẻ tài khoản của bạn trong Instagram Story', type: 'trigger.socialMedia', resource: 'Story', eventValue: 'ig_story_mention', mechanism: 'W', status: 'NATIVE' },
    ],
    actions: [
      { id: 'vince.instagram.publish_reel', title: 'Reels: Publish Instagram Reel Video', desc: 'Đăng video ngắn (Reels) lên Instagram kèm caption, cover và chia sẻ lên Feed', type: 'vince.instagram.action', resource: 'Reels', operation: 'Publish Reel', status: 'NATIVE', defaultParams: { resource: 'Reels', operation: 'publishReel', shareToFeed: true } },
      { id: 'vince.instagram.publish_photo', title: 'Feed: Publish Photo / Carousel Album', desc: 'Đăng ảnh đơn hoặc bộ ảnh trượt (Carousel tối đa 10 ảnh/video) lên Instagram', type: 'vince.instagram.action', resource: 'Media', operation: 'Publish Photo / Carousel', status: 'NATIVE', defaultParams: { resource: 'Media', operation: 'publishCarousel' } },
      { id: 'vince.instagram.publish_story', title: 'Story: Publish 24h Instagram Story', desc: 'Đăng hình ảnh hoặc video lên Instagram Story tự động', type: 'vince.instagram.action', resource: 'Story', operation: 'Publish Story', status: 'NATIVE', defaultParams: { resource: 'Story', operation: 'publishStory' } },
      { id: 'vince.instagram.reply_comment', title: 'Comment: Reply & Send Private DM (Chốt đơn tự động)', desc: 'Trả lời bình luận công khai và đồng thời gửi tin nhắn DM riêng chứa link sản phẩm', type: 'vince.instagram.action', resource: 'Comment', operation: 'Reply & Private DM', status: 'NATIVE', defaultParams: { resource: 'Comment', operation: 'replyAndPrivateDm' } },
      { id: 'vince.instagram.send_dm', title: 'Direct Message: Send Text / Media / Icebreaker', desc: 'Gửi tin nhắn tư vấn khách hàng qua Instagram Direct Messaging API', type: 'vince.instagram.action', resource: 'Message', operation: 'Send DM', status: 'NATIVE', defaultParams: { resource: 'Message', operation: 'sendDm' } },
      { id: 'vince.instagram.insights', title: 'Insights: Get Reel, Post & Profile Metrics', desc: 'Lấy số liệu Reach, Plays, Likes, Shares, Saved và Follower tăng trưởng', type: 'vince.instagram.action', resource: 'Insights', operation: 'Get Insights', status: 'NATIVE', defaultParams: { resource: 'Insights', operation: 'getInsights' } },
    ],
    additionalFields: [
      { key: 'shareToFeed', label: 'Share Reel to Main Feed', type: 'boolean', default: true },
    ],
    sampleOutput: {
      id: '17982736451928374',
      media_type: 'REELS',
      permalink: 'https://www.instagram.com/reel/DC1aBcDeFgH/',
    },
  },

  youtube: {
    id: 'youtube',
    name: 'YouTube & YouTube Shorts (Data API v3)',
    desc: 'Tải lên Video & Shorts, Cập nhật SEO/Thumbnail, Quản lý Playlist, Trả lời Bình luận & Tìm kiếm Xu hướng',
    iconKey: 'youtube',
    categoryGroup: 'communication',
    status: 'NATIVE',
    credentialKey: 'YOUTUBE_OAUTH_TOKEN',
    credentialTitle: 'YouTube Data API v3 OAuth2 account',
    notice: 'Sử dụng Google YouTube Data API v3 & YouTube Analytics API. Lưu ý hạn mức Quota (10.000 units/ngày mặc định).',
    fields: [
      { key: 'YOUTUBE_OAUTH_TOKEN', label: 'Google OAuth2 Access Token', type: 'password', placeholder: 'ya29.a0AfB_byC...' },
    ],
    triggers: [
      { id: 'trigger.youtube.new_video', title: 'On New Video Uploaded to Channel', desc: '[T/P] Phát hiện khi kênh YouTube có video hoặc Shorts mới xuất bản', type: 'trigger.socialMedia', resource: 'Video', eventValue: 'youtube_new_video', mechanism: 'P', status: 'NATIVE' },
      { id: 'trigger.youtube.new_comment', title: 'On New Comment on Video / Channel', desc: '[T/P] Phát hiện bình luận mới của người xem trên kênh YouTube', type: 'trigger.socialMedia', resource: 'Comment', eventValue: 'youtube_new_comment', mechanism: 'P', status: 'NATIVE' },
    ],
    actions: [
      { id: 'vince.youtube.upload_video', title: 'Video: Upload Video / YouTube Shorts', desc: 'Tải lên video dài hoặc YouTube Shorts (#Shorts) kèm tiêu đề, mô tả SEO, tags và lịch xuất bản', type: 'vince.youtube.action', resource: 'Video', operation: 'Upload Video / Shorts', status: 'NATIVE', defaultParams: { resource: 'Video', operation: 'uploadVideo', privacyStatus: 'public' } },
      { id: 'vince.youtube.manage_video', title: 'Video: Get / Update Metadata / Set Thumbnail / Delete', desc: 'Cập nhật tiêu đề, mô tả, ảnh thu nhỏ (Thumbnail) hoặc lấy thống kê lượt xem video', type: 'vince.youtube.action', resource: 'Video', operation: 'Get / Update / Delete', status: 'NATIVE', defaultParams: { resource: 'Video', operation: 'updateVideo' } },
      { id: 'vince.youtube.comment', title: 'Comment: Get Many / Reply / Moderate / Delete', desc: 'Lấy danh sách bình luận trên video và dùng AI tự động phản hồi người xem', type: 'vince.youtube.action', resource: 'Comment', operation: 'Get / Reply', status: 'NATIVE', defaultParams: { resource: 'Comment', operation: 'replyComment' } },
      { id: 'vince.youtube.playlist', title: 'Playlist & Playlist Item: Create / Add Video / Remove', desc: 'Tạo danh sách phát mới và tự động thêm video vào Playlist', type: 'vince.youtube.action', resource: 'Playlist', operation: 'Manage Playlist', status: 'NATIVE', defaultParams: { resource: 'Playlist', operation: 'addPlaylistItem' } },
      { id: 'vince.youtube.search', title: 'Search & Channel: Search Trending Videos / Get Channel Stats', desc: 'Tìm kiếm video theo từ khóa và lấy thống kê người đăng ký kênh', type: 'vince.youtube.action', resource: 'Search & Channel', operation: 'Search', status: 'NATIVE', defaultParams: { resource: 'Search', operation: 'searchVideos' } },
    ],
    additionalFields: [
      { key: 'privacyStatus', label: 'Privacy Status', type: 'options', default: 'public', options: [{ name: 'Public', value: 'public' }, { name: 'Unlisted', value: 'unlisted' }, { name: 'Private', value: 'private' }] },
    ],
    sampleOutput: {
      kind: 'youtube#video',
      id: 'dQw4w9WgXcQ',
      snippet: { title: 'Hướng dẫn tự động hóa với VinceAuto AI Agent #Shorts', channelTitle: 'VinceAuto Official' },
    },
  },

  whatsappSocial: {
    id: 'whatsappSocial',
    name: 'WhatsApp Cloud, X (Twitter), LinkedIn & Pinterest',
    desc: 'WhatsApp Business Cloud API, X (Twitter) API v2, LinkedIn Company/Profile Posts & Pinterest Pins',
    iconKey: 'whatsapp',
    categoryGroup: 'communication',
    status: 'NATIVE',
    credentialKey: 'SOCIAL_API_TOKEN',
    credentialTitle: 'WhatsApp / X / LinkedIn / Pinterest account',
    notice: 'Giới hạn (L): WhatsApp cần Business Account & Template được duyệt; X phụ thuộc gói API Tier; LinkedIn hỗ trợ đăng bài cá nhân & trang doanh nghiệp.',
    fields: [
      { key: 'SOCIAL_API_TOKEN', label: 'Bearer Access Token / API Key', type: 'password', placeholder: 'EAAB... / ya29...' },
    ],
    triggers: [
      { id: 'trigger.whatsapp.message', title: 'WhatsApp Trigger (Incoming Message & Status)', desc: '[T/W] Nhận tin nhắn đến và trạng thái gửi/đọc qua WhatsApp Business Webhook', type: 'trigger.appEvent', resource: 'WhatsApp', eventValue: 'Incoming Message', mechanism: 'W', status: 'NATIVE' },
      { id: 'trigger.x.mention', title: 'X (Twitter): On Brand Mention / Keyword Search', desc: '[T/P] Phát hiện bài đăng mới trên X nhắc đến thương hiệu hoặc từ khóa', type: 'trigger.socialMedia', resource: 'X', eventValue: 'x_mention', mechanism: 'P', status: 'API_ADAPTER' },
      { id: 'trigger.linkedin.lead', title: 'LinkedIn: On New Lead Gen Form Response', desc: '[T/W] Nhận thông tin khách hàng tiềm năng từ biểu mẫu quảng cáo LinkedIn', type: 'trigger.socialMedia', resource: 'LinkedIn', eventValue: 'linkedin_lead', mechanism: 'W', status: 'API_ADAPTER' },
    ],
    actions: [
      // WhatsApp Business Cloud
      { id: 'piece.whatsapp.message', title: 'WhatsApp Message: Send Text / Media / Template', desc: 'Gửi tin nhắn văn bản, tệp đa phương tiện hoặc mẫu Template đã duyệt', type: 'vince.whatsappSocial.action', resource: 'WhatsApp Message', operation: 'Send Text / Media / Template', status: 'NATIVE' },
      { id: 'piece.whatsapp.media', title: 'WhatsApp Media & Profile: Upload / Download / Get Phone', desc: 'Tải lên/xuống media và lấy thông tin Profile/Phone Number', type: 'vince.whatsappSocial.action', resource: 'WhatsApp Media', operation: 'Upload / Download / Get', status: 'NATIVE' },
      // X (Twitter)
      { id: 'piece.x.post', title: 'X (Twitter): Create / Delete / Search Post, Like & Repost', desc: 'Đăng bài Tweet/Thread, tìm kiếm, thả tim, đăng lại và tải ảnh/video lên X', type: 'vince.whatsappSocial.action', resource: 'X (Twitter)', operation: 'Manage Post / Like / Repost', status: 'NATIVE' },
      // LinkedIn
      { id: 'piece.linkedin.post', title: 'LinkedIn: Publish Profile / Organization Post & Article', desc: 'Đăng bài viết, hình ảnh, tài liệu PDF hoặc liên kết lên trang cá nhân & LinkedIn Company Page', type: 'vince.whatsappSocial.action', resource: 'LinkedIn', operation: 'Publish Post', status: 'NATIVE' },
      // Pinterest
      { id: 'piece.pinterest.pin', title: 'Pinterest: Create Pin / Manage Board', desc: 'Tạo Pin hình ảnh/video kèm liên kết sản phẩm lên bảng Pinterest', type: 'vince.whatsappSocial.action', resource: 'Pinterest', operation: 'Create Pin', status: 'API_ADAPTER' },
    ],
    additionalFields: [
      { key: 'phoneNumberId', label: 'WhatsApp Phone Number ID', type: 'string', placeholder: '1092837465123' },
    ],
    sampleOutput: {
      messaging_product: 'whatsapp',
      contacts: [{ input: '84909123456', wa_id: '84909123456' }],
      messages: [{ id: 'wamid.HBgLODQ5MDkxMjM0NTYVAgARGBI5' }],
    },
  },

  // ==========================================================================
  // PHẦN 3: E-COMMERCE, CRM & MARKETING (P1–P2)
  // ==========================================================================
  shopee: {
    id: 'shopee',
    name: 'Shopee, TikTok Shop & Lazada (VN E-Commerce)',
    desc: 'Adapter TMĐT Đông Nam Á: Sản phẩm, Tồn kho, Đơn hàng, Vận chuyển & Đổi trả hoàn tiền',
    iconKey: 'shopee',
    categoryGroup: 'ecommerce_crm',
    status: 'API_ADAPTER',
    credentialKey: 'SHOPEE_PARTNER_KEY',
    credentialTitle: 'Shopee / TikTok Shop / Lazada Open Platform',
    notice: 'Giới hạn quan trọng (L): Shopee, TikTok Shop và Lazada được triển khai bằng Adapter riêng của VinceAuto qua Open Platform chính thức (cần Partner ID, Shop ID và chữ ký HMAC-SHA256).',
    architecture: {
      authType: 'OAuth2 Shop Authorization + HMAC-SHA256 Request Signing',
      apiCapabilities: 'Shopee Open Platform v2, TikTok Shop Partner API, Lazada Open Platform',
      rateLimits: 'Theo hạn mức Partner App của từng sàn (tự động xếp hàng đợi & backoff)',
      permissions: 'Product, Order, Logistics, Return/Refund, Shop Information',
      errorHandling: 'Chuẩn hóa mã lỗi sàn TMĐT & tự động làm mới access_token trước khi hết hạn',
    },
    fields: [
      { key: 'SHOPEE_PARTNER_ID', label: 'Partner ID / App Key', type: 'string', placeholder: '100293' },
      { key: 'SHOPEE_PARTNER_KEY', label: 'Partner Secret Key', type: 'password', placeholder: 'shpk_...' },
      { key: 'SHOPEE_SHOP_ID', label: 'Shop ID', type: 'string', placeholder: '8930192' },
    ],
    triggers: [
      { id: 'trigger.shopee.order_status', title: 'Shopee: Order Status & Package Status Update', desc: '[T/W] Webhook đẩy sự kiện đơn hàng mới (READY_TO_SHIP), hủy đơn, cập nhật kiện hàng', type: 'trigger.ecommerce', resource: 'Shopee Order', eventValue: 'Order Status Update', mechanism: 'W', status: 'API_ADAPTER' },
      { id: 'trigger.tiktokshop.order', title: 'TikTok Shop: Order Status, Return & Fulfillment Events', desc: '[T/W] Webhook sự kiện đơn hàng mới, yêu cầu hoàn trả và giao vận TikTok Shop', type: 'trigger.ecommerce', resource: 'TikTok Shop', eventValue: 'TikTok Shop Order Event', mechanism: 'W', status: 'API_ADAPTER' },
    ],
    actions: [
      // Shopee
      { id: 'piece.ecommerceVn.shopee_product', title: 'Shopee Product & Variant: Get / Create / Update / Search', desc: 'Quản lý sản phẩm và phân loại hàng (Model/Variant) trên Shopee', type: 'piece.ecommerceVn.shopee_get_orders', resource: 'Shopee Product', operation: 'Get / Create / Update / Search', status: 'API_ADAPTER' },
      { id: 'piece.ecommerceVn.shopee_get_orders', title: 'Shopee Order: Get / Search / Get Detail', desc: 'Lấy danh sách đơn hàng và chi tiết từng đơn hàng (order_sn)', type: 'piece.ecommerceVn.shopee_get_orders', resource: 'Shopee Order', operation: 'Get / Search / Get Detail', status: 'API_ADAPTER' },
      { id: 'piece.ecommerceVn.shopee_logistics', title: 'Shopee Logistics: Get Shipping Parameter & Ship Order', desc: 'Lấy tham số vận chuyển và xác nhận chuẩn bị hàng (Arrange Shipment)', type: 'piece.ecommerceVn.shopee_get_orders', resource: 'Shopee Logistics', operation: 'Ship Order', status: 'API_ADAPTER' },
      { id: 'piece.ecommerceVn.shopee_inventory', title: 'Shopee Inventory & Shop: Get / Update Stock & Shop Info', desc: 'Đồng bộ tồn kho thời gian thực và lấy thông tin gian hàng', type: 'piece.ecommerceVn.shopee_get_orders', resource: 'Shopee Inventory', operation: 'Get / Update', status: 'API_ADAPTER' },
      // TikTok Shop
      { id: 'piece.ecommerceVn.tts_order', title: 'TikTok Shop: Product, Order Search/Detail, Fulfillment Ship & Return/Refund', desc: 'Quản lý đơn hàng, cập nhật mã vận đơn, tồn kho và xử lý hoàn tiền TikTok Shop', type: 'piece.ecommerceVn.shopee_get_orders', resource: 'TikTok Shop', operation: 'Manage Order / Fulfillment / Return', status: 'API_ADAPTER' },
      // Lazada
      { id: 'piece.ecommerceVn.lazada_order', title: 'Lazada: Product, Order, Inventory, Category, Shipment & Seller Info', desc: 'Quản lý sản phẩm, đơn hàng, tồn kho và vận chuyển trên Lazada Open Platform', type: 'piece.ecommerceVn.shopee_get_orders', resource: 'Lazada', operation: 'Manage Product / Order / Inventory', status: 'API_ADAPTER' },
    ],
    additionalFields: [
      { key: 'orderStatus', label: 'Order Status Filter', type: 'options', default: 'READY_TO_SHIP', options: [{ name: 'READY_TO_SHIP', value: 'READY_TO_SHIP' }, { name: 'PROCESSED', value: 'PROCESSED' }, { name: 'SHIPPED', value: 'SHIPPED' }, { name: 'COMPLETED', value: 'COMPLETED' }] },
    ],
    sampleOutput: {
      order_sn: '261109VNC88991',
      order_status: 'READY_TO_SHIP',
      buyer_username: 'nguyenvana_hn',
      total_amount: 459000,
      currency: 'VND',
    },
  },

  shopifyWoo: {
    id: 'shopifyWoo',
    name: 'Shopify & WooCommerce',
    desc: 'Quản lý cửa hàng quốc tế: Product, Variant, Order, Customer, Inventory, Fulfillment & Coupon',
    iconKey: 'shopify',
    categoryGroup: 'ecommerce_crm',
    status: 'NATIVE',
    credentialKey: 'SHOPIFY_ACCESS_TOKEN',
    credentialTitle: 'Shopify Admin API / WooCommerce REST account',
    fields: [
      { key: 'SHOPIFY_ACCESS_TOKEN', label: 'Admin API Access Token / Consumer Key', type: 'password', placeholder: 'shpat_...' },
      { key: 'SHOP_DOMAIN', label: 'Store Domain', type: 'string', placeholder: 'my-store.myshopify.com' },
    ],
    triggers: [
      { id: 'trigger.shopify.order', title: 'Shopify Trigger (Order Created / Updated / Deleted)', desc: '[T/W] Kích hoạt qua Shopify Webhook khi có đơn hàng mới, cập nhật hoặc xóa', type: 'trigger.ecommerce', resource: 'Shopify Order', eventValue: 'Order Created', mechanism: 'W', status: 'NATIVE' },
      { id: 'trigger.shopify.product_customer', title: 'Shopify Trigger (Product Created/Updated & Customer Created)', desc: '[T/W] Kích hoạt khi tạo/cập nhật sản phẩm hoặc có khách hàng mới trên Shopify', type: 'trigger.ecommerce', resource: 'Shopify Product', eventValue: 'Product / Customer Event', mechanism: 'W', status: 'NATIVE' },
      { id: 'trigger.woo.events', title: 'WooCommerce Trigger (Order Created/Updated, Product & Customer Created)', desc: '[T/W] Kích hoạt qua WooCommerce Webhook khi có đơn hàng, sản phẩm hoặc khách hàng mới', type: 'trigger.ecommerce', resource: 'WooCommerce', eventValue: 'WooCommerce Event', mechanism: 'W', status: 'NATIVE' },
    ],
    actions: [
      { id: 'piece.shopify.product', title: 'Shopify Product & Variant: Create / Get / Get Many / Update / Delete', desc: 'Quản lý sản phẩm và biến thể (Variant) trên Shopify', type: 'automation.http', resource: 'Shopify Product', operation: 'CRUD Product & Variant', status: 'NATIVE' },
      { id: 'piece.shopify.order', title: 'Shopify Order, Fulfillment & Inventory: Get / Get Many / Update / Create', desc: 'Quản lý đơn hàng, tạo vận đơn Fulfillment và cập nhật tồn kho Shopify', type: 'automation.http', resource: 'Shopify Order', operation: 'Manage Order & Fulfillment', status: 'NATIVE' },
      { id: 'piece.shopify.customer_discount', title: 'Shopify Customer, Collection & Discount: Create / Get / Update', desc: 'Quản lý hồ sơ khách hàng, bộ sưu tập và mã giảm giá', type: 'automation.http', resource: 'Shopify Customer', operation: 'Manage Customer & Discount', status: 'NATIVE' },
      { id: 'piece.woo.all', title: 'WooCommerce: Product, Order, Customer, Coupon, Category & Attribute (CRUD)', desc: 'Đầy đủ thao tác Create, Get, Get Many, Update, Delete cho cửa hàng WooCommerce', type: 'automation.http', resource: 'WooCommerce', operation: 'CRUD Store Resources', status: 'NATIVE' },
    ],
    additionalFields: [],
    sampleOutput: {
      id: 5891029384,
      order_number: 1042,
      financial_status: 'paid',
      total_price: '129.00',
      currency: 'USD',
    },
  },

  crmMarketing: {
    id: 'crmMarketing',
    name: 'CRM & Marketing (HubSpot, Salesforce, Pipedrive, Zoho, Mailchimp, Airtable)',
    desc: 'Quản lý khách hàng Contact, Lead, Deal, Ticket, Chiến dịch Email Marketing & Airtable Base',
    iconKey: 'crm',
    categoryGroup: 'ecommerce_crm',
    status: 'NATIVE',
    credentialKey: 'CRM_API_KEY',
    credentialTitle: 'CRM / Marketing OAuth2 or API Key',
    fields: [
      { key: 'CRM_API_KEY', label: 'Private App Token / OAuth2 Token', type: 'password', placeholder: 'pat-na1-...' },
    ],
    triggers: [
      { id: 'trigger.crm.hubspot', title: 'HubSpot Trigger (Contact, Company, Deal, Ticket Events)', desc: '[T/W] Kích hoạt khi có thay đổi Contact, Company, Deal hoặc Ticket trên HubSpot', type: 'trigger.appEvent', resource: 'HubSpot', eventValue: 'HubSpot CRM Event', mechanism: 'W', status: 'NATIVE' },
      { id: 'trigger.crm.salesforce', title: 'Salesforce Trigger (Lead, Opportunity, Account, Case)', desc: '[T/W] Kích hoạt theo sự kiện đối tượng trên Salesforce CRM', type: 'trigger.appEvent', resource: 'Salesforce', eventValue: 'Salesforce Object Event', mechanism: 'W', status: 'NATIVE' },
      { id: 'trigger.crm.pipedrive', title: 'Pipedrive Trigger (Deal, Person, Organization, Activity)', desc: '[T/W] Kích hoạt khi có Deal hoặc Contact mới trong Pipedrive', type: 'trigger.appEvent', resource: 'Pipedrive', eventValue: 'Pipedrive Event', mechanism: 'W', status: 'NATIVE' },
      { id: 'trigger.crm.mailchimp', title: 'Mailchimp Trigger (Subscriber, Campaign Events)', desc: '[T/W] Kích hoạt khi có người đăng ký mới hoặc mở chiến dịch Mailchimp', type: 'trigger.appEvent', resource: 'Mailchimp', eventValue: 'Mailchimp Event', mechanism: 'W', status: 'NATIVE' },
      { id: 'trigger.crm.airtable', title: 'Airtable & Typeform / Calendly Trigger', desc: '[T/P] Kích hoạt khi có bản ghi Airtable mới, nộp biểu mẫu Typeform/Jotform hoặc đặt lịch Calendly', type: 'trigger.database', resource: 'Airtable', eventValue: 'New Record / Submission', mechanism: 'P', status: 'NATIVE' },
    ],
    actions: [
      { id: 'piece.crm.hubspot', title: 'HubSpot: Contact, Company, Deal, Ticket, Engagement, Association, Owner', desc: 'Thực hiện Create, Get, Get Many, Update, Delete trên HubSpot CRM', type: 'automation.http', resource: 'HubSpot CRM', operation: 'CRUD Contact / Deal / Ticket', status: 'NATIVE' },
      { id: 'piece.crm.salesforce', title: 'Salesforce: Account, Contact, Lead, Opportunity, Case, Task & Custom Object', desc: 'Quản lý toàn diện đối tượng chuẩn và Custom Object trên Salesforce', type: 'automation.http', resource: 'Salesforce', operation: 'CRUD Salesforce Objects', status: 'NATIVE' },
      { id: 'piece.crm.pipedrive', title: 'Pipedrive: Person, Organization, Deal, Activity, Lead, Note, Product', desc: 'Quản lý phễu bán hàng và hoạt động CSKH trên Pipedrive', type: 'automation.http', resource: 'Pipedrive', operation: 'CRUD Pipedrive', status: 'NATIVE' },
      { id: 'piece.crm.zoho', title: 'Zoho CRM: Leads, Contacts, Accounts, Deals, Tasks, Notes', desc: 'Adapter đồng bộ hóa dữ liệu bán hàng trên Zoho CRM', type: 'automation.http', resource: 'Zoho CRM', operation: 'CRUD Zoho Modules', status: 'API_ADAPTER' },
      { id: 'piece.crm.mailchimp', title: 'Mailchimp & Brevo: Audience, Subscriber, Campaign, List & Tag', desc: 'Tạo chiến dịch email, quản lý danh sách người đăng ký và gắn Tag', type: 'automation.http', resource: 'Mailchimp', operation: 'Manage Subscriber & Campaign', status: 'NATIVE' },
      { id: 'piece.crm.airtable', title: 'Airtable, Zendesk & Intercom: Base/Record, Support Ticket & Conversation', desc: 'Thao tác bản ghi Airtable và quản lý Ticket hỗ trợ khách hàng Zendesk/Freshdesk/Intercom', type: 'automation.http', resource: 'Airtable & Support', operation: 'Manage Record & Ticket', status: 'NATIVE' },
    ],
    additionalFields: [],
    sampleOutput: {
      id: 'hs_contact_901283',
      properties: {
        firstname: 'Hương',
        lastname: 'Phạm',
        email: 'huong.pham@enterprise.vn',
        lifecyclestage: 'opportunity',
      },
    },
  },

  // ==========================================================================
  // PHẦN 4: DATABASE, DEVELOPER & INFRASTRUCTURE (P1)
  // ==========================================================================
  databases: {
    id: 'databases',
    name: 'Databases (PostgreSQL, Supabase, MySQL, MongoDB, Redis)',
    desc: 'Truy vấn SQL/NoSQL, Insert, Update, Select, Aggregation, Pub/Sub & Vector Store',
    iconKey: 'database',
    categoryGroup: 'database_dev',
    status: 'NATIVE',
    credentialKey: 'DATABASE_CONNECTION_URI',
    credentialTitle: 'Database Connection / Supabase API Key',
    notice: 'Lưu ý: Postgres Trigger kiểm tra theo cơ chế cấu hình (LISTEN/NOTIFY hoặc Polling watermark); MySQL không mặc định có Trigger native tương đương.',
    fields: [
      { key: 'DATABASE_CONNECTION_URI', label: 'Connection URI / Host', type: 'password', placeholder: 'postgresql://user:pass@localhost:5432/db' },
    ],
    triggers: [
      { id: 'trigger.db.postgres', title: 'Postgres Trigger (Insert / Update / Delete Event)', desc: '[T/P] Kích hoạt khi có dòng dữ liệu được thêm, sửa hoặc xóa trong bảng PostgreSQL', type: 'trigger.database', resource: 'PostgreSQL', eventValue: 'Row Changed', mechanism: 'P', status: 'NATIVE' },
      { id: 'trigger.db.redis', title: 'Redis Trigger & RabbitMQ / MQTT Queue Trigger', desc: '[T/W] Lắng nghe thông điệp từ kênh Redis Pub/Sub, hàng đợi RabbitMQ hoặc MQTT Topic', type: 'trigger.appEvent', resource: 'Redis / Queue', eventValue: 'Message Published', mechanism: 'W', status: 'NATIVE' },
    ],
    actions: [
      { id: 'piece.db.postgres', title: 'PostgreSQL: Execute SQL Query, Table/Row Insert, Update, Delete & Select', desc: 'Thực thi câu lệnh SQL tham số hóa và thao tác bảng dữ liệu PostgreSQL', type: 'automation.http', resource: 'PostgreSQL', operation: 'Execute Query / CRUD Row', status: 'NATIVE' },
      { id: 'piece.db.mysql', title: 'MySQL: Execute SQL Query, Table/Row Insert, Update, Delete & Select', desc: 'Thực thi câu lệnh SQL và thao tác bảng trên cơ sở dữ liệu MySQL / MariaDB', type: 'automation.http', resource: 'MySQL', operation: 'Execute Query / CRUD Row', status: 'NATIVE' },
      { id: 'piece.db.mongodb', title: 'MongoDB: Document Create/Find/Update/Delete, Collection & Aggregation', desc: 'Truy vấn tài liệu NoSQL và chạy đường ống tổng hợp (Aggregation Pipeline)', type: 'automation.http', resource: 'MongoDB', operation: 'Find / Aggregate / CRUD', status: 'NATIVE' },
      { id: 'piece.db.redis', title: 'Redis: Key Get/Set/Delete/TTL, Increment, List Push/Pop, Set & Hash', desc: 'Thao tác bộ nhớ đệm tốc độ cao trên Redis', type: 'automation.http', resource: 'Redis', operation: 'Key / List / Set / Hash', status: 'NATIVE' },
      { id: 'piece.db.supabase', title: 'Supabase: Table CRUD, Storage Upload/Download, Auth & Realtime', desc: 'Tích hợp toàn diện cơ sở dữ liệu, lưu trữ và xác thực Supabase', type: 'automation.http', resource: 'Supabase', operation: 'Table / Storage / Auth', status: 'API_ADAPTER' },
      { id: 'piece.db.vectors', title: 'Vector & Analytics DB: Qdrant, Pinecone, Weaviate, Chroma, BigQuery, Snowflake', desc: 'Lưu trữ và truy vấn Vector ngữ nghĩa cho AI RAG & Kho dữ liệu lớn', type: 'automation.http', resource: 'Vector & Data Warehouse', operation: 'Upsert / Search Vectors', status: 'NATIVE' },
    ],
    additionalFields: [],
    sampleOutput: {
      rowCount: 1,
      rows: [{ id: 101, status: 'active', updated_at: '2026-11-09T10:00:00Z' }],
    },
  },

  github: {
    id: 'github',
    name: 'GitHub & GitLab',
    desc: 'Repository, Issue, Pull/Merge Request, Release, File, Branch, CI/CD Workflow & Review',
    iconKey: 'github',
    categoryGroup: 'database_dev',
    status: 'NATIVE',
    credentialKey: 'GITHUB_TOKEN',
    credentialTitle: 'GitHub / GitLab Personal Access Token',
    fields: [
      { key: 'GITHUB_TOKEN', label: 'Personal Access Token', type: 'password', placeholder: 'ghp_...' },
      { key: 'GITHUB_OWNER', label: 'Default Repository Owner', type: 'string', placeholder: 'vinceauto' },
    ],
    triggers: [
      { id: 'trigger.git.push', title: 'GitHub Trigger: On Push', desc: '[T/W] Kích hoạt khi có commit mới được push lên nhánh repository', type: 'trigger.git', resource: 'Repository', eventValue: 'Push', mechanism: 'W', status: 'NATIVE', defaultParams: { events: 'push' } },
      { id: 'trigger.git.pull_request', title: 'GitHub Trigger: On Pull Request', desc: '[T/W] Kích hoạt khi PR được mở, cập nhật, đóng hoặc merge', type: 'trigger.git', resource: 'Pull Request', eventValue: 'Pull Request', mechanism: 'W', status: 'NATIVE', defaultParams: { events: 'pull_request' } },
      { id: 'trigger.git.issues', title: 'GitHub Trigger: On Issues & Issue Comment', desc: '[T/W] Kích hoạt khi có Issue mới hoặc bình luận mới trên Issue/PR', type: 'trigger.git', resource: 'Issue', eventValue: 'Issues', mechanism: 'W', status: 'NATIVE', defaultParams: { events: 'issues' } },
      { id: 'trigger.git.release_star', title: 'GitHub Trigger: On Release, Star, Fork & Workflow Run', desc: '[T/W] Kích hoạt khi phát hành bản mới, có người bấm Star/Fork hoặc chạy GitHub Actions', type: 'trigger.git', resource: 'Release & CI', eventValue: 'Release / Workflow', mechanism: 'W', status: 'NATIVE', defaultParams: { events: 'release' } },
      { id: 'trigger.gitlab.events', title: 'GitLab Trigger: Project Push, Issue, Merge Request & Pipeline Events', desc: '[T/W] Lắng nghe các sự kiện dự án từ GitLab Webhook', type: 'trigger.git', resource: 'GitLab', eventValue: 'GitLab Event', mechanism: 'W', status: 'NATIVE' },
    ],
    actions: [
      { id: 'piece.github.repo', title: 'Repository & Branch: Create / Get / Get Many', desc: 'Tạo kho mã nguồn, nhánh mới hoặc lấy thông tin repository', type: 'piece.github.create_issue', resource: 'Repository & Branch', operation: 'Create / Get / Get Many', status: 'NATIVE' },
      { id: 'piece.github.create_issue', title: 'Issue & Comment: Create / Get / Update / Lock & Create Comment', desc: 'Tạo, cập nhật, khóa Issue và đăng bình luận Markdown', type: 'piece.github.create_issue', resource: 'Issue', operation: 'Create / Get / Update / Lock', status: 'NATIVE' },
      { id: 'piece.github.create_pull_request', title: 'Pull Request & Review: Get / Create / Update / Merge & Submit Review', desc: 'Tạo Pull Request, gộp nhánh (Merge) và gửi đánh giá mã nguồn (Review)', type: 'piece.github.create_pull_request', resource: 'Pull Request & Review', operation: 'Create / Update / Merge / Review', status: 'NATIVE' },
      { id: 'piece.github.file_release', title: 'File, Release & Workflow: Get/Create/Update/Delete File, Create Release & Dispatch CI', desc: 'Đọc/ghi tệp trực tiếp trên repo, phát hành Release và kích hoạt GitHub Actions', type: 'piece.github.create_issue', resource: 'File, Release & Workflow', operation: 'Manage File / Release / Workflow', status: 'NATIVE' },
      { id: 'piece.gitlab.all', title: 'GitLab: Project, Issue, Merge Request, Pipeline, Commit, Branch & Release', desc: 'Thực hiện các thao tác quản lý mã nguồn và CI/CD Pipeline trên GitLab', type: 'piece.github.create_pull_request', resource: 'GitLab', operation: 'Manage GitLab Project & CI', status: 'NATIVE' },
    ],
    additionalFields: [
      { key: 'labels', label: 'Labels', type: 'string', placeholder: 'bug, priority:high' },
    ],
    sampleOutput: {
      action: 'opened',
      number: 42,
      repository: { full_name: 'vinceauto/workflow-engine' },
      issue: { title: 'Chuẩn hóa thư viện Integration VinceAuto', state: 'open' },
    },
  },

  cloudInfra: {
    id: 'cloudInfra',
    name: 'Cloudflare, Docker, AWS (S3/Lambda/SQS/SES) & DevOps',
    desc: 'Hạ tầng đám mây & DevOps: Cloudflare DNS/Workers/R2/KV/D1, Docker Container, AWS S3, SSH & FTP',
    iconKey: 'cloud',
    categoryGroup: 'database_dev',
    status: 'API_ADAPTER',
    credentialKey: 'CLOUD_API_TOKEN',
    credentialTitle: 'Cloudflare / AWS / Docker API Credentials',
    notice: 'Giới hạn (L): Chỉ cấp API Token với phạm vi (Scope) tối thiểu cần thiết cho từng Zone/Bucket, không dùng Global API Key toàn quyền.',
    fields: [
      { key: 'CLOUD_API_TOKEN', label: 'Scoped API Token / Secret Access Key', type: 'password', placeholder: 'cf_token_... / AKIA...' },
    ],
    triggers: [],
    actions: [
      // Cloudflare
      { id: 'piece.infra.cf_dns_zone', title: 'Cloudflare DNS, Zone & Cache: List / Create / Update / Delete DNS & Purge Cache', desc: 'Quản lý bản ghi tên miền DNS và xóa bộ nhớ đệm CDN trên Cloudflare', type: 'automation.http', resource: 'Cloudflare DNS & Cache', operation: 'CRUD DNS / Purge Cache', status: 'API_ADAPTER' },
      { id: 'piece.infra.cf_serverless', title: 'Cloudflare Workers, Pages, R2, KV & D1: Deploy, Object Storage & SQL Query', desc: 'Triển khai Workers/Pages, tải tệp lên R2, đọc/ghi KV và truy vấn cơ sở dữ liệu D1', type: 'automation.http', resource: 'Cloudflare Serverless', operation: 'Workers / R2 / KV / D1', status: 'API_ADAPTER' },
      // Docker
      { id: 'piece.infra.docker', title: 'Docker Adapter: Container (Create/Start/Stop/Restart/Remove), Image, Volume, Network & Logs', desc: 'Quản lý vòng đời Container và đọc log qua Docker Engine API', type: 'automation.http', resource: 'Docker Engine', operation: 'Manage Container / Image / Logs', status: 'API_ADAPTER' },
      // AWS & DevOps
      { id: 'piece.infra.aws', title: 'AWS: S3 (Bucket/Object), Lambda (Invoke), SNS, SQS & SES Email', desc: 'Tải tệp S3, gọi hàm serverless Lambda, đẩy hàng đợi SQS và gửi email SES', type: 'automation.http', resource: 'AWS Cloud', operation: 'S3 / Lambda / SQS / SES', status: 'NATIVE' },
      { id: 'piece.infra.ssh_ftp', title: 'SSH, FTP/SFTP, Vercel, Netlify & Jenkins CI/CD', desc: 'Thực thi lệnh từ xa qua SSH, truyền tệp SFTP và kích hoạt triển khai Vercel/Netlify/Jenkins', type: 'automation.http', resource: 'DevOps & SSH', operation: 'Execute SSH / Deploy', status: 'NATIVE' },
    ],
    additionalFields: [],
    sampleOutput: {
      success: true,
      zone: 'vinceauto.vn',
      record_type: 'A',
      proxied: true,
    },
  },

  // ==========================================================================
  // PHẦN 5: AI, FINANCE & PAYMENT (P1)
  // ==========================================================================
  aiProviders: {
    id: 'aiProviders',
    name: 'AI Providers (OpenAI, Google Gemini, Anthropic Claude, Ollama & 12+ LLMs)',
    desc: 'Text, Chat, Vision, Audio Whisper/TTS, Image Generation, Embeddings, Assistants & Tool Use',
    iconKey: 'ai',
    categoryGroup: 'ai_finance',
    status: 'NATIVE',
    credentialKey: 'OPENAI_API_KEY',
    credentialTitle: 'AI Provider API Key (OpenAI / Gemini / Claude)',
    notice: 'Không có Trigger chung cho mọi yêu cầu LLM; hãy kết hợp với Webhook Trigger, Chat Trigger hoặc App Trigger.',
    fields: [
      { key: 'OPENAI_API_KEY', label: 'API Key', type: 'password', placeholder: 'sk-... / AIzaSy...' },
    ],
    triggers: [],
    actions: [
      { id: 'ai.model.openai', title: 'OpenAI: Text (Chat/Generate), Image (Generate/Edit), Audio (Whisper/TTS), File, Assistant & Conversation', desc: 'Đầy đủ các nhóm thao tác chính thức của OpenAI API', type: 'ai.model.openai', resource: 'OpenAI', operation: 'Text / Image / Audio / Assistant', status: 'NATIVE' },
      { id: 'ai.model.gemini', title: 'Google Gemini: Generate Content, Text, Image/Audio/Video Multimodal Analysis & File API', desc: 'Xử lý đa phương thức văn bản, hình ảnh, âm thanh và video với Gemini 2.5 Pro/Flash', type: 'ai.model.gemini', resource: 'Google Gemini', operation: 'Generate Content / Multimodal', status: 'NATIVE' },
      { id: 'ai.model.anthropic', title: 'Anthropic Claude: Create Message, Text/Image Input, Tool Use, Files & Message Batches', desc: 'Suy luận chuyên sâu, lập trình và gọi công cụ (Tool Use) với Claude Sonnet/Opus', type: 'ai.model.anthropic', resource: 'Anthropic Claude', operation: 'Create Message / Tool Use / Batch', status: 'NATIVE' },
      { id: 'ai.model.ollama', title: 'Ollama Local AI: Model (List/Pull/Delete), Chat, Generate Text & Generate Embeddings', desc: 'Chạy mô hình AI cục bộ miễn phí không giới hạn token', type: 'ai.model.ollama', resource: 'Ollama', operation: 'Chat / Generate / Embeddings', status: 'NATIVE' },
      { id: 'ai.model.openrouter', title: 'Extended AI Adapters: OpenRouter, DeepSeek, Groq, Mistral, Cohere, HuggingFace, Vertex, Bedrock, xAI, MiniMax, Kimi', desc: 'Kết nối hơn 12 nhà cung cấp mô hình AI quốc tế qua bộ Adapter chuẩn hóa của VinceAuto', type: 'ai.model.openrouter', resource: 'Multi-Provider LLMs', operation: 'Chat / Reasoning / Rerank / Embeddings', status: 'API_ADAPTER' },
    ],
    additionalFields: [],
    sampleOutput: {
      model: 'gemini-2.5-pro',
      choices: [{ message: { role: 'assistant', content: 'Đã phân tích xong dữ liệu và lên kế hoạch hành động.' } }],
    },
  },

  momo: {
    id: 'momo',
    name: 'Thanh Toán Việt Nam (MoMo, VNPAY, ZaloPay, VietQR) & Quốc Tế (Stripe, PayPal, Wise, Paddle)',
    desc: 'Cổng thanh toán nội địa & quốc tế: Tạo QR thanh toán, Kiểm tra giao dịch, IPN Webhook, Subscription & Invoice',
    iconKey: 'momo',
    categoryGroup: 'ai_finance',
    status: 'API_ADAPTER',
    credentialKey: 'MOMO_SECRET_KEY',
    credentialTitle: 'Payment Gateway Credentials',
    notice: 'MoMo, VNPAY, ZaloPay và VietQR là các Adapter chuyên biệt do VinceAuto phát triển theo chuẩn HMAC-SHA256 / SHA512 của cổng thanh toán Việt Nam; Stripe, PayPal, Wise, Paddle tuân theo tài liệu node chính thức.',
    fields: [
      { key: 'MOMO_PARTNER_CODE', label: 'Partner Code / Terminal ID / Stripe Key', type: 'string', placeholder: 'MOMOBKUN20180529 / sk_live_...' },
      { key: 'MOMO_SECRET_KEY', label: 'Secret Key / Webhook Signing Secret', type: 'password', placeholder: 'at67qH6mk8w5Y1nAyMoYKMWACiEi2AcX' },
    ],
    triggers: [
      { id: 'trigger.payment.momo_ipn', title: 'MoMo / VNPAY / ZaloPay / VietQR IPN Webhook', desc: '[T/W] Nhận callback đối soát tức thì khi khách hàng thanh toán thành công', type: 'trigger.payment', resource: 'VN Payment', eventValue: 'IPN Payment Success', mechanism: 'W', status: 'API_ADAPTER', defaultParams: { gateway: 'momo' } },
      { id: 'trigger.payment.stripe', title: 'Stripe Trigger (Payment Intent, Invoice, Subscription Events)', desc: '[T/W] Lắng nghe sự kiện thanh toán, hóa đơn và gói đăng ký từ Stripe Webhook', type: 'trigger.payment', resource: 'Stripe', eventValue: 'Stripe Webhook Event', mechanism: 'W', status: 'NATIVE', defaultParams: { gateway: 'stripe' } },
      { id: 'trigger.payment.paypal', title: 'PayPal & Wise Trigger (Payment / Transfer Webhook)', desc: '[T/W] Nhận sự kiện thanh toán PayPal và chuyển khoản quốc tế Wise', type: 'trigger.payment', resource: 'PayPal / Wise', eventValue: 'Payment Webhook', mechanism: 'W', status: 'NATIVE', defaultParams: { gateway: 'paypal' } },
    ],
    actions: [
      // Thanh toán Việt Nam (API_ADAPTER)
      { id: 'piece.paymentVn.momo_create_payment', title: 'MoMo: Payment Request, Transaction Status & Refund', desc: 'Tạo yêu cầu thanh toán QR MoMo, kiểm tra trạng thái và hoàn tiền', type: 'piece.paymentVn.momo_create_payment', resource: 'MoMo', operation: 'Payment Request / Status', status: 'API_ADAPTER' },
      { id: 'piece.paymentVn.vnpay_create_payment_url', title: 'VNPAY: Payment Request URL, Return URL Verify & IPN Checksum', desc: 'Tạo URL thanh toán VNPAY và kiểm tra chữ ký bảo mật HMAC-SHA512', type: 'piece.paymentVn.vnpay_create_payment_url', resource: 'VNPAY', operation: 'Create URL / Verify IPN', status: 'API_ADAPTER' },
      { id: 'piece.paymentVn.zalopay_vietqr', title: 'ZaloPay & VietQR: Create Order, Query Order & Dynamic Napas247 QR', desc: 'Tạo đơn ZaloPay và sinh mã QR chuyển khoản ngân hàng tự động điền số tiền & nội dung', type: 'piece.paymentVn.vnpay_create_payment_url', resource: 'ZaloPay & VietQR', operation: 'Create Order / Generate VietQR', status: 'API_ADAPTER' },
      // Thanh toán Quốc tế (NATIVE)
      { id: 'piece.payment.stripe', title: 'Stripe: Customer, Payment Intent, Subscription, Invoice & Product (Create/Get/Update/Cancel)', desc: 'Quản lý khách hàng, thu tiền, gói thuê bao định kỳ và hóa đơn trên Stripe', type: 'automation.http', resource: 'Stripe', operation: 'Manage Customer / Intent / Subscription', status: 'NATIVE' },
      { id: 'piece.payment.paypal_wise_paddle', title: 'PayPal (Payment/Payout/Order), Wise (Transfer/Account) & Paddle (Coupon/Payment/Plan/Product/User)', desc: 'Thực hiện thu hộ, chi hộ quốc tế và quản lý gói phần mềm SaaS', type: 'automation.http', resource: 'PayPal, Wise & Paddle', operation: 'Payment / Payout / Subscription', status: 'NATIVE' },
    ],
    additionalFields: [
      { key: 'lang', label: 'Language', type: 'options', default: 'vi', options: [{ name: 'Tiếng Việt (vi)', value: 'vi' }, { name: 'English (en)', value: 'en' }] },
    ],
    sampleOutput: {
      partnerCode: 'MOMOBKUN20180529',
      orderId: 'ORD_20261109_889',
      amount: 1500000,
      resultCode: 0,
      message: 'Giao dịch thành công.',
    },
  },
};
