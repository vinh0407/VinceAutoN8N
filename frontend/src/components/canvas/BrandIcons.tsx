import React from 'react';

/**
 * Brand icons with original colors & glyphs for app nodes (n8n-style).
 * Each icon renders inside a 40x40 box; `size` controls px.
 */

type IconProps = { size?: number };
const S = ({ size = 36, children, viewBox = '0 0 48 48' }: { size?: number; children: React.ReactNode; viewBox?: string }) => (
  <svg width={size} height={size} viewBox={viewBox} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {children}
  </svg>
);

export const TelegramIcon = ({ size }: IconProps) => (
  <S size={size}>
    <circle cx="24" cy="24" r="22" fill="#229ED9" />
    <path
      fill="#fff"
      d="M10.9 23.4l20.6-8c.95-.35 1.8.23 1.49 1.67l-3.5 16.5c-.26 1.17-.96 1.46-1.94.9l-5.4-3.97-2.6 2.5c-.29.29-.53.53-1.09.53l.39-5.5 10-9.04c.44-.39-.1-.6-.67-.22l-12.37 7.79-5.33-1.66c-1.16-.37-1.18-1.16.24-1.72z"
    />
  </S>
);

export const GmailIcon = ({ size }: IconProps) => (
  <S size={size}>
    <path fill="#4285F4" d="M6 38h7V22L4 15v20a3 3 0 0 0 2 3z" />
    <path fill="#34A853" d="M35 38h7a3 3 0 0 0 2-3V15l-9 7z" />
    <path fill="#FBBC04" d="M35 12v10l9-7v-3c0-3.7-4.2-5.8-7.2-3.6z" />
    <path fill="#EA4335" d="M13 22V12l11 8.3L35 12v10l-11 8.3z" />
    <path fill="#C5221F" d="M4 12v3l9 7V12l-1.8-1.4C8.2 8.4 4 10.4 4 12z" />
  </S>
);

export const GoogleSheetsIcon = ({ size }: IconProps) => (
  <S size={size}>
    <path fill="#0F9D58" d="M29 4H12a3 3 0 0 0-3 3v34a3 3 0 0 0 3 3h24a3 3 0 0 0 3-3V14z" />
    <path fill="#87CEAC" d="M29 4v10h10z" />
    <path fill="#F1F1F1" d="M15 21v15h18V21zm2 2h6v3h-6zm8 0h6v3h-6zm-8 5h6v3h-6zm8 0h6v3h-6zm-8 5h6v1h-6zm8 0h6v1h-6z" />
  </S>
);

export const GoogleDriveIcon = ({ size }: IconProps) => (
  <S size={size}>
    <path fill="#0066DA" d="M8.6 39.6l2 3.4c.4.7 1 1.3 1.7 1.7l7-12.1H5.3c0 .8.2 1.5.6 2.2z" />
    <path fill="#00AC47" d="M24 17L17 4.9c-.7.4-1.3 1-1.7 1.7L5.9 22.4c-.4.7-.6 1.5-.6 2.2h14z" />
    <path fill="#EA4335" d="M35.7 44.7c.7-.4 1.3-1 1.7-1.7l.8-1.4 3.9-6.7c.4-.7.6-1.5.6-2.2H28.7l3 5.8z" />
    <path fill="#00832D" d="M24 17l7-12.1c-.7-.4-1.5-.6-2.3-.6H19.3c-.8 0-1.6.2-2.3.6z" />
    <path fill="#2684FC" d="M28.7 32.6H19.3l-7 12.1c.7.4 1.5.6 2.3.6h18.8c.8 0 1.6-.2 2.3-.6z" />
    <path fill="#FFBA00" d="M35.6 17.8l-6.5-11.2c-.4-.7-1-1.3-1.7-1.7L24 17l4.7 15.6h14c0-.8-.2-1.5-.6-2.2z" />
  </S>
);

export const SlackIcon = ({ size }: IconProps) => (
  <S size={size}>
    <path fill="#E01E5A" d="M14 29a4 4 0 1 1-4-4h4zm2 0a4 4 0 0 1 8 0v10a4 4 0 0 1-8 0z" />
    <path fill="#36C5F0" d="M20 14a4 4 0 1 1 4-4v4zm0 2a4 4 0 0 1 0 8H10a4 4 0 0 1 0-8z" />
    <path fill="#2EB67D" d="M34 20a4 4 0 1 1 4 4h-4zm-2 0a4 4 0 0 1-8 0V10a4 4 0 0 1 8 0z" />
    <path fill="#ECB22E" d="M28 34a4 4 0 1 1-4 4v-4zm0-2a4 4 0 0 1 0-8h10a4 4 0 0 1 0 8z" />
  </S>
);

