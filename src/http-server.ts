import express from 'express';
import cors from 'cors';
import { RechtsinformationenBundDeMCPServer } from './index.js';
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { JSONRPCMessage } from '@modelcontextprotocol/sdk/types.js';

class HTTPTransport implements Transport {
  private res: express.Response;
  private hasSent = false;

  constructor(res: express.Response) {
    this.res = res;
  }

  async start(): Promise<void> {
    // No-op
  }

  async send(message: JSONRPCMessage): Promise<void> {
    if (this.hasSent) return;
    this.res.json(message);
    this.hasSent = true;
  }

  async close(): Promise<void> {
    // No-op
  }
  
  onmessage?: (message: JSONRPCMessage) => void;
  onclose?: () => void;
  onerror?: (error: Error) => void;

  receiveRequest(message: JSONRPCMessage) {
    if (this.onmessage) {
      this.onmessage(message);
    }
  }
}

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('MCP Server is running. Please send POST requests to /mcp');
});

app.post('/mcp', async (req, res) => {
  try {
    const mcpInstance = new RechtsinformationenBundDeMCPServer();
    const transport = new HTTPTransport(res);
    
    await mcpInstance.server.connect(transport);
    
    // Inject the request
    transport.receiveRequest(req.body);
  } catch (error) {
    console.error('Error handling request:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 MCP HTTP Server running on port ${PORT}`);
});
