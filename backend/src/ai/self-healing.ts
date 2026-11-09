import { INode, INodeExecutionData } from '../engine/types.js';
import { globalAIRouter } from './router.js';

export interface ISelfHealingSuggestion {
  nodeId: string;
  nodeName: string;
  issueDiagnosis: string;
  suggestedParameters: Record<string, any>;
  explanation: string;
  autoFixAvailable: boolean;
}

export class SelfHealingEngine {
  /**
   * Analyzes a failed node execution and generates fixes
   */
  static async diagnoseAndFix(
    node: INode,
    errorMessage: string,
    inputData: INodeExecutionData[],
    provider?: string
  ): Promise<ISelfHealingSuggestion> {
    const prompt = `Hệ thống tự động hóa VinceAuto gặp lỗi trong quá trình thực thi node:
- Node Name: "${node.name}"
- Node Type: "${node.type}"
- Node Parameters Hiện Tại: ${JSON.stringify(node.parameters, null, 2)}
- Dữ liệu Input nhận được: ${JSON.stringify(inputData.slice(0, 3), null, 2)}
- Chi tiết Lỗi (Error Message): "${errorMessage}"

Nhiệm vụ của bạn:
1. Chẩn đoán nguyên nhân cốt lõi gây ra lỗi.
2. Đề xuất bộ tham số sửa đổi (suggestedParameters) để node có thể chạy thành công.
3. Giải thích ngắn gọn cách khắc phục cho người dùng.

Trả về DUY NHẤT một đối tượng JSON:
{
  "issueDiagnosis": "Mô tả lỗi ngắn gọn",
  "suggestedParameters": { ...tham số sau khi sửa... },
  "explanation": "Lời khuyên và giải thích",
  "autoFixAvailable": true
}`;

    try {
      const response = await globalAIRouter.routeAndExecute(
        [{ role: 'user', content: prompt }],
        'auto',
        provider
      );

      let cleanJson = response.text.trim();
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '').trim();
      }

      const parsed = JSON.parse(cleanJson);
      return {
        nodeId: node.id,
        nodeName: node.name,
        issueDiagnosis: parsed.issueDiagnosis || errorMessage,
        suggestedParameters: parsed.suggestedParameters || node.parameters,
        explanation: parsed.explanation || 'Đã tối ưu tham số để xử lý lỗi.',
        autoFixAvailable: true,
      };
    } catch {
      return {
        nodeId: node.id,
        nodeName: node.name,
        issueDiagnosis: errorMessage,
        suggestedParameters: node.parameters,
        explanation: `Phát hiện lỗi runtime: ${errorMessage}. Vui lòng kiểm tra lại tham số kết nối hoặc định dạng dữ liệu đầu vào.`,
        autoFixAvailable: false,
      };
    }
  }
}