export const DiscordIcon = ({ size }: IconProps) => (
  <S size={size}>
    <rect width="48" height="48" rx="12" fill="#5865F2" />
    <path
      fill="#fff"
      d="M34.6 15.3a24 24 0 0 0-6-1.9l-.8 1.6a22 22 0 0 0-7.6 0l-.8-1.6a24 24 0 0 0-6 1.9C9.6 21 8.6 26.6 9.1 32.1a24 24 0 0 0 7.4 3.7l1.6-2.6a15 15 0 0 1-2.5-1.2l.6-.5a17 17 0 0 0 15.6 0l.6.5c-.8.5-1.6.9-2.5 1.2l1.6 2.6a24 24 0 0 0 7.4-3.7c.6-6.4-1.1-12-4.3-16.8zM19.3 28.8c-1.5 0-2.7-1.4-2.7-3s1.2-3 2.7-3 2.7 1.4 2.7 3-1.2 3-2.7 3zm9.4 0c-1.5 0-2.7-1.4-2.7-3s1.2-3 2.7-3 2.7 1.4 2.7 3-1.2 3-2.7 3z"
    />
  </S>
);

export const FacebookIcon = ({ size }: IconProps) => (
  <S size={size}>
    <circle cx="24" cy="24" r="22" fill="#1877F2" />
    <path fill="#fff" d="M26.6 46V30.5h5.2l.8-6h-6v-3.8c0-1.7.5-2.9 3-2.9h3.2v-5.4a43 43 0 0 0-4.7-.2c-4.6 0-7.8 2.8-7.8 8v4.4h-5.2v6h5.2V46z" />
  </S>
);

export const InstagramIcon = ({ size }: IconProps) => (
  <S size={size}>
    <defs>
      <radialGradient id="igG" cx="30%" cy="107%" r="150%">
        <stop offset="0" stopColor="#fdf497" />
        <stop offset=".05" stopColor="#fdf497" />
        <stop offset=".45" stopColor="#fd5949" />
        <stop offset=".6" stopColor="#d6249f" />
        <stop offset=".9" stopColor="#285AEB" />
      </radialGradient>
    </defs>
    <rect width="44" height="44" x="2" y="2" rx="12" fill="url(#igG)" />
    <rect width="26" height="26" x="11" y="11" rx="8" fill="none" stroke="#fff" strokeWidth="3" />
    <circle cx="24" cy="24" r="6" fill="none" stroke="#fff" strokeWidth="3" />
    <circle cx="32.5" cy="15.5" r="1.8" fill="#fff" />
  </S>
);

export const YouTubeIcon = ({ size }: IconProps) => (
  <S size={size}>
    <rect x="2" y="9" width="44" height="30" rx="9" fill="#FF0000" />
    <path fill="#fff" d="M20 17v14l12-7z" />
  </S>
);

export const TikTokIcon = ({ size }: IconProps) => (
  <S size={size}>
    <rect width="48" height="48" rx="12" fill="#010101" />
    <path fill="#25F4EE" d="M21 20.5v-2a10 10 0 1 0 7 9.5V18.6a12 12 0 0 0 7 2.2v-4.4a7 7 0 0 1-7-6.9h-4.4V30a3.9 3.9 0 1 1-2.6-3.7v-4.5z" transform="translate(-1.2 -1)" />
    <path fill="#FE2C55" d="M21 20.5v-2a10 10 0 1 0 7 9.5V18.6a12 12 0 0 0 7 2.2v-4.4a7 7 0 0 1-7-6.9h-4.4V30a3.9 3.9 0 1 1-2.6-3.7v-4.5z" transform="translate(1.2 1)" />
    <path fill="#fff" d="M21 20.5v-2a10 10 0 1 0 7 9.5V18.6a12 12 0 0 0 7 2.2v-4.4a7 7 0 0 1-7-6.9h-4.4V30a3.9 3.9 0 1 1-2.6-3.7v-4.5z" />
  </S>
);

export const ThreadsIcon = ({ size }: IconProps) => (
  <S size={size}>
    <rect width="48" height="48" rx="12" fill="#000" />
    <text x="24" y="33" textAnchor="middle" fontSize="26" fontWeight="700" fill="#fff" fontFamily="Arial, sans-serif">@</text>
  </S>
);

