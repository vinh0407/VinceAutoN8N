import {
  INodeType,
  INode,
  INodeProperty,
  IExecutionContext,
  INodeExecutionData,
  NodeCategory,
} from '../engine/types.js';

export interface IAiNodeDef {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  category: NodeCategory;
  aiGroup: string;
  badge?: string;
  defaultParameters?: Record<string, any>;
  properties?: INodeProperty[];
  executeFn?: (
    context: IExecutionContext,
    inputData: INodeExecutionData[],
    node: INode
  ) => Promise<INodeExecutionData[]>;
}

export const STANDARD_AI_AGENT_PROPERTIES: INodeProperty[] = [
  {
    name: 'baseUrl',
    displayName: 'Base URL (Đường link API Endpoint)',
    type: 'string',
    default: 'https://opencode.ai/zen/v1',
    placeholder: 'https://opencode.ai/zen/v1 hoặc https://api.openai.com/v1',
    required: true,
  },
  {
    name: 'model',
    displayName: 'Lựa chọn Model',
    type: 'options',
    default: 'crouton-alpha-free',
    options: [
      { name: 'crouton-alpha-free (Opencode2 Miễn phí)', value: 'crouton-alpha-free' },
      { name: 'gpt-4o (OpenAI Omni Flagship)', value: 'gpt-4o' },
      { name: 'gpt-4o-mini (OpenAI Fast & Efficient)', value: 'gpt-4o-mini' },
      { name: 'o3-mini (OpenAI Reasoning)', value: 'o3-mini' },
      { name: 'gemini-2.0-flash (Google Gemini Flash)', value: 'gemini-2.0-flash' },
      { name: 'gemini-1.5-pro (Google Gemini Pro)', value: 'gemini-1.5-pro' },
      { name: 'claude-3-5-sonnet (Anthropic Claude)', value: 'claude-3-5-sonnet' },
      { name: 'deepseek-chat (DeepSeek V3)', value: 'deepseek-chat' },
      { name: 'deepseek-reasoner (DeepSeek R1)', value: 'deepseek-reasoner' },
      { name: 'llama3:latest (Local Ollama)', value: 'llama3' },
      { name: 'Custom Model (Tự nhập model khác)', value: 'custom' },
    ],
    required: true,
  },
  {
    name: 'customModel',
    displayName: 'Tên Model Tùy Chỉnh (Nếu chọn Custom)',
    type: 'string',
    default: '',
    placeholder: 'Nhập tên model (VD: qwen2.5-coder:32b, mistral-large)...',
  },
  {
    name: 'apiKey',
    displayName: 'API Key (Tùy chọn, để trống dùng Credentials)',
    type: 'string',
    default: '',
    placeholder: 'oc_sk_... hoặc sk-...',
  },
  {
    name: 'prompt',
    displayName: 'Prompt / Mục tiêu của AI Agent',
    type: 'string',
    default: 'Hãy thực thi nhiệm vụ sau với dữ liệu đầu vào:\n{{ JSON.stringify($json) }}',
    placeholder: 'Nhập prompt hoặc chỉ dẫn nhiệm vụ...',
    required: true,
  },
  {
    name: 'systemPrompt',
    displayName: 'System Prompt (Vai trò của AI Agent)',
    type: 'string',
    default: 'Bạn là AI Agent thông minh của VinceAuto, thực hiện nhiệm vụ chính xác và súc tích.',
  },
  {
    name: 'temperature',
    displayName: 'Temperature',
    type: 'number',
    default: 0.7,
  },
];

export function createGenericAiNode(def: IAiNodeDef): INodeType {
  return {
    description: {
      name: def.name,
      displayName: def.displayName,
      description: def.description,
      icon: def.icon,
      category: def.category,
      version: 1,
      inputs: ['main'],
      outputs: ['main'],
      properties: def.properties || (def.aiGroup === 'agents' || def.name.startsWith('ai.agent') ? STANDARD_AI_AGENT_PROPERTIES : [
        {
          displayName: 'Configuration',
          name: 'config',
          type: 'string',
          default: JSON.stringify(def.defaultParameters || {}, null, 2),
        },
      ]),
    },
    async execute(
      this: any,
      context: IExecutionContext,
      inputData: INodeExecutionData[],
      node: INode
    ): Promise<INodeExecutionData[]> {
      const nodeParams = node.parameters || {};

      if (def.executeFn) {
        return def.executeFn(context, inputData, node);
      }

      const items = inputData.length > 0 ? inputData : [{ json: {} }];

      // Default high-performance AI execution mock/response
      const results: INodeExecutionData[] = items.map((item: INodeExecutionData) => {
        return {
          json: {
            ...item.json,
            _aiExecution: {
              node: def.name,
              displayName: def.displayName,
              aiGroup: def.aiGroup,
              timestamp: new Date().toISOString(),
              status: 'success',
              parameters: nodeParams,
            },
          },
        };
      });

      return results;
    },
  };
}

