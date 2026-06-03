export interface GraphQLData {
  query?: string;
  variables?: any;
  operationName?: string;
}

export function parseGraphQLRequest(postData?: { mimeType: string; text?: string }): GraphQLData | null {
  if (!postData || !postData.text) return null;
  
  if (postData.mimeType.includes('application/json')) {
    try {
      const body = JSON.parse(postData.text);
      if (body.query) {
        return {
          query: body.query,
          variables: body.variables,
          operationName: body.operationName,
        };
      }
    } catch (e) {
      // Not JSON or invalid JSON
    }
  }

  return null;
}

export function isGraphQLRequest(url: string, postData?: { mimeType: string; text?: string }): boolean {
  if (url.toLowerCase().includes('/graphql')) return true;
  return parseGraphQLRequest(postData) !== null;
}
