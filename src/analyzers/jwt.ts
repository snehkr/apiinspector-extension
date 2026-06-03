export interface JWTData {
  header: any;
  payload: any;
  isExpired: boolean;
  issues: string[];
}

export function parseJWT(token: string): JWTData | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    
    let isExpired = false;
    const issues: string[] = [];

    if (payload.exp) {
      const expDate = new Date(payload.exp * 1000);
      if (expDate < new Date()) {
        isExpired = true;
        issues.push("Token has expired.");
      }
    }

    if (header.alg === 'none') {
      issues.push("Insecure algorithm 'none' used.");
    }

    return {
      header,
      payload,
      isExpired,
      issues
    };
  } catch (e) {
    return null;
  }
}

export function extractTokensFromHeaders(headers: { name: string; value: string }[]): { name: string, token: string }[] {
  const tokens: { name: string, token: string }[] = [];
  
  for (const header of headers) {
    if (header.name.toLowerCase() === 'authorization' && header.value.toLowerCase().startsWith('bearer ')) {
      tokens.push({ name: header.name, token: header.value.substring(7) });
    }
  }
  
  return tokens;
}
