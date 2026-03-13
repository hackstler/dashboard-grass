import { useRef, useEffect, useState } from "react";
import { useChat } from "../../hooks/useChat";
import { useApp } from "../../context/AppContext";
import { ConversationList } from "../chat/ConversationList";
import { MessageBubble } from "../chat/MessageBubble";
import { StreamingBubble } from "../chat/StreamingBubble";
import { ChatInput } from "../chat/ChatInput";
import { EmptyChatState } from "../chat/EmptyChatState";
import { ChatIcon, PlusIcon } from "../ui/Icons";

export function ChatPage() {
  const { addToast } = useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    conversations,
    activeConversationId,
    messages,
    pending,
    streaming,
    loading,
    error,
    sendMessage,
    selectConversation,
    startNewConversation,
    removeConversation,
    stopStreaming,
  } = useChat();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending?.content]);

  useEffect(() => {
    if (error) addToast(error, "error");
  }, [error, addToast]);

  const hasMessages = messages.length > 0 || pending !== null;

  return (
    <div className="-mx-4 sm:-mx-6 -my-6 sm:-my-8 flex h-[calc(100vh-var(--header-h,0px))]">
      {/* Desktop sidebar */}
      <div className="w-64 shrink-0 border-r border-border bg-bg hidden md:block">
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={selectConversation}
          onNew={startNewConversation}
          onDelete={removeConversation}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 bg-bg border-r border-border animate-slide-in-left">
            <ConversationList
              conversations={conversations}
              activeId={activeConversationId}
              onSelect={(id) => { selectConversation(id); setSidebarOpen(false); }}
              onNew={() => { startNewConversation(); setSidebarOpen(false); }}
              onDelete={removeConversation}
            />
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="btn-press p-1.5 rounded-lg hover:bg-surface-hover text-text-muted cursor-pointer"
          >
            <ChatIcon size={16} />
          </button>
          <button
            onClick={startNewConversation}
            className="btn-press p-1.5 rounded-lg hover:bg-surface-hover text-text-muted cursor-pointer ml-auto"
          >
            <PlusIcon size={16} />
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {!hasMessages && !loading && <EmptyChatState />}

          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {pending && <StreamingBubble content={pending.content} sources={pending.sources} />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <ChatInput
          onSend={sendMessage}
          disabled={streaming}
          streaming={streaming}
          onStop={stopStreaming}
        />
      </div>
    </div>
  );
}
