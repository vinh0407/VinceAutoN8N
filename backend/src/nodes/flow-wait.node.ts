import { INodeType, IExecutionContext, INodeExecutionData, INode } from '../engine/types.js';
import { ExpressionEvaluator } from '../engine/expression.js';

export class FlowWaitNode implements INodeType {
  description = {
    name: 'flow.wait',
    displayName: 'Hẹn Giờ Đăng (Wait)',
    description: 'Chờ đến giờ hẹn đăng bài hoặc trì hoãn theo khoảng thời gian chỉ định trước khi tiếp tục.',
    icon: 'Clock',
    category: 'automation' as const,
    version: 1,
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        name: 'mode',
        displayName: 'Chế độ hẹn giờ',
        type: 'options' as const,
        default: 'specificTime',
        options: [
          { name: 'Chờ đến ngày/giờ cụ thể (Schedule Time)', value: 'specificTime' },
          { name: 'Trì hoãn theo số phút (Delay)', value: 'delay' },
        ],
      },
      {
        name: 'scheduleTime',
        displayName: 'Thời gian hẹn đăng (YYYY-MM-DD HH:mm hoặc ISO)',
        type: 'string' as const,
        default: '{{ $json.scheduleTime || "" }}',
        placeholder: '2026-11-16 20:00',
      },
      {
        name: 'delayMinutes',
        displayName: 'Số phút chờ (nếu chọn Delay)',
        type: 'number' as const,
        default: 0,
      },
    ],
  };

  async execute(
    context: IExecutionContext,
    inputData: INodeExecutionData[],
    node: INode
  ): Promise<INodeExecutionData[]> {
    const out: INodeExecutionData[] = [];

    for (let i = 0; i < inputData.length; i++) {
      const item = inputData[i];
      const mode = String(node.parameters?.mode || 'specificTime');
      const rawTimeExpr = node.parameters?.scheduleTime;
      const evaluatedTime = rawTimeExpr
        ? ExpressionEvaluator.evaluate(rawTimeExpr, item, context, i)
        : '';
      const rawTime = String(evaluatedTime || '').trim();
      const delayMinutes = Number(node.parameters?.delayMinutes || 0);

      let waitMs = 0;
      let scheduledPublishAt = new Date().toISOString();

      if (mode === 'specificTime' && rawTime) {
        const parsed = new Date(rawTime);
        if (!Number.isNaN(parsed.getTime())) {
          scheduledPublishAt = parsed.toISOString();
          waitMs = Math.max(0, parsed.getTime() - Date.now());
        }
      } else if (mode === 'delay' && Number.isFinite(delayMinutes) && delayMinutes > 0) {
        waitMs = delayMinutes * 60 * 1000;
        scheduledPublishAt = new Date(Date.now() + waitMs).toISOString();
      }

      const effectiveSleepMs = Math.min(waitMs, 30000);
      if (effectiveSleepMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, effectiveSleepMs));
      }

      out.push({
        json: {
          ...(item?.json || {}),
          scheduledPublishAt,
          waitRequestedMs: waitMs,
          waitStatus: waitMs > 30000 ? 'SCHEDULED_TIME_ATTACHED' : 'READY_TO_PUBLISH',
        },
        binary: item?.binary,
      });
    }

    return out;
  }
}
