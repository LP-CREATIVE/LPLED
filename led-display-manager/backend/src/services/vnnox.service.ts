import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { logger } from '../utils/logger';

interface VNNOXConfig {
  ak: string;
  as: string;
  apiUrl: string;
}

interface VNNOXResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export class VNNOXService {
  private client: AxiosInstance;
  private config: VNNOXConfig;

  constructor() {
    this.config = {
      ak: process.env.VNNOX_AK!,
      as: process.env.VNNOX_AS!,
      apiUrl: process.env.VNNOX_API_URL || 'https://api.vnnox.com'
    };

    this.client = axios.create({
      baseURL: this.config.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use((config) => {
      const timestamp = new Date().toISOString();
      const nonce = crypto.randomBytes(16).toString('hex');
      
      // Generate signature
      const signature = this.generateSignature(
        config.method?.toUpperCase() || 'GET',
        config.url || '',
        timestamp,
        nonce
      );

      // Add auth headers
      config.headers['X-Access-Key'] = this.config.ak;
      config.headers['X-Signature'] = signature;
      config.headers['X-Timestamp'] = timestamp;
      config.headers['X-Nonce'] = nonce;

      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('VNNOX API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw error;
      }
    );
  }

  private generateSignature(method: string, path: string, timestamp: string, nonce: string): string {
    const stringToSign = `${method}\n${path}\n${timestamp}\n${nonce}`;
    return crypto
      .createHmac('sha256', this.config.as)
      .update(stringToSign)
      .digest('base64');
  }

  // Terminal Management
  async getTerminalInfo(terminalId: string): Promise<VNNOXResponse> {
    const response = await this.client.get(`/api/v1/terminals/${terminalId}`);
    return response.data;
  }

  async getTerminalStatus(terminalId: string): Promise<VNNOXResponse> {
    const response = await this.client.get(`/api/v1/terminals/${terminalId}/status`);
    return response.data;
  }

  // Screen Control
  async setScreenBrightness(terminalId: string, brightness: number): Promise<VNNOXResponse> {
    const response = await this.client.post(`/api/v1/terminals/${terminalId}/screen/brightness`, {
      brightness: Math.max(0, Math.min(100, brightness))
    });
    return response.data;
  }

  async setVolume(terminalId: string, volume: number): Promise<VNNOXResponse> {
    const response = await this.client.post(`/api/v1/terminals/${terminalId}/audio/volume`, {
      volume: Math.max(0, Math.min(100, volume))
    });
    return response.data;
  }

  async screenPower(terminalId: string, power: boolean): Promise<VNNOXResponse> {
    const response = await this.client.post(`/api/v1/terminals/${terminalId}/screen/power`, {
      power
    });
    return response.data;
  }

  // Content Management
  async uploadMedia(terminalId: string, mediaUrl: string, mediaInfo: any): Promise<VNNOXResponse> {
    const response = await this.client.post(`/api/v1/terminals/${terminalId}/media`, {
      url: mediaUrl,
      ...mediaInfo
    });
    return response.data;
  }

  async createPlaylist(terminalId: string, playlist: any): Promise<VNNOXResponse> {
    const response = await this.client.post(`/api/v1/terminals/${terminalId}/playlists`, playlist);
    return response.data;
  }

  async publishContent(terminalId: string, contentId: string): Promise<VNNOXResponse> {
    const response = await this.client.post(`/api/v1/terminals/${terminalId}/publish`, {
      contentId
    });
    return response.data;
  }

  async getPlayingContent(terminalId: string): Promise<VNNOXResponse> {
    const response = await this.client.get(`/api/v1/terminals/${terminalId}/playing`);
    return response.data;
  }

  // Schedule Management
  async createSchedule(terminalId: string, schedule: any): Promise<VNNOXResponse> {
    const response = await this.client.post(`/api/v1/terminals/${terminalId}/schedules`, schedule);
    return response.data;
  }

  async getSchedules(terminalId: string): Promise<VNNOXResponse> {
    const response = await this.client.get(`/api/v1/terminals/${terminalId}/schedules`);
    return response.data;
  }

  async deleteSchedule(terminalId: string, scheduleId: string): Promise<VNNOXResponse> {
    const response = await this.client.delete(`/api/v1/terminals/${terminalId}/schedules/${scheduleId}`);
    return response.data;
  }

  // System Operations
  async rebootTerminal(terminalId: string): Promise<VNNOXResponse> {
    const response = await this.client.post(`/api/v1/terminals/${terminalId}/reboot`);
    return response.data;
  }

  async getTerminalLogs(terminalId: string, options?: { limit?: number; startTime?: string }): Promise<VNNOXResponse> {
    const response = await this.client.get(`/api/v1/terminals/${terminalId}/logs`, {
      params: options
    });
    return response.data;
  }
}

export const vnnoxService = new VNNOXService();