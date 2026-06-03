import { create } from 'zustand';

export interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  status: number;
  time: number;
  requestHeaders: { name: string; value: string }[];
  responseHeaders: { name: string; value: string }[];
  queryString: { name: string; value: string }[];
  requestCookies: { name: string; value: string }[];
  responseCookies: { name: string; value: string }[];
  timings?: Record<string, number>;
  postData?: {
    mimeType: string;
    text?: string;
  };
  responseBody?: string;
  timestamp: number;
}

interface RequestState {
  requests: NetworkRequest[];
  selectedRequestId: string | null;
  isRecording: boolean;
  addRequest: (request: NetworkRequest) => void;
  updateRequest: (id: string, updates: Partial<NetworkRequest>) => void;
  clearRequests: () => void;
  selectRequest: (id: string | null) => void;
  toggleRecording: () => void;
}

export const useRequestStore = create<RequestState>((set) => ({
  requests: [],
  selectedRequestId: null,
  isRecording: true,
  addRequest: (request) => 
    set((state) => {
      if (!state.isRecording) return state;
      const newRequests = [...state.requests, request];
      if (newRequests.length > 10000) {
        newRequests.shift(); // Remove oldest to prevent memory leaks
      }
      return { requests: newRequests };
    }),
  updateRequest: (id, updates) =>
    set((state) => ({
      requests: state.requests.map((req) =>
        req.id === id ? { ...req, ...updates } : req
      ),
    })),
  clearRequests: () => set({ requests: [], selectedRequestId: null }),
  selectRequest: (id) => set({ selectedRequestId: id }),
  toggleRecording: () => set((state) => ({ isRecording: !state.isRecording })),
}));
