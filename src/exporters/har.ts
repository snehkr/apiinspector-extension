import type { NetworkRequest } from '../stores/requestStore';

export function exportAsHAR(requests: NetworkRequest[]): string {
  const har = {
    log: {
      version: '1.2',
      creator: {
        name: 'APIInspector',
        version: '1.0.0'
      },
      entries: requests.map(req => ({
        startedDateTime: new Date().toISOString(),
        time: req.time || 0,
        request: {
          method: req.method,
          url: req.url,
          httpVersion: 'HTTP/1.1',
          cookies: req.requestCookies || [],
          headers: req.requestHeaders || [],
          queryString: req.queryString || [],
          postData: req.postData ? {
            mimeType: req.postData.mimeType || 'application/json',
            text: req.postData.text || ''
          } : undefined,
          headersSize: -1,
          bodySize: -1
        },
        response: {
          status: req.status,
          statusText: '',
          httpVersion: 'HTTP/1.1',
          cookies: req.responseCookies || [],
          headers: req.responseHeaders || [],
          content: {
            size: req.responseBody ? req.responseBody.length : 0,
            mimeType: 'application/json',
            text: req.responseBody || ''
          },
          redirectURL: '',
          headersSize: -1,
          bodySize: -1
        },
        cache: {},
        timings: req.timings || {
          send: 0,
          wait: req.time,
          receive: 0
        }
      }))
    }
  };

  return JSON.stringify(har, null, 2);
}
