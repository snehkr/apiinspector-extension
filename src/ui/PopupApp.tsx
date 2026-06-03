import { Settings, Activity, Server, Code } from 'lucide-react';

export default function PopupApp() {
  const openOptions = () => chrome.runtime.openOptionsPage();

  return (
    <div className="flex h-full flex-col p-5 w-[320px] bg-background text-foreground shadow-xl border border-border/50">
      <div className="flex items-center space-x-4 mb-5 border-b border-border pb-4">
        <img src="/src/assets/logo.png" alt="APIInspector Logo" className="w-12 h-12 rounded-lg shadow-sm border border-border/50" />
        <div>
          <h1 className="text-xl font-bold text-primary tracking-tight leading-none mb-1">APIInspector</h1>
          <span className="text-xs text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded">v1.0.0</span>
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        <p className="text-sm text-foreground leading-relaxed">
          The ultimate native API inspector for developers. Features include:
        </p>
        <ul className="text-sm space-y-2.5 text-muted-foreground">
          <li className="flex items-center"><Activity size={15} className="mr-2 text-primary" /> Real-time network interception</li>
          <li className="flex items-center"><Server size={15} className="mr-2 text-primary" /> Deep GraphQL & JWT parsing</li>
          <li className="flex items-center"><Code size={15} className="mr-2 text-primary" /> Automated AI Insights</li>
        </ul>
        <div className="p-3 bg-primary/10 rounded-md border border-primary/20 mt-4">
          <p className="text-xs text-primary font-medium text-center">
            Open Chrome DevTools (F12) and select the <strong>APIInspector</strong> tab to get started.
          </p>
        </div>
      </div>
      
      <div className="mt-auto">
        <button 
          onClick={openOptions}
          className="w-full flex items-center justify-center space-x-2 bg-primary text-primary-foreground hover:bg-primary/90 py-2.5 rounded-md font-medium text-sm transition-colors shadow-sm"
        >
          <Settings size={16} />
          <span>Extension Settings</span>
        </button>
      </div>
    </div>
  );
}
