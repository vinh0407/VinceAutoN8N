import { Cron } from 'croner';
import { globalWorkflowStore } from '../storage/store.js';
import { WorkflowRunner } from '../engine/runner.js';
import { IWorkflow, INode, ITaskSchedule } from '../engine/types.js';
import { globalAIRouter } from '../ai/router.js';

export class CronSchedulerManager {
  private scheduledJobs: Map<string, Cron> = new Map();

  start() {
    this.refresh();
  }

  refresh() {
    // Stop all current cron jobs
    for (const job of this.scheduledJobs.values()) {
      job.stop();
    }
    this.scheduledJobs.clear();

    // 1. Register cron triggers from active workflows
    const workflows = globalWorkflowStore.getWorkflows();
    for (const wf of workflows) {
      if (!wf.active) continue;

      const cronNodes = wf.nodes.filter(
        (n) => n.type === 'trigger.cron' && !n.disabled
      );

      for (const node of cronNodes) {
        const expression = node.parameters?.cronExpression;
        if (!expression) continue;

        try {
          const job = new Cron(
            expression,
            { timezone: node.parameters?.timezone || 'Asia/Ho_Chi_Minh' },
            async () => {
              console.log(`[CronScheduler] Triggering workflow "${wf.name}" (${wf.id}) via node "${node.name}"`);
              try {
                const summary = await WorkflowRunner.execute(wf, {
                  executionMode: 'cron',
                  startNodeId: node.id,
                  credentials: globalWorkflowStore.getCredentials(),
                });
                globalWorkflowStore.addExecution(summary);
              } catch (err: any) {
                console.error(`[CronScheduler] Workflow execution failed:`, err.message);
              }
            }
          );

          this.scheduledJobs.set(`wf_${wf.id}_${node.id}`, job);
          console.log(`[CronScheduler] Registered workflow cron "${expression}" for: "${wf.name}"`);
        } catch (err: any) {
          console.error(`[CronScheduler] Invalid cron expression "${expression}" in workflow "${wf.name}": ${err.message}`);
        }
      }
    }

    // 2. Register recurring daily tasks (ITaskSchedule)
    const tasks = globalWorkflowStore.getTasks();
    for (const task of tasks) {
      if (!task.enabled) continue;

      const expression = task.cronExpression || (task.dailyTime ? `${parseInt(task.dailyTime.split(':')[1] || '0', 10)} ${parseInt(task.dailyTime.split(':')[0] || '8', 10)} * * *` : '0 8 * * *');

      try {
        const job = new Cron(
          expression,
          { timezone: task.timezone || 'Asia/Ho_Chi_Minh' },
          async () => {
            console.log(`[CronScheduler] Executing scheduled daily task: "${task.title}" (${task.id})`);
            await this.executeTask(task);
          }
        );

        // Calculate next run time
        const next = job.nextRun();
        if (next) {
          task.nextRunAt = next.toISOString();
        }

        this.scheduledJobs.set(`task_${task.id}`, job);
        console.log(`[CronScheduler] Registered recurring daily task: "${task.title}" at "${task.dailyTime || expression}"`);
      } catch (err: any) {
        console.error(`[CronScheduler] Failed to schedule task "${task.title}":`, err.message);
      }
    }
  }

  /**
   * Execute a task immediately (e.g. user clicked "Run Now" or triggered by schedule)
   */
  async executeTask(task: ITaskSchedule): Promise<{ success: boolean; result?: any; error?: string }> {
    const startTime = Date.now();
    task.lastStatus = 'running';
    task.lastRunAt = new Date().toISOString();
    globalWorkflowStore.saveTask(task);

    try {
      let runResult: any = null;

      // Mode A: Execute linked workflow
      if (task.workflowId) {
        const wf = globalWorkflowStore.getWorkflow(task.workflowId);
        if (wf) {
          const summary = await WorkflowRunner.execute(wf, {
            executionMode: 'cron',
            credentials: globalWorkflowStore.getCredentials(),
          });
          globalWorkflowStore.addExecution(summary);
          runResult = summary;
        }
      }

      // Mode B: Execute natural language AI Agent Prompt via Opencode2 (crouton-alpha-free)
      if (task.prompt) {
        const aiRes = await globalAIRouter.routeAndExecute(
          [
            {
              role: 'system',
              content:
                'Bạn là VinceAuto Task Automation Agent chạy trên model Opencode2 (crouton-alpha-free). Hãy thực thi tác vụ định kỳ sau và trả về báo cáo kết quả tóm tắt rõ ràng.',
            },
            { role: 'user', content: task.prompt },
          ],
          'auto',
          'opencode2'
        );
        runResult = aiRes.text;
      }

      task.lastStatus = 'success';
      task.runCount = (task.runCount || 0) + 1;
      task.updatedAt = new Date().toISOString();

      // Recalculate next run
      const job = this.scheduledJobs.get(`task_${task.id}`);
      if (job) {
        const next = job.nextRun();
        if (next) task.nextRunAt = next.toISOString();
      }

      globalWorkflowStore.saveTask(task);
      console.log(`[CronScheduler] Task "${task.title}" finished successfully in ${Date.now() - startTime}ms`);
      return { success: true, result: runResult };
    } catch (err: any) {
      task.lastStatus = 'error';
      task.updatedAt = new Date().toISOString();
      globalWorkflowStore.saveTask(task);
      console.error(`[CronScheduler] Task "${task.title}" failed:`, err.message);
      return { success: false, error: err.message };
    }
  }

  async runTaskNow(taskId: string) {
    const task = globalWorkflowStore.getTask(taskId);
    if (!task) throw new Error(`Task with id "${taskId}" not found.`);
    return this.executeTask(task);
  }

  stop() {
    for (const job of this.scheduledJobs.values()) {
      job.stop();
    }
    this.scheduledJobs.clear();
  }
}

export const globalCronScheduler = new CronSchedulerManager();