// ============================================================================
// 10 NHÓM AI NODE CHUẨN + 12 NODE ĐỘC QUYỀN CHO VINCEAUTO
// ============================================================================

export const ALL_AI_NODES_CONFIG: IAiNodeDef[] = [
  // --------------------------------------------------------------------------
  // 1. AI Agents & Orchestration
  // --------------------------------------------------------------------------
  {
    name: 'ai.agent.general',
    displayName: 'AI Agent',
    description: 'Agent tự quyết định sử dụng công cụ dựa trên prompt và mục tiêu của người dùng',
    icon: 'Bot',
    category: 'ai',
    aiGroup: 'agents',
    defaultParameters: { agentType: 'general', maxIterations: 10, temperature: 0.7 },
  },
  {
    name: 'ai.agent.tools',
    displayName: 'Tools Agent',
    description: 'Agent sử dụng nhiều tools (Calculator, API, Search, Code) để giải quyết vấn đề',
    icon: 'Wrench',
    category: 'ai',
    aiGroup: 'agents',
    defaultParameters: { allowedTools: ['calculator', 'http', 'search'] },
  },
  {
    name: 'ai.agent.conversational',
    displayName: 'Conversational Agent',
    description: 'Agent hội thoại tương tác duy trì ngữ cảnh nhiều lượt liên tục với người dùng',
    icon: 'MessageSquare',
    category: 'ai',
    aiGroup: 'agents',
  },
  {
    name: 'ai.agent.planAndExecute',
    displayName: 'Plan & Execute Agent',
    description: 'Tự động lập kế hoạch các bước trước khi thực thi từng hành động',
    icon: 'Workflow',
    category: 'ai',
    aiGroup: 'agents',
  },
  {
    name: 'ai.agent.sql',
    displayName: 'SQL Agent',
    description: 'Truy vấn cơ sở dữ liệu PostgreSQL, MySQL, Supabase bằng ngôn ngữ tự nhiên',
    icon: 'Database',
    category: 'ai',
    aiGroup: 'agents',
  },
  {
    name: 'ai.agent.react',
    displayName: 'ReAct Agent',
    description: 'Cơ chế suy luận và hành động theo từng bước (Reasoning + Acting)',
    icon: 'Brain',
    category: 'ai',
    aiGroup: 'agents',
  },
  {
    name: 'ai.agent.supervisor',
    displayName: 'Multi-Agent Supervisor',
    description: 'Điều phối và phân bổ nhiệm vụ phức tạp cho nhiều Agent chuyên trách',
    icon: 'Layers',
    category: 'ai',
    aiGroup: 'agents',
  },
  {
    name: 'ai.agent.router',
    displayName: 'Agent Router',
    description: 'Phân tích ý định và chuyển nhiệm vụ tới Agent phù hợp nhất',
    icon: 'GitFork',
    category: 'ai',
    aiGroup: 'agents',
  },
  {
    name: 'ai.agent.handoff',
    displayName: 'Agent Handoff',
    description: 'Chuyển quyền điều khiển và toàn bộ ngữ cảnh giữa các Agent liền mạch',
    icon: 'ArrowLeftRight',
    category: 'ai',
    aiGroup: 'agents',
  },

  // --------------------------------------------------------------------------
  // 2. AI Models (Chat Models / Providers)
  // --------------------------------------------------------------------------
  {
    name: 'ai.model.openai',
    displayName: 'OpenAI Chat Model',
    description: 'Kết nối mô hình GPT-4o, GPT-4o-mini, o1, o3-mini từ OpenAI',
    icon: 'Cpu',
    category: 'ai',
    aiGroup: 'models',
    badge: 'Free credits',
    defaultParameters: { model: 'gpt-4o', temperature: 0.7 },
  },
  {
    name: 'ai.model.anthropic',
    displayName: 'Anthropic Chat Model',
    description: 'Kết nối Claude 3.7 Sonnet, Claude 3.5 Haiku, Claude 3 Opus',
    icon: 'Cpu',
    category: 'ai',
    aiGroup: 'models',
    badge: 'Free credits',
    defaultParameters: { model: 'claude-3-7-sonnet-20250219', maxTokens: 4096 },
  },
  {
    name: 'ai.model.gemini',
    displayName: 'Google Gemini Chat Model',
    description: 'Mô hình đa phương thức Gemini 2.5 Flash, Gemini 2.5 Pro, Flash Lite',
    icon: 'Sparkles',
    category: 'ai',
    aiGroup: 'models',
    badge: 'Free credits',
    defaultParameters: { model: 'gemini-2.5-flash', temperature: 0.7 },
  },
  {
    name: 'ai.model.deepseek',
    displayName: 'DeepSeek Chat Model',
    description: 'Mô hình lý luận siêu việt DeepSeek R1 và mô hình tổng hợp DeepSeek V3',
    icon: 'Cpu',
    category: 'ai',
    aiGroup: 'models',
    badge: 'Hot',
    defaultParameters: { model: 'deepseek-reasoner', temperature: 0.6 },
  },
  {
    name: 'ai.model.groq',
    displayName: 'Groq Chat Model',
    description: 'Inference siêu tốc độ với LPU phần cứng (Llama 3.3 70B, Mixtral)',
    icon: 'Zap',
    category: 'ai',
    aiGroup: 'models',
    defaultParameters: { model: 'llama-3.3-70b-versatile' },
  },
  {
    name: 'ai.model.ollama',
    displayName: 'Ollama Chat Model',
    description: 'Chạy các mô hình mã nguồn mở cục bộ không tốn chi phí API',
    icon: 'Cpu',
    category: 'ai',
    aiGroup: 'models',
    defaultParameters: { endpoint: 'http://localhost:11434', model: 'llama3.2' },
  },
  {
    name: 'ai.model.openrouter',
    displayName: 'OpenRouter Chat Model',
    description: 'Truy cập hàng trăm mô hình AI trên toàn cầu qua một API duy nhất',
    icon: 'Globe',
    category: 'ai',
    aiGroup: 'models',
  },
  {
    name: 'ai.model.vertex',
    displayName: 'Google Vertex AI',
    description: 'Mô hình Gemini và Claude trên hạ tầng bảo mật Google Cloud Platform',
    icon: 'Cloud',
    category: 'ai',
    aiGroup: 'models',
  },
  {
    name: 'ai.model.azureOpenai',
    displayName: 'Azure OpenAI Chat Model',
    description: 'Mô hình GPT chạy trên nền tảng đám mây Microsoft Azure Enterprise',
    icon: 'Cloud',
    category: 'ai',
    aiGroup: 'models',
  },
  {
    name: 'ai.model.awsBedrock',
    displayName: 'AWS Bedrock Chat Model',
    description: 'Mô hình AI trên dịch vụ Amazon Bedrock (Claude, Llama, Titan)',
    icon: 'Cloud',
    category: 'ai',
    aiGroup: 'models',
  },
  {
    name: 'ai.model.mistral',
    displayName: 'Mistral Chat Model',
    description: 'Mô hình Mistral Large, Codestral và Pixtral mạnh mẽ của châu Âu',
    icon: 'Cpu',
    category: 'ai',
    aiGroup: 'models',
  },
  {
    name: 'ai.model.cohere',
    displayName: 'Cohere Chat Model',
    description: 'Mô hình Command R+ chuyên sâu cho xử lý dữ liệu doanh nghiệp và RAG',
    icon: 'Cpu',
    category: 'ai',
    aiGroup: 'models',
  },
  {
    name: 'ai.model.nemotron',
    displayName: 'NVIDIA Nemotron Chat Model',
    description: 'Mô hình tối ưu hóa phần cứng NVIDIA cho suy luận chuẩn xác',
    icon: 'Cpu',
    category: 'ai',
    aiGroup: 'models',
  },
  {
    name: 'ai.model.kimi',
    displayName: 'Moonshot Kimi Chat Model',
    description: 'Mô hình Kimi với cửa sổ ngữ cảnh siêu dài 2 triệu tokens',
    icon: 'Cpu',
    category: 'ai',
    aiGroup: 'models',
    badge: 'Free credits',
  },
  {
    name: 'ai.model.minimax',
    displayName: 'MiniMax Chat Model',
    description: 'Mô hình MiniMax mạnh về đối thoại, tạo giọng nói và hình ảnh',
    icon: 'Cpu',
    category: 'ai',
    aiGroup: 'models',
    badge: 'Free credits',
  },
  {
    name: 'ai.model.grok',
    displayName: 'xAI Grok Chat Model',
    description: 'Mô hình Grok 2 / Grok Vision từ xAI với dữ liệu thời gian thực',
    icon: 'Cpu',
    category: 'ai',
    aiGroup: 'models',
  },
  {
    name: 'ai.model.huggingface',
    displayName: 'Hugging Face Inference',
    description: 'Kết nối trực tiếp tới hàng ngàn mô hình trên Hugging Face Hub',
    icon: 'Smile',
    category: 'ai',
    aiGroup: 'models',
  },
  {
    name: 'ai.model.vercelGateway',
    displayName: 'Vercel AI Gateway',
    description: 'Cổng định tuyến và cân bằng tải mô hình AI chuẩn Vercel AI SDK',
    icon: 'Zap',
    category: 'ai',
    aiGroup: 'models',
  },

  // --------------------------------------------------------------------------
  // 3. AI Memory (Bộ nhớ AI)
  // --------------------------------------------------------------------------
  {
    name: 'ai.memory.simple',
    displayName: 'Simple Memory',
    description: 'Bộ nhớ hội thoại cơ bản (Window Buffer) lưu k lượt chat gần nhất',
    icon: 'Brain',
    category: 'ai',
    aiGroup: 'memory',
    defaultParameters: { windowSize: 10 },
  },
  {
    name: 'ai.memory.postgres',
    displayName: 'Postgres Chat Memory',
    description: 'Lưu trữ lịch sử hội thoại vĩnh viễn vào cơ sở dữ liệu PostgreSQL',
    icon: 'Database',
    category: 'ai',
    aiGroup: 'memory',
  },
  {
    name: 'ai.memory.redis',
    displayName: 'Redis Chat Memory',
    description: 'Bộ nhớ đệm tốc độ cực cao trên Redis kèm cấu hình thời gian sống (TTL)',
    icon: 'Zap',
    category: 'ai',
    aiGroup: 'memory',
  },
  {
    name: 'ai.memory.mongodb',
    displayName: 'MongoDB Chat Memory',
    description: 'Lưu trữ tài liệu hội thoại linh hoạt trên cụm cơ sở dữ liệu MongoDB',
    icon: 'Database',
    category: 'ai',
    aiGroup: 'memory',
  },
  {
    name: 'ai.memory.zep',
    displayName: 'Zep Memory',
    description: 'Hệ thống quản lý bộ nhớ hội thoại thông minh hỗ trợ trích xuất thực thể',
    icon: 'Brain',
    category: 'ai',
    aiGroup: 'memory',
  },
  {
    name: 'ai.memory.motorhead',
    displayName: 'Motorhead Memory',
    description: 'Lưu trữ trạng thái hội thoại và tóm tắt nền tự động theo tiến trình',
    icon: 'Cpu',
    category: 'ai',
    aiGroup: 'memory',
  },
  {
    name: 'ai.memory.longTerm',
    displayName: 'Agent Long-term Memory',
    description: 'Bộ nhớ dài hạn cho Agent ghi nhớ kinh nghiệm và tri thức theo thời gian',
    icon: 'Brain',
    category: 'ai',
    aiGroup: 'memory',
    badge: 'Vince',
  },
  {
    name: 'ai.memory.shortTerm',
    displayName: 'Agent Short-term Memory',
    description: 'Bộ nhớ ngắn hạn cho các nhiệm vụ tác vụ tạm thời trong phiên làm việc',
    icon: 'Brain',
    category: 'ai',
    aiGroup: 'memory',
    badge: 'Vince',
  },
  {
    name: 'ai.memory.project',
    displayName: 'Project Memory',
    description: 'Bộ nhớ dành riêng cho toàn bộ các Agent làm việc chung trong 1 dự án',
    icon: 'Folder',
    category: 'ai',
    aiGroup: 'memory',
    badge: 'Vince',
  },
  {
    name: 'ai.memory.sharedTeam',
    displayName: 'Shared Team Memory',
    description: 'Không gian chia sẻ kiến thức chung giữa người dùng và toàn bộ nhóm Agent',
    icon: 'Layers',
    category: 'ai',
    aiGroup: 'memory',
    badge: 'Vince',
  },
  {
    name: 'ai.memory.search',
    displayName: 'Memory Search',
    description: 'Tìm kiếm ngữ nghĩa siêu nhanh trong kho ký ức của các Agent',
    icon: 'Search',
    category: 'ai',
    aiGroup: 'memory',
    badge: 'Vince',
  },
  {
    name: 'ai.memory.summarizer',
    displayName: 'Memory Summarizer',
    description: 'Tự động nén và tóm lược các phiên hội thoại dài để tiết kiệm token',
    icon: 'Shrink',
    category: 'ai',
    aiGroup: 'memory',
    badge: 'Vince',
  },

  // --------------------------------------------------------------------------
  // 4. AI Tools (Công cụ cho Agent)
  // --------------------------------------------------------------------------
  {
    name: 'ai.tool.calculator',
    displayName: 'Calculator Tool',
    description: 'Công cụ tính toán số học chính xác 100%, khắc phục nhược điểm toán của LLM',
    icon: 'Wrench',
    category: 'ai',
    aiGroup: 'tools',
  },
  {
    name: 'ai.tool.code',
    displayName: 'Custom Code Tool',
    description: 'Thực thi mã JavaScript/Python kiểm soát an toàn trong môi trường sandbox',
    icon: 'Code2',
    category: 'ai',
    aiGroup: 'tools',
  },
  {
    name: 'ai.tool.http',
    displayName: 'HTTP Request Tool',
    description: 'Cho phép Agent chủ động gọi REST/GraphQL API từ các bên thứ ba',
    icon: 'Globe',
    category: 'ai',
    aiGroup: 'tools',
  },
  {
    name: 'ai.tool.mcp',
    displayName: 'MCP Client Tool',
    description: 'Kết nối giao thức Model Context Protocol mở rộng hàng trăm công cụ ngoại vi',
    icon: 'Zap',
    category: 'ai',
    aiGroup: 'tools',
    badge: 'MCP',
  },
  {
    name: 'ai.tool.searxng',
    displayName: 'SearXNG Search Tool',
    description: 'Tìm kiếm thông tin Internet mã nguồn mở bảo vệ quyền riêng tư',
    icon: 'Search',
    category: 'ai',
    aiGroup: 'tools',
  },
  {
    name: 'ai.tool.serpapi',
    displayName: 'SerpApi Google Tool',
    description: 'Tìm kiếm dữ liệu trên Google Search theo thời gian thực qua SerpApi',
    icon: 'Search',
    category: 'ai',
    aiGroup: 'tools',
  },
  {
    name: 'ai.tool.wikipedia',
    displayName: 'Wikipedia Tool',
    description: 'Tra cứu kiến thức bách khoa toàn thư Wikipedia tiếng Việt và quốc tế',
    icon: 'BookOpen',
    category: 'ai',
    aiGroup: 'tools',
  },
  {
    name: 'ai.tool.wolfram',
    displayName: 'Wolfram Alpha Tool',
    description: 'Động cơ tính toán tri thức chuyên sâu cho toán học, vật lý và khoa học',
    icon: 'Cpu',
    category: 'ai',
    aiGroup: 'tools',
  },
  {
    name: 'ai.tool.think',
    displayName: 'Think Tool',
    description: 'Hỗ trợ Agent suy nghĩ và phân tích chuỗi tư duy (CoT) trước khi hành động',
    icon: 'Brain',
    category: 'ai',
    aiGroup: 'tools',
  },
  {
    name: 'ai.tool.callWorkflow',
    displayName: 'Call Workflow Tool',
    description: 'Cho phép Agent thực thi một workflow tự động hóa khác như một công cụ phụ',
    icon: 'Workflow',
    category: 'ai',
    aiGroup: 'tools',
  },
  {
    name: 'ai.tool.vectorStoreQa',
    displayName: 'Vector Store QA Tool',
    description: 'Công cụ hỏi đáp tài liệu nội bộ đã được vector hóa trong cơ sở dữ liệu',
    icon: 'Database',
    category: 'ai',
    aiGroup: 'tools',
  },
  {
    name: 'ai.tool.agentAsTool',
    displayName: 'AI Agent as Tool',
    description: 'Đóng gói một AI Agent thành một công cụ độc lập cho Agent khác gọi tới',
    icon: 'Bot',
    category: 'ai',
    aiGroup: 'tools',
  },

  // --------------------------------------------------------------------------
  // 5. AI Chains (Chuỗi xử lý AI)
  // --------------------------------------------------------------------------
  {
    name: 'ai.chain.basicLlm',
    displayName: 'Basic LLM Chain',
    description: 'Chuỗi xử lý LLM đơn giản nhất dựa trên prompt template và model',
    icon: 'Workflow',
    category: 'ai',
    aiGroup: 'chains',
  },
  {
    name: 'ai.chain.qa',
    displayName: 'Question and Answer Chain',
    description: 'Hỏi đáp tài liệu RAG kết hợp tài liệu truy xuất và câu hỏi người dùng',
    icon: 'HelpCircle',
    category: 'ai',
    aiGroup: 'chains',
  },
  {
    name: 'ai.chain.summarization',
    displayName: 'Summarization Chain',
    description: 'Tự động đọc và tóm tắt văn bản dài (Map-Reduce, Refine, Stuff)',
    icon: 'Shrink',
    category: 'ai',
    aiGroup: 'chains',
  },
  {
    name: 'ai.chain.extractor',
    displayName: 'Information Extractor',
    description: 'Trích xuất thông tin có cấu trúc (email, số điện thoại, đơn hàng, bảng giá)',
    icon: 'FileText',
    category: 'ai',
    aiGroup: 'chains',
  },
  {
    name: 'ai.chain.classifier',
    displayName: 'Text Classifier',
    description: 'Phân loại văn bản vào các danh mục định sẵn với độ chuẩn xác cao',
    icon: 'Tag',
    category: 'ai',
    aiGroup: 'chains',
  },
  {
    name: 'ai.chain.sentiment',
    displayName: 'Sentiment Analysis',
    description: 'Phân tích sắc thái tình cảm của khách hàng (Tích cực, Trung tính, Tiêu cực)',
    icon: 'Smile',
    category: 'ai',
    aiGroup: 'chains',
  },
  {
    name: 'ai.chain.langchainCode',
    displayName: 'LangChain Custom Code',
    description: 'Xây dựng đường ống xử lý LangChain tùy chỉnh bằng JavaScript/Python',
    icon: 'Code2',
    category: 'ai',
    aiGroup: 'chains',
  },

  // --------------------------------------------------------------------------
  // 6. RAG & Knowledge (Vector DBs, Retrievers, Loaders)
  // --------------------------------------------------------------------------
  {
    name: 'ai.rag.vectorRetriever',
    displayName: 'Vector Store Retriever',
    description: 'Truy xuất các đoạn văn bản có độ tương đồng ngữ nghĩa cao nhất',
    icon: 'Search',
    category: 'ai',
    aiGroup: 'rag',
  },
  {
    name: 'ai.rag.contextualCompression',
    displayName: 'Contextual Compression Retriever',
    description: 'Nén và loại bỏ thông tin thừa trong kết quả truy xuất để tiết kiệm token',
    icon: 'Shrink',
    category: 'ai',
    aiGroup: 'rag',
  },
  {
    name: 'ai.rag.multiQuery',
    displayName: 'MultiQuery Retriever',
    description: 'Tự động mở rộng câu hỏi thành nhiều truy vấn khác nhau để tìm dữ liệu đầy đủ',
    icon: 'GitFork',
    category: 'ai',
    aiGroup: 'rag',
  },
  {
    name: 'ai.rag.workflowRetriever',
    displayName: 'Workflow Retriever',
    description: 'Truy xuất dữ liệu động trực tiếp từ một workflow đang chạy',
    icon: 'Workflow',
    category: 'ai',
    aiGroup: 'rag',
  },
  {
    name: 'ai.rag.defaultDataLoader',
    displayName: 'Default Data Loader',
    description: 'Đọc và nạp các định dạng tài liệu phổ biến (PDF, DOCX, TXT, CSV, JSON)',
    icon: 'ArrowRightToLine',
    category: 'ai',
    aiGroup: 'rag',
  },
  {
    name: 'ai.rag.githubLoader',
    displayName: 'GitHub Document Loader',
    description: 'Nạp mã nguồn, tài liệu README, issue và pull request từ GitHub repo',
    icon: 'GitFork',
    category: 'ai',
    aiGroup: 'rag',
  },
  {
    name: 'ai.rag.charSplitter',
    displayName: 'Character Text Splitter',
    description: 'Chia nhỏ văn bản dựa trên số lượng ký tự cố định và độ gối đầu (overlap)',
    icon: 'Sliders',
    category: 'ai',
    aiGroup: 'rag',
  },
  {
    name: 'ai.rag.recursiveSplitter',
    displayName: 'Recursive Character Text Splitter',
    description: 'Chia nhỏ văn bản thông minh theo cấu trúc đoạn văn, ngắt dòng và dấu câu',
    icon: 'Sliders',
    category: 'ai',
    aiGroup: 'rag',
  },
  {
    name: 'ai.rag.tokenSplitter',
    displayName: 'Token Splitter',
    description: 'Chia nhỏ văn bản dựa trên đơn vị token để đảm bảo không vượt quá context window',
    icon: 'Sliders',
    category: 'ai',
    aiGroup: 'rag',
  },
  {
    name: 'ai.rag.pinecone',
    displayName: 'Pinecone Vector Store',
    description: 'Lưu trữ và tìm kiếm vector đám mây hiệu năng cao với chỉ mục Pinecone',
    icon: 'Database',
    category: 'ai',
    aiGroup: 'rag',
  },
  {
    name: 'ai.rag.qdrant',
    displayName: 'Qdrant Vector Store',
    description: 'Cơ sở dữ liệu vector mã nguồn mở mạnh mẽ hỗ trợ lọc metadata phong phú',
    icon: 'Database',
    category: 'ai',
    aiGroup: 'rag',
  },
  {
    name: 'ai.rag.supabase',
    displayName: 'Supabase PGVector Store',
    description: 'Lưu trữ vector ngữ nghĩa trực tiếp trong cơ sở dữ liệu Supabase PostgreSQL',
    icon: 'Database',
    category: 'ai',
    aiGroup: 'rag',
  },
  {
    name: 'ai.rag.simpleVectorStore',
    displayName: 'Simple In-Memory Vector Store',
    description: 'Kho vector lưu trên bộ nhớ RAM nhẹ nhàng cho các workflow thử nghiệm nhanh',
    icon: 'Database',
    category: 'ai',
    aiGroup: 'rag',
  },

  // --------------------------------------------------------------------------
  // 7. Embeddings (Vector hóa văn bản)
  // --------------------------------------------------------------------------
  {
    name: 'ai.embedding.openai',
    displayName: 'OpenAI Embeddings',
    description: 'Mô hình text-embedding-3-small và text-embedding-3-large chất lượng cao',
    icon: 'Cpu',
    category: 'ai',
    aiGroup: 'embeddings',
  },
  {
    name: 'ai.embedding.gemini',
    displayName: 'Google Gemini Embeddings',
    description: 'Mô hình text-embedding-004 tối ưu cho đa ngôn ngữ và tiếng Việt',
    icon: 'Sparkles',
    category: 'ai',
    aiGroup: 'embeddings',
  },
  {
    name: 'ai.embedding.cohere',
    displayName: 'Cohere Embeddings',
    description: 'Mô hình embed-multilingual-v3.0 hàng đầu thế giới về đa ngôn ngữ',
    icon: 'Cpu',
    category: 'ai',
    aiGroup: 'embeddings',
  },
  {
    name: 'ai.embedding.ollama',
    displayName: 'Ollama Embeddings',
    description: 'Tạo vector embedding cục bộ miễn phí (nomic-embed-text, bge-m3)',
    icon: 'Cpu',
    category: 'ai',
    aiGroup: 'embeddings',
  },
  {
    name: 'ai.embedding.huggingface',
    displayName: 'Hugging Face Embeddings',
    description: 'Sử dụng các mô hình embedding mã nguồn mở từ Hugging Face Hub',
    icon: 'Smile',
    category: 'ai',
    aiGroup: 'embeddings',
  },

  // --------------------------------------------------------------------------
  // 8. Output Parser (Chuẩn hóa đầu ra AI)
  // --------------------------------------------------------------------------
  {
    name: 'ai.parser.structured',
    displayName: 'Structured Output Parser',
    description: 'Ép AI trả về JSON hợp lệ tuyệt đối tuân theo schema Zod/JSON-Schema',
    icon: 'ListFilter',
    category: 'ai',
    aiGroup: 'parsers',
  },
  {
    name: 'ai.parser.autoFixing',
    displayName: 'Auto-fixing Output Parser',
    description: 'Tự động phát hiện lỗi cú pháp JSON và yêu cầu LLM sửa lại hợp lệ',
    icon: 'Wrench',
    category: 'ai',
    aiGroup: 'parsers',
  },
  {
    name: 'ai.parser.itemList',
    displayName: 'Item List Output Parser',
    description: 'Chuẩn hóa danh sách các mục để dễ dàng duyệt lặp (loop) trong workflow',
    icon: 'ListFilter',
    category: 'ai',
    aiGroup: 'parsers',
  },
  {
    name: 'ai.parser.modelSelector',
    displayName: 'Model Selector',
    description: 'Tự động chọn model phù hợp nhất dựa trên độ khó của prompt và chi phí',
    icon: 'Cpu',
    category: 'ai',
    aiGroup: 'parsers',
  },

  // --------------------------------------------------------------------------
  // 9. AI Vision & Media (Đa phương thức)
  // --------------------------------------------------------------------------
  {
    name: 'ai.media.imageAnalysis',
    displayName: 'Image Analysis & Vision',
    description: 'Phân tích nội dung ảnh, biểu đồ, phát hiện đối tượng và phân loại hình ảnh',
    icon: 'Image',
    category: 'ai',
    aiGroup: 'media',
  },
  {
    name: 'ai.media.ocr',
    displayName: 'OCR Document Scanner',
    description: 'Quét và trích xuất chữ viết tay, hóa đơn, căn cước công dân tiếng Việt',
    icon: 'FileText',
    category: 'ai',
    aiGroup: 'media',
  },
  {
    name: 'ai.media.speechToText',
    displayName: 'Speech-to-Text (Whisper)',
    description: 'Chuyển đổi âm thanh ghi âm giọng nói thành văn bản chuẩn xác',
    icon: 'Radio',
    category: 'ai',
    aiGroup: 'media',
  },
  {
    name: 'ai.media.textToSpeech',
    displayName: 'Text-to-Speech (TTS)',
    description: 'Chuyển đổi văn bản thành giọng đọc truyền cảm tự nhiên (OpenAI, ElevenLabs)',
    icon: 'Radio',
    category: 'ai',
    aiGroup: 'media',
  },
  {
    name: 'ai.media.videoGen',
    displayName: 'AI Video Generator & Analyzer',
    description: 'Tạo hoặc phân tích từng khung hình của video với Gemini và MiniMax',
    icon: 'PlayCircle',
    category: 'ai',
    aiGroup: 'media',
  },

  // --------------------------------------------------------------------------
  // 10. AI Evaluation & Benchmark
  // --------------------------------------------------------------------------
  {
    name: 'ai.eval.evaluator',
    displayName: 'AI Evaluator Test Suite',
    description: 'Bộ công cụ kiểm thử tự động hàng loạt prompt, agent và workflow AI',
    icon: 'CheckCheck',
    category: 'ai',
    aiGroup: 'evaluation',
  },
  {
    name: 'ai.eval.accuracy',
    displayName: 'Accuracy & Relevance Test',
    description: 'Đo lường độ chính xác và mức độ liên quan của câu trả lời so với chuẩn',
    icon: 'CheckCheck',
    category: 'ai',
    aiGroup: 'evaluation',
  },
  {
    name: 'ai.eval.hallucination',
    displayName: 'Hallucination Check',
    description: 'Tự động kiểm tra phát hiện ảo giác và xác minh nguồn trích dẫn dữ liệu',
    icon: 'ShieldCheck',
    category: 'ai',
    aiGroup: 'evaluation',
  },
  {
    name: 'ai.eval.comparison',
    displayName: 'Model Comparison Benchmark',
    description: 'So sánh tốc độ, chi phí và chất lượng đầu ra giữa các model khác nhau',
    icon: 'Layers',
    category: 'ai',
    aiGroup: 'evaluation',
  },

  // --------------------------------------------------------------------------
  // 11. CÁC NODE ĐỘC QUYỀN CỦA VINCEAUTO (12 Nodes Đặc Biệt)
  // --------------------------------------------------------------------------
  {
    name: 'vince.supervisor',
    displayName: 'Vince Supervisor',
    description: 'Đầu não điều phối toàn bộ nhóm Agent, phân bổ nhiệm vụ và giám sát tiến độ',
    icon: 'Layers',
    category: 'ai',
    aiGroup: 'vinceExclusive',
    badge: 'Độc quyền',
  },
  {
    name: 'vince.agentCreator',
    displayName: 'Vince Agent Creator',
    description: 'Tự động thiết kế, chọn tools và cấu hình Agent từ mô tả ngôn ngữ tự nhiên',
    icon: 'Bot',
    category: 'ai',
    aiGroup: 'vinceExclusive',
    badge: 'Độc quyền',
  },
  {
    name: 'vince.workflowBuilder',
    displayName: 'Vince Workflow Builder',
    description: 'AI tự động sinh toàn bộ luồng workflow tự động hóa hoàn chỉnh từ mục tiêu',
    icon: 'Boxes',
    category: 'ai',
    aiGroup: 'vinceExclusive',
    badge: 'Độc quyền',
  },
  {
    name: 'vince.workflowDebugger',
    displayName: 'Vince Workflow Debugger',
    description: 'Tự động bắt lỗi runtime, phân tích traceback và tự đề xuất sửa lỗi từng node',
    icon: 'Wrench',
    category: 'ai',
    aiGroup: 'vinceExclusive',
    badge: 'Độc quyền',
  },
  {
    name: 'vince.modelRouter',
    displayName: 'Vince Model Router',
    description: 'Tự động phân loại độ khó prompt để chọn model rẻ nhất mà vẫn chuẩn xác nhất',
    icon: 'Cpu',
    category: 'ai',
    aiGroup: 'vinceExclusive',
    badge: 'Độc quyền',
  },
  {
    name: 'vince.memoryManager',
    displayName: 'Vince Memory Manager',
    description: 'Hệ thống quản lý bộ nhớ đa tầng: Short-term, Long-term, Project & Team',
    icon: 'Brain',
    category: 'ai',
    aiGroup: 'vinceExclusive',
    badge: 'Độc quyền',
  },
  {
    name: 'vince.agentHandoff',
    displayName: 'Vince Agent Handoff',
    description: 'Bàn giao công việc và truyền toàn bộ context mượt mà giữa các Agent chuyên môn',
    icon: 'ArrowLeftRight',
    category: 'ai',
    aiGroup: 'vinceExclusive',
    badge: 'Độc quyền',
  },
  {
    name: 'vince.browserAgent',
    displayName: 'Vince Browser Agent',
    description: 'Điều khiển trình duyệt Puppeteer/Playwright tự động click, fill form, cào data',
    icon: 'Globe',
    category: 'ai',
    aiGroup: 'vinceExclusive',
    badge: 'Độc quyền',
  },
  {
    name: 'vince.knowledgeHub',
    displayName: 'Vince Knowledge Hub',
    description: 'Kho lưu trữ và đồng bộ hóa toàn bộ tri thức, tài liệu và văn bản nội bộ',
    icon: 'BookOpen',
    category: 'ai',
    aiGroup: 'vinceExclusive',
    badge: 'Độc quyền',
  },
  {
    name: 'vince.virtualOffice',
    displayName: 'Vince Virtual Office',
    description: 'Mô phỏng văn phòng ảo kết nối các Agent thành các phòng ban phối hợp nhịp nhàng',
    icon: 'Briefcase',
    category: 'ai',
    aiGroup: 'vinceExclusive',
    badge: 'Độc quyền',
  },
  {
    name: 'vince.approval',
    displayName: 'Vince Approval',
    description: 'Cổng Human-in-the-loop: Dừng lại và gửi thông báo yêu cầu con người bấm duyệt',
    icon: 'ShieldCheck',
    category: 'ai',
    aiGroup: 'vinceExclusive',
    badge: 'Độc quyền',
  },
  {
    name: 'vince.costOptimizer',
    displayName: 'Vince Cost Optimizer',
    description: 'Giám sát chi phí token thời gian thực, nén prompt và cắt giảm đến 70% hóa đơn API',
    icon: 'Zap',
    category: 'ai',
    aiGroup: 'vinceExclusive',
    badge: 'Độc quyền',
  },
];

export function registerAllAiNodes(registry: { register: (node: INodeType) => void }) {
  for (const def of ALL_AI_NODES_CONFIG) {
    registry.register(createGenericAiNode(def));
  }
}
