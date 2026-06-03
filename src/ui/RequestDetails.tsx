import { useState } from 'react';
import type { NetworkRequest } from '../stores/requestStore';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { exportAsCurl } from '../exporters/curl';
import { exportAsFetch, exportAsAxios } from '../exporters/snippets';
import { isGraphQLRequest, parseGraphQLRequest } from '../analyzers/graphql';
import { extractTokensFromHeaders, parseJWT } from '../analyzers/jwt';
import { getAIExplanation } from '../ai/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  request: NetworkRequest;
}

export function RequestDetails({ request }: Props) {
  const [activeTab, setActiveTab] = useState<'headers' | 'params' | 'payload' | 'response' | 'cookies' | 'timing' | 'graphql' | 'auth' | 'ai'>('headers');
  const [aiInsight, setAiInsight] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const isGraphQL = isGraphQLRequest(request.url, request.postData);
  const graphQLData = isGraphQL ? parseGraphQLRequest(request.postData) : null;
  
  const authTokens = extractTokensFromHeaders(request.requestHeaders);
  const jwtData = authTokens.length > 0 ? parseJWT(authTokens[0].token) : null;

  const [isReplaying, setIsReplaying] = useState(false);

  const handleGenerateAiInsight = async () => {
    setIsAiLoading(true);
    setAiError('');
    try {
      const prompt = `Analyze this API request and response. Explain any errors, suggest optimizations, or summarize its purpose:
URL: ${request.method} ${request.url}
Status: ${request.status}
Response Body: ${request.responseBody?.substring(0, 500) || 'None'}
Payload: ${request.postData?.text?.substring(0, 500) || 'None'}
`;
      const result = await getAIExplanation(prompt);
      setAiInsight(result);
    } catch (e: any) {
      setAiError(e.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExportCode = (format: string) => {
    let code = '';
    if (format === 'curl') code = exportAsCurl(request);
    if (format === 'fetch') code = exportAsFetch(request);
    if (format === 'axios') code = exportAsAxios(request);
    
    if (code) {
      navigator.clipboard.writeText(code);
      // Optional toast/alert
    }
  };

  const handleReplay = () => {
    setIsReplaying(true);
    chrome.runtime.sendMessage({ action: 'REPLAY_REQUEST', request }, (response) => {
      setIsReplaying(false);
      if (response.success) {
        alert(`Replay successful! Status: ${response.status}`);
      } else {
        alert(`Replay failed: ${response.error}`);
      }
    });
  };

  const renderHeaders = (headers: { name: string; value: string }[]) => (
    <div className="space-y-1">
      {headers.map((h, i) => (
        <div key={i} className="flex text-sm">
          <span className="font-semibold text-muted-foreground w-48 shrink-0">{h.name}:</span>
          <span className="break-all">{h.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <div className="flex justify-between items-center border-b border-border bg-card shrink-0 px-2 overflow-hidden">
        <div className="flex overflow-x-auto whitespace-nowrap flex-1 items-center pb-1 -mb-1 scrollbar-hide">
          <button className={`px-4 py-2 text-sm font-medium ${activeTab === 'headers' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setActiveTab('headers')}>Headers</button>
          <button className={`px-4 py-2 text-sm font-medium ${activeTab === 'params' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setActiveTab('params')}>Params</button>
          <button className={`px-4 py-2 text-sm font-medium ${activeTab === 'payload' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setActiveTab('payload')}>Payload</button>
          <button className={`px-4 py-2 text-sm font-medium ${activeTab === 'response' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setActiveTab('response')}>Response</button>
          <button className={`px-4 py-2 text-sm font-medium ${activeTab === 'cookies' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setActiveTab('cookies')}>Cookies</button>
          <button className={`px-4 py-2 text-sm font-medium ${activeTab === 'timing' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setActiveTab('timing')}>Timing</button>
          {isGraphQL && <button className={`px-4 py-2 text-sm font-medium ${activeTab === 'graphql' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setActiveTab('graphql')}>GraphQL</button>}
          {jwtData && <button className={`px-4 py-2 text-sm font-medium ${activeTab === 'auth' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setActiveTab('auth')}>Auth / JWT</button>}
          <button className={`px-4 py-2 text-sm font-medium flex items-center space-x-1 ${activeTab === 'ai' ? 'border-b-2 border-primary text-primary' : 'text-purple-400 hover:text-purple-300'}`} onClick={() => setActiveTab('ai')}>
            <span>✨ AI Insights</span>
          </button>
        </div>
        <div className="flex items-center space-x-2 shrink-0 ml-2 pl-2 border-l border-border/50">
          <button 
            onClick={handleReplay} 
            disabled={isReplaying}
            className={`text-xs px-2 py-1 rounded font-medium ${isReplaying ? 'bg-muted text-muted-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
          >
            {isReplaying ? 'Replaying...' : 'Replay'}
          </button>
          <select 
            onChange={(e) => {
              if (e.target.value) {
                handleExportCode(e.target.value);
                e.target.value = ""; // reset
              }
            }}
            className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:opacity-90 outline-none cursor-pointer"
          >
            <option value="">Copy code as...</option>
            <option value="curl">cURL</option>
            <option value="fetch">Fetch API</option>
            <option value="axios">Axios</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'headers' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-2">General</h3>
              <div className="space-y-1 text-sm">
                <div className="flex"><span className="font-semibold w-48 text-muted-foreground">URL:</span><span className="break-all">{request.url}</span></div>
                <div className="flex"><span className="font-semibold w-48 text-muted-foreground">Method:</span><span>{request.method}</span></div>
                <div className="flex"><span className="font-semibold w-48 text-muted-foreground">Status Code:</span><span>{request.status}</span></div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2 border-b border-border pb-1">Response Headers</h3>
              {renderHeaders(request.responseHeaders)}
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2 border-b border-border pb-1">Request Headers</h3>
              {renderHeaders(request.requestHeaders)}
            </div>
          </div>
        )}

        {activeTab === 'payload' && (
          <div>
            {!request.postData ? (
              <div className="text-muted-foreground">No payload</div>
            ) : (
              <SyntaxHighlighter language="json" style={vscDarkPlus} className="rounded-md text-sm">
                {request.postData.text || ''}
              </SyntaxHighlighter>
            )}
          </div>
        )}

        {activeTab === 'response' && (
          <div>
            {!request.responseBody ? (
              <div className="text-muted-foreground">No response body or fetching...</div>
            ) : (
              <SyntaxHighlighter language="json" style={vscDarkPlus} className="rounded-md text-sm">
                {request.responseBody}
              </SyntaxHighlighter>
            )}
          </div>
        )}

        {activeTab === 'params' && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg mb-2 border-b border-border pb-1">Query Parameters</h3>
            {request.queryString && request.queryString.length > 0 ? (
              renderHeaders(request.queryString)
            ) : (
              <div className="text-muted-foreground">No query parameters</div>
            )}
          </div>
        )}

        {activeTab === 'cookies' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-2 border-b border-border pb-1">Request Cookies</h3>
              {request.requestCookies && request.requestCookies.length > 0 ? renderHeaders(request.requestCookies) : <div className="text-muted-foreground">No request cookies</div>}
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2 border-b border-border pb-1">Response Cookies</h3>
              {request.responseCookies && request.responseCookies.length > 0 ? renderHeaders(request.responseCookies) : <div className="text-muted-foreground">No response cookies</div>}
            </div>
          </div>
        )}

        {activeTab === 'timing' && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg mb-2 border-b border-border pb-1">Request Timing</h3>
            {!request.timings || Object.keys(request.timings).length === 0 ? (
              <div className="text-muted-foreground">No timing info available</div>
            ) : (
              <div className="space-y-2 text-sm max-w-md bg-card/30 p-4 rounded-md border border-border">
                {Object.entries(request.timings).filter(([_, val]) => val > 0).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="font-semibold text-muted-foreground capitalize">{key}:</span>
                    <span>{Math.round(val * 100) / 100} ms</span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-border pt-2 mt-2 font-bold">
                  <span>Total Time:</span>
                  <span className="text-primary">{Math.round(request.time * 100) / 100} ms</span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'graphql' && graphQLData && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-sm text-muted-foreground mb-1">Query</h3>
              <SyntaxHighlighter language="graphql" style={vscDarkPlus} className="rounded-md text-sm">
                {graphQLData.query || ''}
              </SyntaxHighlighter>
            </div>
            {graphQLData.variables && (
              <div>
                <h3 className="font-bold text-sm text-muted-foreground mb-1">Variables</h3>
                <SyntaxHighlighter language="json" style={vscDarkPlus} className="rounded-md text-sm">
                  {JSON.stringify(graphQLData.variables, null, 2)}
                </SyntaxHighlighter>
              </div>
            )}
          </div>
        )}

        {activeTab === 'auth' && jwtData && (
          <div className="space-y-4">
            {jwtData.issues.length > 0 && (
              <div className="p-3 bg-destructive/20 border border-destructive text-destructive rounded-md text-sm">
                <strong>Security Warnings:</strong>
                <ul className="list-disc ml-5 mt-1">
                  {jwtData.issues.map((iss, i) => <li key={i}>{iss}</li>)}
                </ul>
              </div>
            )}
            <div>
              <h3 className="font-bold text-sm text-muted-foreground mb-1">Decoded Payload</h3>
              <SyntaxHighlighter language="json" style={vscDarkPlus} className="rounded-md text-sm">
                {JSON.stringify(jwtData.payload, null, 2)}
              </SyntaxHighlighter>
            </div>
            <div>
              <h3 className="font-bold text-sm text-muted-foreground mb-1">Decoded Header</h3>
              <SyntaxHighlighter language="json" style={vscDarkPlus} className="rounded-md text-sm">
                {JSON.stringify(jwtData.header, null, 2)}
              </SyntaxHighlighter>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Use AI to analyze this request, explain errors, or get optimization tips.
            </p>
            <button 
              onClick={handleGenerateAiInsight}
              disabled={isAiLoading}
              className="bg-purple-600 text-white px-4 py-2 rounded-md font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {isAiLoading ? 'Analyzing...' : 'Generate AI Insights'}
            </button>
            
            {aiError && (
              <div className="p-3 mt-4 bg-destructive/20 border border-destructive text-destructive rounded-md text-sm">
                <strong>Error:</strong> {aiError}
              </div>
            )}

            {aiInsight && (
              <div className="mt-4 p-5 bg-card/50 border border-border rounded-lg shadow-sm prose prose-sm dark:prose-invert max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-li:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:p-4 prose-pre:rounded-md prose-code:text-primary prose-a:text-blue-500">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {aiInsight}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
