import { useRequestStore } from '../stores/requestStore';

export function startNetworkListener() {
  if (typeof chrome === 'undefined' || !chrome.devtools || !chrome.devtools.network) {
    console.warn('Network listener can only be started within Chrome DevTools.');
    return;
  }

  chrome.devtools.network.onRequestFinished.addListener((request) => {
    const id = crypto.randomUUID();
    
    // Parse HAR request format
    const networkRequest = {
      id,
      url: request.request.url,
      method: request.request.method,
      status: request.response.status,
      time: request.time,
      requestHeaders: request.request.headers,
      responseHeaders: request.response.headers,
      queryString: request.request.queryString,
      requestCookies: request.request.cookies || [],
      responseCookies: request.response.cookies || [],
      timings: (request.timings as unknown as Record<string, number>) || {},
      postData: request.request.postData ? {
        mimeType: request.request.postData.mimeType,
        text: request.request.postData.text,
      } : undefined,
      timestamp: Date.now(),
    };

    useRequestStore.getState().addRequest(networkRequest);

    // Fetch response body asynchronously
    request.getContent((body) => {
      if (body) {
        useRequestStore.getState().updateRequest(id, { responseBody: body });
      }
    });
  });
}
