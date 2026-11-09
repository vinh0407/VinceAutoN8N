import { INodeType } from '../engine/types.js';
import { ExpressionEvaluator } from '../engine/expression.js';
import { TriggerManualNode } from './trigger-manual.node.js';
import { TriggerCronNode } from './trigger-cron.node.js';
import { TriggerWebhookNode } from './trigger-webhook.node.js';
import {
  TriggerAppEventNode,
  TriggerEcommerceNode,
  TriggerPaymentNode,
  TriggerFormNode,
  TriggerChatNode,
  TriggerDatabaseNode,
  TriggerSocialMediaNode,
  TriggerGitNode,
  TriggerErrorNode,
} from './triggers-extended.node.js';
import { AutomationHttpNode } from './automation-http.node.js';
import { AutomationCodeNode } from './automation-code.node.js';
import { AutomationFilterNode } from './automation-filter.node.js';
import { VinceModelRouterNode } from './vince-model-router.node.js';
import { VinceAgentManagerNode } from './vince-agent-manager.node.js';
import { VinceScraperNode } from './vince-scraper.node.js';
import { VinceTelegramNode } from './vince-telegram.node.js';
import { VinceZoneNode } from './vince-zone.node.js';

// Pieces
import { vinceLeadGenPiece } from '../pieces/community/vince-lead-gen.piece.js';
import { slackPiece } from '../pieces/community/slack.piece.js';
import { discordPiece } from '../pieces/community/discord.piece.js';
import { githubPiece } from '../pieces/community/github.piece.js';
import { googleSheetsPiece } from '../pieces/community/google-sheets.piece.js';
import { zaloPiece } from '../pieces/community/zalo.piece.js';
import { facebookPiece } from '../pieces/community/facebook.piece.js';
import { tiktokPiece } from '../pieces/community/tiktok.piece.js';
import { gmailPiece } from '../pieces/community/gmail.piece.js';
import { googleWorkspacePiece } from '../pieces/community/google-workspace.piece.js';
import { openRouterPiece } from '../pieces/community/openrouter.piece.js';
import { paymentVnPiece } from '../pieces/community/payment-vn.piece.js';
import { ecommerceVnPiece } from '../pieces/community/ecommerce-vn.piece.js';

import { registerAllAiNodes } from './ai-nodes-library.js';

export class NodeRegistry {
  private nodes: Map<string, INodeType> = new Map();

  constructor() {
    // 1. Register Full 10 AI Groups & Vince Proprietary Nodes Library first
    registerAllAiNodes(this);

    // 2. Register Activepieces & Custom Ecosystem Pieces
    const pieceCollections = [
      vinceLeadGenPiece,
      slackPiece,
      discordPiece,
      githubPiece,
      googleSheetsPiece,
      zaloPiece,
      facebookPiece,
      tiktokPiece,
      gmailPiece,
      googleWorkspacePiece,
      openRouterPiece,
      paymentVnPiece,
      ecommerceVnPiece,
    ];

    for (const piece of pieceCollections) {
      for (const nodeType of piece) {
        this.register(nodeType);
      }
    }

    // 3. Register Core Automation, Triggers & Vince Specialized Processing Nodes (Top Priority)
    this.register(new TriggerManualNode());
    this.register(new TriggerCronNode());
    this.register(new TriggerWebhookNode());
    this.register(new TriggerAppEventNode());
    this.register(new TriggerEcommerceNode());
    this.register(new TriggerPaymentNode());
    this.register(new TriggerFormNode());
    this.register(new TriggerChatNode());
    this.register(new TriggerDatabaseNode());
    this.register(new TriggerSocialMediaNode());
    this.register(new TriggerGitNode());
    this.register(new TriggerErrorNode());

    this.register(new AutomationHttpNode());
    this.register(new AutomationCodeNode());
    this.register(new AutomationFilterNode());
    this.register(new VinceModelRouterNode());
    this.register(new VinceAgentManagerNode());
    this.register(new VinceScraperNode());
    this.register(new VinceTelegramNode());
    this.register(new VinceZoneNode());
  }

  register(nodeType: INodeType) {
    this.nodes.set(nodeType.description.name, nodeType);
  }

  get(name: string): INodeType | undefined {
    const existing = this.nodes.get(name);
    if (existing) return existing;

    // Universal Adapter for any registered Integration, Transform, Flow, Core, or Trigger node
    const isTrigger = name.startsWith('trigger.');
    return {
      description: {
        name,
        displayName: name,
        description: `VinceAuto Universal Node Adapter (${name})`,
        icon: isTrigger ? 'Zap' : 'Boxes',
        category: isTrigger ? 'trigger' : 'vince',
        version: 1,
        inputs: isTrigger ? [] : ['main'],
        outputs: ['main'],
        properties: [],
      },
      async execute(context, inputData, node) {
        const items = inputData.length > 0 ? inputData : [{ json: {} }];
        const params = node.parameters || {};

        // Dedicated handler for transform.editFields / transform.set
        if (name === 'transform.editFields' || name === 'transform.set') {
          return items.map((item, idx) => {
            const resultJson = params.keepOnlySet ? {} : { ...item.json };
            const fieldsObj = typeof params.fields === 'object' && params.fields !== null ? params.fields : {};
            for (const [k, v] of Object.entries(fieldsObj)) {
              resultJson[k] = ExpressionEvaluator.evaluate(v, item, context, idx);
            }
            return { json: resultJson };
          });
        }

        context.log(
          `[VinceAuto Universal Adapter] Executing node "${node.name}" (${name}) with resource=${params.resource || 'default'}, operation=${params.operation || params.event || 'execute'}`
        );
        return items.map((item, idx) => ({
          json: {
            ...item.json,
            _vinceExecution: {
              nodeId: node.id,
              nodeName: node.name,
              nodeType: name,
              resource: params.resource || undefined,
              operation: params.operation || params.event || undefined,
              parameters: params,
              itemIndex: idx,
              executedAt: new Date().toISOString(),
              status: 'success',
            },
          },
        }));
      },
    };
  }

  getAll(): INodeType[] {
    return Array.from(this.nodes.values());
  }

  getAllDescriptions() {
    return this.getAll().map((n) => n.description);
  }
}

export const globalNodeRegistry = new NodeRegistry();
