import type { NetworkRequest } from '../stores/requestStore';

export function exportAsCurl(request: NetworkRequest): string {
  let curlCommand = `curl '${request.url}' \\\n`;
  curlCommand += `  -X ${request.method} \\\n`;

  request.requestHeaders.forEach(header => {
    // Escape single quotes for bash
    const value = header.value.replace(/'/g, "'\\''");
    curlCommand += `  -H '${header.name}: ${value}' \\\n`;
  });

  if (request.postData && request.postData.text) {
    const data = request.postData.text.replace(/'/g, "'\\''");
    curlCommand += `  --data-raw '${data}' \\\n`;
  }

  // Remove the trailing backslash and newline
  return curlCommand.trim().replace(/\\$/, '').trim();
}
