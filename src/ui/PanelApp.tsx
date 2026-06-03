import { useEffect } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { useRequestStore } from '../stores/requestStore';
import { RequestList } from './RequestList';
import { RequestDetails } from './RequestDetails';
import { startNetworkListener } from '../interceptors/networkListener';

export default function PanelApp() {
  const { requests, selectedRequestId } = useRequestStore();

  useEffect(() => {
    startNetworkListener();
  }, []);

  const selectedRequest = requests.find((r) => r.id === selectedRequestId);

  return (
    <div className="flex h-screen w-screen flex-col bg-background text-foreground overflow-hidden">
      {/* Header/Toolbar */}
      <header className="flex h-12 items-center border-b border-border bg-card px-4 shrink-0">
        <h1 className="font-bold text-lg text-primary mr-6">APIInspector</h1>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>{requests.length} Requests</span>
        </div>
      </header>

      {/* Main Content Split Pane */}
      <div className="flex-1 overflow-hidden">
        <Group orientation="horizontal">
          <Panel defaultSize="40%" minSize="20%" className="flex flex-col">
            <RequestList />
          </Panel>
          <Separator className="w-1 bg-border hover:bg-primary transition-colors cursor-col-resize" />
          <Panel defaultSize="60%" minSize="20%" className="flex flex-col bg-card/50">
            {selectedRequest ? (
              <RequestDetails request={selectedRequest} />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Select a request to view details
              </div>
            )}
          </Panel>
        </Group>
      </div>
    </div>
  );
}
