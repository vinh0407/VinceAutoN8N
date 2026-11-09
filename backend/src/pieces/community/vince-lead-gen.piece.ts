import { createPiece, createAction } from '../framework.js';
import { SafeHttp } from '../../engine/safe-http.js';
import { globalAIRouter } from '../../ai/router.js';

export const vinceLeadGenPiece = createPiece({
  name: 'leadGen',
  displayName: 'VinceAuto Lead Generator',
  description: 'Trích xuất, làm giàu (enrichment) và chấm điểm (scoring) khách hàng tiềm năng bằng AI',
  icon: 'Bot',
  category: 'vince',
  actions: [
    createAction({
      name: 'enrichAndScore',
      displayName: 'Enrich & Score Lead với AI',
      description: 'Phân tích thông tin công ty, website và chấm điểm tiềm năng khách hàng',
      props: {
        companyDomain: {
          name: 'companyDomain',
          displayName: 'Domain Công Ty',
          type: 'string',
          placeholder: 'example.com',
          required: true,
        },
        targetRole: {
          name: 'targetRole',
          displayName: 'Chức Danh Mục Tiêu',
          type: 'string',
          default: 'CTO, Head of AI, Tech Lead',
        },
        criteria: {
          name: 'criteria',
          displayName: 'Tiêu Chí Chấm Điểm (BANT)',
          type: 'string',
          default: 'Đang có nhu cầu tự động hóa quy trình, quy mô trên 20 người',
        },
      },
      async run(context) {
        const { companyDomain, targetRole, criteria } = context.propsValue;

        context.log(`Bắt đầu phân tích Lead: ${companyDomain}`);

        const prompt = `Phân tích khách hàng tiềm năng:
- Công ty / Domain: ${companyDomain}
- Vai trò tìm kiếm: ${targetRole}
- Tiêu chí đánh giá: ${criteria}

Nhiệm vụ:
1. Đánh giá tiềm năng điểm Lead Score (từ 1 đến 100).
2. Tóm tắt giá trị VinceAuto có thể cung cấp cho công ty này.
3. Soạn thảo một thông điệp tiếp cận (cold outreach message) cá nhân hóa.

Trả về kết quả dưới dạng JSON:
{
  "companyDomain": "${companyDomain}",
  "leadScore": 85,
  "status": "QUALIFIED | REVIEW | DISQUALIFIED",
  "reasoning": "Lý do điểm số",
  "outreachDraft": "Nội dung email/tin nhắn tiếp cận"
}`;

        const aiResponse = await globalAIRouter.routeAndExecute([{ role: 'user', content: prompt }], 'fastest');

        let parsed: any;
        try {
          let clean = aiResponse.text.trim();
          if (clean.startsWith('```json')) clean = clean.replace(/^```json/, '').replace(/```$/, '').trim();
          parsed = JSON.parse(clean);
        } catch {
          parsed = { rawResponse: aiResponse.text };
        }

        return {
          leadData: parsed,
          analyzedAt: new Date().toISOString(),
          provider: aiResponse.provider,
        };
      },
    }),
  ],
});
