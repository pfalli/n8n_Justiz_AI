import express from 'express';
import cors from 'cors';
import { RechtsinformationenBundDeMCPServer } from './index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';

const app = express();
app.use(cors());

const mcpServer = new RechtsinformationenBundDeMCPServer();

app.get('/sse', async (req, res) => {
  console.log('New SSE connection');
  const transport = new SSEServerTransport('/messages', res);
  await mcpServer.server.connect(transport);
});

app.post('/messages', async (req, res) => {
  console.log('Received message');
  // Note: This is a simplified handling. In a real SSE setup, 
  // you need to route the message to the correct transport instance.
  // The MCP SDK's SSEServerTransport handles this via the handlePostMessage method
  // but we need to maintain a reference to the active transport.
  // For a simple single-connection demo or stateless HTTP wrapper, 
  // we might need a different approach or a map of transports.
  
  // However, for n8n which is stateless HTTP, SSE might be tricky.
  // A pure JSON-RPC over HTTP endpoint is easier for n8n.
  // Let's implement a direct JSON-RPC handler instead of SSE for n8n compatibility.
});

// Re-implementing as a direct JSON-RPC HTTP handler for n8n
const jsonRpcApp = express();
jsonRpcApp.use(cors());
jsonRpcApp.use(express.json());

jsonRpcApp.post('/mcp', async (req, res) => {
  const message = req.body;
  console.log('Received JSON-RPC request:', JSON.stringify(message, null, 2));

  // We need a custom transport that handles a single request/response cycle
  // The MCP SDK is designed for persistent connections, but we can adapt it.
  // Or we can manually invoke the tool handler if we know it's a tool call.
  
  // BUT, the cleanest way using standard MCP SDK is to use the SSEServerTransport 
  // if the client supports it. n8n's HTTP Request node doesn't support SSE easily.
  
  // So we will manually route the request to the server's internal handler.
  // The server.server object is a generic MCP Server.
  // We can't easily "connect" a transport for just one request.
  
  // Alternative: Create a new server instance and transport for each request? Expensive.
  // Better: Use the server's internal request handling logic if exposed, 
  // or mock a transport that immediately resolves.
  
  // Let's try to use a custom transport that writes to the response.
  
  // Actually, for n8n, we just want to call the tools.
  // Let's look at how we can invoke the tool directly.
  
  // If it's a 'tools/list' request:
  if (message.method === 'tools/list') {
     // We can't easily access the private capabilities or handlers of the MCP Server class
     // without modifying the SDK or the class.
     // However, we can instantiate a transport, connect it, send the message, wait for reply, and disconnect.
  }
});