export const ZaloIcon = ({ size }: IconProps) => (
  <S size={size}>
    <rect width="48" height="48" rx="12" fill="#0068FF" />
    <text x="24" y="29.5" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff" fontFamily="Arial, sans-serif">Zalo</text>
  </S>
);

export const NotionIcon = ({ size }: IconProps) => (
  <S size={size}>
    <rect x="5" y="4" width="38" height="40" rx="6" fill="#fff" stroke="#000" strokeWidth="2.5" />
    <path fill="#000" d="M15 13h5l9 14V13h4v22h-5l-9-14v14h-4z" />
  </S>
);

export const GitHubIcon = ({ size }: IconProps) => (
  <S size={size}>
    <circle cx="24" cy="24" r="22" fill="#fff" />
    <path
      fill="#181717"
      d="M24 4a20 20 0 0 0-6.3 39c1 .2 1.4-.4 1.4-1v-3.5c-5.6 1.2-6.8-2.7-6.8-2.7-.9-2.3-2.2-2.9-2.2-2.9-1.8-1.2.1-1.2.1-1.2 2 .1 3.1 2.1 3.1 2.1 1.8 3.1 4.7 2.2 5.8 1.7.2-1.3.7-2.2 1.3-2.7-4.4-.5-9.1-2.2-9.1-9.9 0-2.2.8-4 2.1-5.4-.2-.5-.9-2.6.2-5.3 0 0 1.7-.5 5.5 2.1a19 19 0 0 1 10 0c3.8-2.6 5.5-2.1 5.5-2.1 1.1 2.7.4 4.8.2 5.3 1.3 1.4 2.1 3.2 2.1 5.4 0 7.7-4.7 9.4-9.1 9.9.7.6 1.4 1.9 1.4 3.8V42c0 .6.4 1.2 1.4 1A20 20 0 0 0 24 4z"
    />
  </S>
);

export const ShopeeIcon = ({ size }: IconProps) => (
  <S size={size}>
    <rect width="48" height="48" rx="12" fill="#EE4D2D" />
    <path fill="#fff" d="M13 17h22l-1.6 20a3 3 0 0 1-3 2.8H17.6a3 3 0 0 1-3-2.8zm6-1a5 5 0 0 1 10 0h-2a3 3 0 0 0-6 0z" />
    <text x="24" y="34" textAnchor="middle" fontSize="13" fontWeight="800" fill="#EE4D2D" fontFamily="Arial, sans-serif">S</text>
  </S>
);

export const MomoIcon = ({ size }: IconProps) => (
  <S size={size}>
    <rect width="48" height="48" rx="12" fill="#A50064" />
    <text x="24" y="22" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff" fontFamily="Arial, sans-serif">mo</text>
    <text x="24" y="35" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff" fontFamily="Arial, sans-serif">mo</text>
  </S>
);

export const OpenAIIcon = ({ size }: IconProps) => (
  <S size={size}>
    <circle cx="24" cy="24" r="22" fill="#fff" />
    <g fill="none" stroke="#000" strokeWidth="2.6" strokeLinejoin="round">
      {[0, 60, 120, 180, 240, 300].map((r) => (
        <path key={r} d="M24 11.5c3.6 0 6.5 2.9 6.5 6.5v7.5L24 29.3 17.5 25.5" transform={`rotate(${r} 24 24)`} />
      ))}
    </g>
  </S>
);

export const GeminiIcon = ({ size }: IconProps) => (
  <S size={size}>
    <defs>
      <linearGradient id="gmG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#4285F4" />
        <stop offset=".5" stopColor="#9B72CB" />
        <stop offset="1" stopColor="#D96570" />
      </linearGradient>
    </defs>
    <path fill="url(#gmG)" d="M24 3c1.2 11 9 19.3 21 21-12 1.7-19.8 10-21 21-1.2-11-9-19.3-21-21 12-1.7 19.8-10 21-21z" />
  </S>
);

export const ClaudeIcon = ({ size }: IconProps) => (
  <S size={size}>
    <rect width="48" height="48" rx="12" fill="#D97757" />
    <g stroke="#fff" strokeWidth="3.2" strokeLinecap="round">
      {[0, 30, 60, 90, 120, 150].map((r) => (
        <line key={r} x1="24" y1="11" x2="24" y2="37" transform={`rotate(${r} 24 24)`} />
      ))}
    </g>
  </S>
);

