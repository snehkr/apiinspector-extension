import type { NetworkRequest } from '../stores/requestStore';

export function exportAsFetch(req: NetworkRequest): string {
  const headers = req.requestHeaders.filter(h => !h.name.toLowerCase().startsWith(':')).reduce((acc, h) => {
    acc[h.name] = h.value;
    return acc;
  }, {} as Record<string, string>);

  let snippet = `fetch("${req.url}", {\n`;
  snippet += `  method: "${req.method}",\n`;
  if (Object.keys(headers).length > 0) {
    snippet += `  headers: ${JSON.stringify(headers, null, 4).replace(/}/g, '  }')},\n`;
  }
  if (req.postData && req.postData.text) {
    try {
      // Validate if it's already JSON to avoid stringifying a stringified JSON
      JSON.parse(req.postData.text);
      snippet += `  body: JSON.stringify(${req.postData.text})\n`;
    } catch {
      snippet += `  body: ${JSON.stringify(req.postData.text)}\n`;
    }
  }
  snippet += `})\n.then(response => response.json())\n.then(data => console.log(data))\n.catch(err => console.error(err));`;
  return snippet;
}

export function exportAsAxios(req: NetworkRequest): string {
  const headers = req.requestHeaders.filter(h => !h.name.toLowerCase().startsWith(':')).reduce((acc, h) => {
    acc[h.name] = h.value;
    return acc;
  }, {} as Record<string, string>);

  let snippet = `import axios from 'axios';\n\n`;
  snippet += `axios({\n`;
  snippet += `  method: '${req.method.toLowerCase()}',\n`;
  snippet += `  url: '${req.url}',\n`;
  if (Object.keys(headers).length > 0) {
    snippet += `  headers: ${JSON.stringify(headers, null, 4).replace(/}/g, '  }')},\n`;
  }
  if (req.postData && req.postData.text) {
    snippet += `  data: ${req.postData.text}\n`;
  }
  snippet += `})\n.then(response => console.log(response.data))\n.catch(err => console.error(err));`;
  return snippet;
}
