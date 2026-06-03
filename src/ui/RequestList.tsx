import { useState, useRef } from 'react';
import { useRequestStore } from '../stores/requestStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useVirtualizer } from '@tanstack/react-virtual';
import { exportAsHAR } from '../exporters/har';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function getStatusColor(status: number) {
  if (status >= 200 && status < 300) return 'text-green-500';
  if (status >= 300 && status < 400) return 'text-blue-500';
  if (status >= 400 && status < 500) return 'text-orange-500';
  if (status >= 500) return 'text-red-500';
  return 'text-muted-foreground';
}

function getMethodColor(method: string) {
  switch (method.toUpperCase()) {
    case 'GET': return 'text-blue-500';
    case 'POST': return 'text-green-500';
    case 'PUT': return 'text-orange-500';
    case 'DELETE': return 'text-red-500';
    case 'PATCH': return 'text-yellow-500';
    default: return 'text-muted-foreground';
  }
}

export function RequestList() {
  const { requests, selectedRequestId, selectRequest, clearRequests } = useRequestStore();
  const [filter, setFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredRequests = requests.filter(req => {
    if (filter && !req.url.toLowerCase().includes(filter.toLowerCase()) && !req.method.toLowerCase().includes(filter.toLowerCase())) return false;
    if (methodFilter !== 'ALL' && req.method.toUpperCase() !== methodFilter) return false;
    if (statusFilter === 'ERROR' && req.status < 400) return false;
    if (statusFilter === 'SUCCESS' && req.status >= 400) return false;
    return true;
  });

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredRequests.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36, // height of each row
    overscan: 10,
  });

  const handleReload = () => {
    clearRequests();
    if (typeof chrome !== 'undefined' && chrome.devtools && chrome.devtools.inspectedWindow) {
      chrome.devtools.inspectedWindow.reload({ ignoreCache: true });
    }
  };

  const handleExportHAR = () => {
    const harData = exportAsHAR(filteredRequests);
    const blob = new Blob([harData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apiinspector_session_${new Date().toISOString().replace(/[:.]/g, '-')}.har`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden border-r border-border bg-background">
      <div className="flex flex-col border-b border-border bg-card shrink-0 p-2 gap-2">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Filter requests..."
            className="flex-1 min-w-0 bg-input border border-border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <select 
            value={methodFilter} 
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-input border border-border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary shrink-0 cursor-pointer"
          >
            <option value="ALL">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-input border border-border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary shrink-0 cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="ERROR">Errors</option>
          </select>
        </div>
        <div className="flex items-center space-x-2 justify-end">
          <button 
            onClick={handleExportHAR}
            className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded text-sm hover:opacity-90 font-medium"
            title="Export session to HAR format"
          >
            Export HAR
          </button>
          <button 
            onClick={handleReload}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm hover:opacity-90 font-medium"
            title="Clear logs and reload page"
          >
            Reload
          </button>
          <button 
            onClick={clearRequests}
            className="px-3 py-1.5 bg-destructive text-destructive-foreground rounded text-sm hover:opacity-90 font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex w-full text-left text-sm whitespace-nowrap bg-card shadow-sm border-b border-border shrink-0 pr-3">
        <div className="px-3 py-2 font-medium text-muted-foreground w-20 shrink-0">Method</div>
        <div className="px-3 py-2 font-medium text-muted-foreground flex-1 min-w-0">URL</div>
        <div className="px-3 py-2 font-medium text-muted-foreground w-16 shrink-0">Status</div>
        <div className="px-3 py-2 font-medium text-muted-foreground w-20 shrink-0">Time</div>
      </div>

      <div ref={parentRef} className="flex-1 overflow-auto bg-background relative">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {filteredRequests.length === 0 && (
            <div className="p-4 text-center text-muted-foreground text-sm absolute w-full top-0">
              No requests found
            </div>
          )}
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const req = filteredRequests[virtualRow.index];
            const isSelected = selectedRequestId === req.id;
            
            return (
              <div
                key={req.id}
                onClick={() => selectRequest(req.id)}
                className={cn(
                  "flex w-full text-sm whitespace-nowrap cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/30 items-center absolute top-0 left-0",
                  isSelected && "bg-muted"
                )}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div className={cn("px-3 py-1 font-bold w-20 shrink-0 truncate", getMethodColor(req.method))}>
                  {req.method}
                </div>
                <div className="px-3 py-1 flex-1 min-w-0 truncate font-mono text-[13px]" title={req.url}>
                  {req.url}
                </div>
                <div className={cn("px-3 py-1 font-medium w-16 shrink-0", getStatusColor(req.status))}>
                  {req.status}
                </div>
                <div className="px-3 py-1 text-muted-foreground w-20 shrink-0 tabular-nums">
                  {Math.round(req.time)}ms
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