export const DeepSeekIcon = ({ size }: IconProps) => (
  <S size={size}>
    <rect width="48" height="48" rx="12" fill="#4D6BFE" />
    <path fill="#fff" d="M38 16c-1 .5-2 .4-3 1.3-1.6-2.8-5-4.3-9-4.3-7.2 0-13 5-13 12 0 6.4 5 11 12 11 4.6 0 8-2 10-5.5-2.2 1.4-5 2-7.6 1.4C23 31 20 28 20.8 24c.8-3.6 4.6-5.5 8-4.5 2 .6 3.5 2 4 3.8 1.7-1.8 3.8-4 5.2-7.3z" />
    <circle cx="30" cy="20.5" r="1.4" fill="#4D6BFE" />
  </S>
);

export const OllamaIcon = ({ size }: IconProps) => (
  <S size={size}>
    <rect width="48" height="48" rx="12" fill="#fff" />
    <path fill="none" stroke="#000" strokeWidth="2.4" strokeLinecap="round" d="M16 40V24c0-5 3.6-9 8-9s8 4 8 9v16M18 15l-1.5-7M30 15l1.5-7" />
    <circle cx="20.5" cy="24" r="1.6" />
    <circle cx="27.5" cy="24" r="1.6" />
    <ellipse cx="24" cy="30" rx="3.5" ry="2.5" fill="none" stroke="#000" strokeWidth="2" />
  </S>
);

export const WebhookIcon = ({ size }: IconProps) => (
  <S size={size}>
    <rect width="48" height="48" rx="12" fill="#2b2b2e" />
    <g fill="none" strokeWidth="3.2" strokeLinecap="round">
      <path stroke="#C73A63" d="M21 16a6 6 0 1 1 7.5 5.8L23 31" />
      <path stroke="#4B4B4B" d="M30.5 33a6 6 0 1 1-1.1-9.5L35 33h-9" />
      <path stroke="#4A4A55" d="M16 26.5a6 6 0 1 0 6.5 6.5H33" />
    </g>
    <circle cx="23" cy="31" r="2.6" fill="#C73A63" />
    <circle cx="35" cy="33" r="2.6" fill="#A0A0A8" />
    <circle cx="16" cy="33" r="2.6" fill="#A0A0A8" />
  </S>
);

const BRAND_RULES: { test: RegExp; Icon: React.FC<IconProps> }[] = [
  { test: /telegram/, Icon: TelegramIcon },
  { test: /gmail|email/, Icon: GmailIcon },
  { test: /sheet/, Icon: GoogleSheetsIcon },
  { test: /drive/, Icon: GoogleDriveIcon },
  { test: /slack/, Icon: SlackIcon },
  { test: /discord/, Icon: DiscordIcon },
  { test: /instagram/, Icon: InstagramIcon },
  { test: /facebook|messenger/, Icon: FacebookIcon },
  { test: /youtube/, Icon: YouTubeIcon },
  { test: /tiktok/, Icon: TikTokIcon },
  { test: /threads/, Icon: ThreadsIcon },
  { test: /zalo/, Icon: ZaloIcon },
  { test: /notion/, Icon: NotionIcon },
  { test: /github/, Icon: GitHubIcon },
  { test: /shopee|lazada|ecommerce/, Icon: ShopeeIcon },
  { test: /momo|vnpay|vietqr|zalopay|payment/, Icon: MomoIcon },
  { test: /gemini/, Icon: GeminiIcon },
  { test: /claude|anthropic/, Icon: ClaudeIcon },
  { test: /deepseek/, Icon: DeepSeekIcon },
  { test: /ollama/, Icon: OllamaIcon },
  { test: /openai|gpt/, Icon: OpenAIIcon },
  { test: /webhook/, Icon: WebhookIcon },
];

/**
 * Resolve the original brand icon for a node using its type, provider/app params and name.
 * Returns null when the node is not a known third-party app (caller falls back to generic icon).
 */
export function resolveBrandIcon(node: { type?: string; name?: string; parameters?: Record<string, any> }): React.FC<IconProps> | null {
  const type = (node.type || '').toLowerCase();
  const params = node.parameters || {};
  const provider = String(params.provider || params.app || params.gateway || '').toLowerCase();
  const name = (node.name || '').toLowerCase();

  // Priority: type -> explicit provider/app param -> display name
  for (const source of [type, provider, name]) {
    if (!source) continue;
    const hit = BRAND_RULES.find((r) => r.test.test(source));
    if (hit) return hit.Icon;
  }
  return null;
}
