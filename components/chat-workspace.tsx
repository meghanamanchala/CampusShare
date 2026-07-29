'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, ArrowLeft, Loader2, Package, MapPin, User } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { sendMessageAction } from '@/app/actions';
import { formatListingDate } from '@/lib/listing-utils';

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

type ChatWorkspaceProps = {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
  listing: {
    id: string;
    title: string;
    imageUrl?: string | null;
    price?: string | null;
    status?: string | null;
    pickupLocation?: string | null;
  };
  otherPartyName: string;
};

export function ChatWorkspace({
  conversationId,
  currentUserId,
  initialMessages,
  listing,
  otherPartyName,
}: ChatWorkspaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Realtime messages subscription
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const contentToSend = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const res = await sendMessageAction(conversationId, contentToSend);
      if (res.status !== 'success') {
        setNewMessage(contentToSend);
      }
    } catch {
      setNewMessage(contentToSend);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto rounded-3xl border border-stone-light bg-white shadow-soft overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-stone-light bg-cream-dark/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <a
            href="/messages"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-stone text-ink-2 hover:bg-stone-light transition"
            title="Back to inbox"
          >
            <ArrowLeft className="h-4 w-4" />
          </a>

          <div>
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-ink-3" />
              <span className="text-sm font-semibold text-ink">
                {otherPartyName}
              </span>
            </div>
            <a
              href={`/listings/${listing.id}`}
              className="text-xs text-ink-3 hover:underline line-clamp-1"
            >
              Listing: <span className="font-medium text-ink-2">{listing.title}</span>
            </a>
          </div>
        </div>

        <a
          href={`/listings/${listing.id}`}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-stone bg-white px-3 py-1.5 text-xs font-medium text-ink hover:bg-stone-light transition"
        >
          <Package className="h-3.5 w-3.5 text-ink-3" />
          View Item
        </a>
      </div>

      {/* Item Summary Banner */}
      {listing.pickupLocation && (
        <div className="flex items-center gap-2 bg-stone-light/60 px-5 py-2 text-xs text-ink-2 border-b border-stone-light">
          <MapPin className="h-3.5 w-3.5 text-ink-3 shrink-0" />
          <span>Pickup Location: <strong className="text-ink">{listing.pickupLocation}</strong></span>
        </div>
      )}

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-ink-3 py-10">
            <p className="text-sm font-medium">Start the conversation</p>
            <p className="mt-1 text-xs max-w-xs">
              Say hi, ask about item availability, or coordinate a pickup spot on campus.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === currentUserId;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isMine
                      ? 'bg-ink text-cream rounded-br-none'
                      : 'bg-cream-dark text-ink rounded-bl-none border border-stone-light'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
                <span className="mt-1 text-[10px] text-ink-3 px-1">
                  {formatListingDate(msg.created_at)}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-stone-light bg-cream/40 p-3 sm:p-4"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Message ${otherPartyName}...`}
          disabled={sending}
          className="flex-1 rounded-2xl border border-stone bg-white px-4 py-3 text-sm placeholder:text-ink-3/60 focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink transition"
        />

        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink text-cream transition hover:bg-ink-2 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>
    </div>
  );
}
