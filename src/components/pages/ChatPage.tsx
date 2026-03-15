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
      <div className="w-64 shrink-0 border-r border-border bg-bg/50 hidden md:block">
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
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
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
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile header bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border glass-subtle md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="btn-press p-2 rounded-xl hover:bg-surface-hover text-text-muted transition-colors cursor-pointer"
          >
            <ChatIcon size={16} />
          </button>
          <button
            onClick={startNewConversation}
            className="btn-press p-2 rounded-xl hover:bg-surface-hover text-text-muted transition-colors cursor-pointer ml-auto"
          >
            <PlusIcon size={16} />
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto relative">
          {/* Top fade gradient */}
          <div className="sticky top-0 h-6 bg-gradient-to-b from-bg to-transparent z-10 pointer-events-none" />

          {!hasMessages && !loading && <EmptyChatState />}

          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl glass border border-border">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-accent" style={{ animation: "pulse 1.2s ease-in-out infinite" }} />
                  <span className="w-2 h-2 rounded-full bg-accent" style={{ animation: "pulse 1.2s ease-in-out infinite", animationDelay: "200ms" }} />
                  <span className="w-2 h-2 rounded-full bg-accent" style={{ animation: "pulse 1.2s ease-in-out infinite", animationDelay: "400ms" }} />
                </div>
              </div>
            </div>
          )}

          <div className="max-w-3xl mx-auto px-4 py-2 space-y-5">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {pending && (
              <StreamingBubble
                content={pending.content}
                sources={pending.sources}
                activeTool={pending.activeTool}
                activeAgent={pending.activeAgent}
              />
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom fade gradient */}
          <div className="sticky bottom-0 h-6 bg-gradient-to-t from-bg to-transparent pointer-events-none" />
        </div>

        {/* Input */}
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
