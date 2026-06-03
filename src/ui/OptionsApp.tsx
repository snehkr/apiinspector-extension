import { useEffect, useState } from 'react';

export default function OptionsApp() {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('openai');
  const [status, setStatus] = useState('');

  useEffect(() => {
    chrome.storage.sync.get(['aiApiKey', 'aiProvider'], (items) => {
      if (items.aiApiKey) setApiKey(items.aiApiKey as string);
      if (items.aiProvider) setProvider(items.aiProvider as string);
    });
  }, []);

  const handleSave = () => {
    chrome.storage.sync.set({ aiApiKey: apiKey, aiProvider: provider }, () => {
      setStatus('Settings saved successfully!');
      setTimeout(() => setStatus(''), 3000);
    });
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-6">APIInspector Settings</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">AI Provider</label>
          <select 
            value={provider} 
            onChange={e => setProvider(e.target.value)}
            className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground mb-4"
          >
            <option value="openai">OpenAI (GPT-4o / GPT-3.5)</option>
            <option value="gemini">Google Gemini (Gemini 1.5)</option>
          </select>

          <label className="block text-sm font-medium mb-1">API Key</label>
          <input 
            type="password" 
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground" 
            placeholder="Enter your API key..." 
          />
          <p className="text-xs text-muted-foreground mt-1">
            Keys are stored securely in your browser's local storage and are never sent to our servers.
          </p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium"
        >
          Save
        </button>
        {status && <div className="text-green-500 text-sm mt-2">{status}</div>}
      </div>
    </div>
  );
}
