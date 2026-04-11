import ChatInterface from '../../components/ChatInterface';

export default function GuideChat() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Messages</h1>
        <p className="text-slate-500">Communicate with your tourists in real-time.</p>
      </div>
      <ChatInterface />
    </div>
  );
}