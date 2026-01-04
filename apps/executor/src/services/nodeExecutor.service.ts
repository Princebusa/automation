import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import nodemailer from 'nodemailer';

export interface NodeExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class NodeExecutor {
  
  // HTTP Request Node
  static async executeHttpRequest(metadata: any): Promise<NodeExecutionResult> {
    try {
      const { url, method = 'GET', headers = {}, body } = metadata;
      
      if (!url) {
        return { success: false, error: 'URL is required' };
      }

      const config: any = {
        method,
        url,
        headers,
        timeout: 30000,
      };

      if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
        config.data = typeof body === 'string' ? JSON.parse(body) : body;
      }

      const response = await axios(config);
      
      return {
        success: true,
        data: {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'HTTP request failed'
      };
    }
  }

  // File System Node
  static async executeFileSystem(metadata: any): Promise<NodeExecutionResult> {
    try {
      const { operation, filePath, content, encoding = 'utf8' } = metadata;
      
      if (!filePath) {
        return { success: false, error: 'File path is required' };
      }

      const fullPath = path.resolve(filePath);
      
      switch (operation) {
        case 'read':
          const data = await fs.readFile(fullPath, encoding);
          return { success: true, data };
          
        case 'write':
          if (!content) {
            return { success: false, error: 'Content is required for write operation' };
          }
          await fs.writeFile(fullPath, content, encoding);
          return { success: true, data: 'File written successfully' };
          
        case 'delete':
          await fs.unlink(fullPath);
          return { success: true, data: 'File deleted successfully' };
          
        case 'exists':
          const exists = await fs.access(fullPath).then(() => true).catch(() => false);
          return { success: true, data: { exists } };
          
        default:
          return { success: false, error: 'Unsupported operation' };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'File system operation failed'
      };
    }
  }

  // Data Transform Node
  static async executeDataTransform(metadata: any, inputData: any): Promise<NodeExecutionResult> {
    try {
      const { operation, expression, script } = metadata;
      
      if (!inputData) {
        return { success: false, error: 'Input data is required' };
      }

      let result;
      
      switch (operation) {
        case 'map':
          if (expression) {
            // Simple expression evaluation (in production, use a safer eval alternative)
            const func = new Function('item', 'index', 'array', `return ${expression}`);
            result = Array.isArray(inputData) ? inputData.map(func) : [func(inputData, 0, [inputData])];
          } else {
            result = inputData;
          }
          break;
          
        case 'filter':
          if (expression) {
            const func = new Function('item', 'index', 'array', `return ${expression}`);
            result = Array.isArray(inputData) ? inputData.filter(func) : [func(inputData, 0, [inputData])];
          } else {
            result = inputData;
          }
          break;
          
        case 'sort':
          if (expression) {
            const func = new Function('a', 'b', `return ${expression}`);
            result = Array.isArray(inputData) ? inputData.sort(func) : inputData;
          } else {
            result = Array.isArray(inputData) ? inputData.sort() : inputData;
          }
          break;
          
        case 'custom':
          if (script) {
            // In production, use a sandboxed JavaScript engine
            const func = new Function('data', script);
            result = func(inputData);
          } else {
            result = inputData;
          }
          break;
          
        default:
          result = inputData;
      }
      
      return { success: true, data: result };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Data transformation failed'
      };
    }
  }

  // Mail Node
  static async executeMail(metadata: any): Promise<NodeExecutionResult> {
    try {
      const { host, port, user, password } = metadata;
      
      if (!host || !port || !user || !password) {
        return { success: false, error: 'All SMTP credentials are required' };
      }

      // Create a test transporter to verify credentials
      const transporter = nodemailer.createTransporter({
        host,
        port: parseInt(port),
        secure: port === '465', // true for 465, false for other ports
        auth: { user, pass: password }
      });

      // Verify connection configuration
      await transporter.verify();
      
      return { 
        success: true, 
        data: { 
          message: 'SMTP configuration verified successfully',
          host: host,
          port: port,
          user: user
        } 
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Email configuration failed'
      };
    }
  }

  // Google Sheets Node (Basic implementation - requires API key)
  static async executeGoogleSheets(metadata: any): Promise<NodeExecutionResult> {
    try {
      const { operation, spreadsheetId, range, apiKey } = metadata;
      
      if (!apiKey) {
        return { success: false, error: 'API key is required for Google Sheets' };
      }

      if (!spreadsheetId) {
        return { success: false, error: 'Spreadsheet ID is required' };
      }

      // This is a basic implementation - in production, you'd use Google Sheets API
      // For demo purposes, we'll return a mock response
      const mockData = [
        ['Name', 'Email', 'Status'],
        ['John Doe', 'john@example.com', 'Active'],
        ['Jane Smith', 'jane@example.com', 'Inactive']
      ];

      switch (operation) {
        case 'read':
          return { success: true, data: mockData };
          
        case 'write':
          return { success: true, data: 'Data written successfully (mock)' };
          
        case 'append':
          return { success: true, data: 'Data appended successfully (mock)' };
          
        case 'create':
          return { success: true, data: { spreadsheetId: 'mock-spreadsheet-id' } };
          
        default:
          return { success: false, error: 'Unsupported operation' };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Google Sheets operation failed'
      };
    }
  }

  // Webhook Trigger (returns webhook URL)
  static async executeWebhook(metadata: any): Promise<NodeExecutionResult> {
    try {
      const { endpoint, method = 'POST' } = metadata;
      
      if (!endpoint) {
        return { success: false, error: 'Endpoint is required' };
      }

      const webhookUrl = `http://localhost:4001/webhooks${endpoint}`;
      
      return { 
        success: true, 
        data: { 
          webhookUrl,
          method,
          message: 'Webhook endpoint created'
        } 
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Webhook creation failed'
      };
    }
  }

  // Schedule Trigger
  static async executeSchedule(metadata: any): Promise<NodeExecutionResult> {
    try {
      const { type, interval, cronExpression, datetime } = metadata;
      
      if (!type) {
        return { success: false, error: 'Schedule type is required' };
      }

      let scheduleInfo;
      
      switch (type) {
        case 'interval':
          if (!interval) {
            return { success: false, error: 'Interval is required for interval type' };
          }
          scheduleInfo = { type: 'interval', intervalSeconds: interval };
          break;
          
        case 'cron':
          if (!cronExpression) {
            return { success: false, error: 'Cron expression is required for cron type' };
          }
          scheduleInfo = { type: 'cron', expression: cronExpression };
          break;
          
        case 'once':
          if (!datetime) {
            return { success: false, error: 'Datetime is required for once type' };
          }
          scheduleInfo = { type: 'once', datetime };
          break;
          
        default:
          return { success: false, error: 'Unsupported schedule type' };
      }
      
      return { 
        success: true, 
        data: { 
          ...scheduleInfo,
          message: 'Schedule configured successfully'
        } 
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Schedule configuration failed'
      };
    }
  }

  // Timer Trigger
  static async executeTimer(metadata: any): Promise<NodeExecutionResult> {
    try {
      const { time = 3600 } = metadata;
      
      return { 
        success: true, 
        data: { 
          interval: time,
          message: `Timer set for ${time} seconds`
        } 
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Timer configuration failed'
      };
    }
  }

  // Price Trigger
  static async executePriceTrigger(metadata: any): Promise<NodeExecutionResult> {
    try {
      const { price } = metadata;
      
      if (!price) {
        return { success: false, error: 'Price threshold is required' };
      }
      
      return { 
        success: true, 
        data: { 
          priceThreshold: price,
          message: `Price trigger set at ${price}`
        } 
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Price trigger configuration failed'
      };
    }
  }
}
