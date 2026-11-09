import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { URL } from 'url';

/**
 * SafeHttp Utility inspired by Activepieces SSRF Protection.
 * Blocks requests to private / loopback / cloud metadata IP addresses
 * to prevent Server-Side Request Forgery attacks.
 */
export class SafeHttp {
  private static BLOCKED_HOSTNAMES = [
    'localhost',
    '127.0.0.1',
    '::1',
    '0.0.0.0',
    '169.254.169.254', // AWS/GCP/Azure Instance Metadata
    'metadata.google.internal',
  ];

  static isUrlAllowed(targetUrl: string, allowLocalhost: boolean = false): boolean {
    try {
      const parsed = new URL(targetUrl);
      const hostname = parsed.hostname.toLowerCase();

      if (!allowLocalhost) {
        if (this.BLOCKED_HOSTNAMES.includes(hostname)) return false;
        // Check private IP ranges (10.x.x.x, 172.16.x.x - 172.31.x.x, 192.168.x.x)
        if (/^10\.\d+\.\d+\.\d+$/.test(hostname)) return false;
        if (/^192\.168\.\d+\.\d+$/.test(hostname)) return false;
        if (/^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(hostname)) return false;
      }

      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  static async request(config: AxiosRequestConfig, allowLocalhost: boolean = true): Promise<AxiosResponse> {
    if (config.url && !this.isUrlAllowed(config.url, allowLocalhost)) {
      throw new Error(`[SafeHttp Blocked]: Yêu cầu tới ${config.url} bị từ chối do chính sách bảo vệ SSRF.`);
    }

    return axios({
      ...config,
      timeout: config.timeout || 30000,
      headers: {
        'User-Agent': 'VinceAuto-Engine/1.0 (Hybrid n8n + Activepieces)',
        ...(config.headers || {}),
      },
    });
  }

  static async get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.request({ ...config, method: 'GET', url });
  }

  static async post(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.request({ ...config, method: 'POST', url, data });
  }
}
