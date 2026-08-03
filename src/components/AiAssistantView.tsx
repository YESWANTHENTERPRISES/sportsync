import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, Calendar, MapPin, Check, MessageSquare, AlertCircle } from 'lucide-react';
import { UserProfile, SportFacility, FacilitySlot, Booking } from '../utils/mockDb';
import { MockDatabase } from '../utils/mockDb';

interface AiAssistantProps {
  currentUser: UserProfile;
  facilities: SportFacility[];
  slots: FacilitySlot[];
  onBookingSuccess: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  suggestionCard?: {
    facility: SportFacility;
    slot: FacilitySlot;
    title: string;
  }[];
}

export const AiAssistantView: React.FC<AiAssistantProps> = ({
  currentUser,
  facilities,
  slots,
  onBookingSuccess,
  showToast
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${currentUser.name}! I am your SportSync AI Assistant. ✦\nI can help you book sports slots, check court availability, or suggest matches. Tell me what you'd like to do or use one of the quick options below.`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActionChips = [
    "Book badminton tomorrow 5pm",
    "When is Court 3 free?",
    "Suggest a slot for cricket this week"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleBookSlot = async (facility: SportFacility, slot: FacilitySlot) => {
    setIsLoading(true);
    try {
      const result = await MockDatabase.createBooking({
        user: currentUser,
        facility,
        slot,
        isGroupBooking: false,
        groupSize: 1
      });

      if (result.success) {
        showToast(result.message, 'success');
        onBookingSuccess();
        // Add follow up message from AI confirming booking
        setMessages(prev => [
          ...prev,
          {
            id: `confirm-${Date.now()}`,
            sender: 'ai',
            text: `Awesome! I have successfully booked **${facility.name}** for you on **${slot.date}** at **${slot.startTime} - ${slot.endTime}**. Your booking ID is **${result.booking?.id}**. You can see this under "My Bookings". 🏆`,
            timestamp: new Date()
          }
        ]);
      } else {
        showToast(result.message, 'error');
        setMessages(prev => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            sender: 'ai',
            text: `Sorry, I couldn't complete the booking. ${result.message}`,
            timestamp: new Date()
          }
        ]);
      }
    } catch (e: any) {
      showToast('An error occurred during booking.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI thinking delay
    setTimeout(async () => {
      const cleanText = text.toLowerCase().trim();
      let replyText = "";
      let suggestions: ChatMessage['suggestionCard'] = [];

      // Query parser
      const words = cleanText.split(/\s+/);
      const sportsList = ['badminton', 'cricket', 'football', 'basketball', 'tennis', 'squash', 'volleyball', 'swimming', 'chess'];
      const mentionedSport = sportsList.find(s => cleanText.includes(s));

      if (cleanText.includes('badminton') && (cleanText.includes('tomorrow') || cleanText.includes('5pm') || cleanText.includes('5 pm'))) {
        // Find tomorrow's badminton court 2 or indoor court slots around 5pm (17:00 or 05:00 PM)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        // Find facilities of type Badminton
        const badFacs = facilities.filter(f => f.sportType === 'Badminton' && f.status === 'Active');
        // Let's look for Court 2 primarily
        const targetFac = badFacs.find(f => f.name.includes('Court 2') || f.courtNumber.includes('2')) || badFacs[0];

        if (targetFac) {
          // Find slots for tomorrow, start_time containing '05:00 PM'
          const matchingSlot = slots.find(s => 
            s.facilityId === targetFac.id && 
            s.date === tomorrowStr && 
            (s.startTime.includes('05:00') || s.startTime.includes('17:00') || s.startTime.includes('5:00 PM')) &&
            s.status === 'Available'
          );

          if (matchingSlot) {
            replyText = `I found a free slot for **Badminton** tomorrow at **5:00 PM** on **${targetFac.name}**. You can book it directly with one click below!`;
            suggestions = [{
              facility: targetFac,
              slot: matchingSlot,
              title: 'Tomorrow at 5:00 PM'
            }];
          } else {
            // Find any available badminton slot tomorrow
            const anySlot = slots.find(s => s.facilityId === targetFac.id && s.date === tomorrowStr && s.status === 'Available');
            if (anySlot) {
              replyText = `The 5:00 PM slot is busy, but I found an alternative slot tomorrow on **${targetFac.name}** at **${anySlot.startTime}**.`;
              suggestions = [{
                facility: targetFac,
                slot: anySlot,
                title: `Tomorrow at ${anySlot.startTime}`
              }];
            } else {
              replyText = "I checked tomorrow's badminton schedule, but it looks like all indoor courts are fully booked. Would you like to check outdoor courts or standard slots for the day after?";
            }
          }
        } else {
          replyText = "I couldn't locate any active Badminton facilities in the system database right now.";
        }
      } 
      else if (cleanText.includes('court 3') && (cleanText.includes('free') || cleanText.includes('when') || cleanText.includes('available'))) {
        // Find MG Indoor Badminton Court 3 (fac-bad-in-3) free slots for today or tomorrow
        const targetFac = facilities.find(f => f.id === 'fac-bad-in-3' || f.name.includes('Court 3'));
        
        if (targetFac) {
          const todayStr = new Date().toISOString().split('T')[0];
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split('T')[0];

          // Get first 2 free slots on Court 3
          const courtSlots = slots
            .filter(s => s.facilityId === targetFac.id && (s.date === todayStr || s.date === tomorrowStr) && s.status === 'Available')
            .slice(0, 2);

          if (courtSlots.length > 0) {
            replyText = `Here are the upcoming free slots for **${targetFac.name}** today and tomorrow. Tap below to book:`;
            suggestions = courtSlots.map(s => ({
              facility: targetFac,
              slot: s,
              title: s.date === todayStr ? `Today at ${s.startTime}` : `Tomorrow at ${s.startTime}`
            }));
          } else {
            replyText = `All scheduled slots for **${targetFac.name}** are currently booked. I can help you place a watch on it and alert you if someone cancels!`;
          }
        } else {
          replyText = "I couldn't find Court 3 in the facility database list.";
        }
      } 
      else if (cleanText.includes('cricket') && (cleanText.includes('suggest') || cleanText.includes('slot') || cleanText.includes('this week'))) {
        // Suggest cricket nets slots
        const cricketFacs = facilities.filter(f => f.sportType === 'Cricket' && f.status === 'Active');
        const netFac = cricketFacs.find(f => f.name.includes('Net')) || cricketFacs[0];

        if (netFac) {
          const todayStr = new Date().toISOString().split('T')[0];
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split('T')[0];

          // Find first available net slot
          const netSlot = slots.find(s => s.facilityId === netFac.id && (s.date === todayStr || s.date === tomorrowStr) && s.status === 'Available');

          if (netSlot) {
            replyText = `For Cricket, I highly suggest booking **${netFac.name}** at **${netSlot.startTime}** on **${netSlot.date}** based on lower usage density.`;
            suggestions = [{
              facility: netFac,
              slot: netSlot,
              title: `${netSlot.date === todayStr ? 'Today' : 'Tomorrow'} at ${netSlot.startTime}`
            }];
          } else {
            replyText = "The cricket facilities are highly occupied this week, but I can check the Main Cricket Oval if you have a team match planned.";
          }
        } else {
          replyText = "No active Cricket nets or grounds are registered in the system.";
        }
      } 
      // User greetings
      else if (cleanText.match(/^(hello|hi|hey|greetings|hola|yo|good morning|good afternoon)/)) {
        replyText = `Hello ${currentUser.name}! I am your SportSync AI Assistant. ✦\n\nI can help you:\n- **Find and book court slots** (e.g., *"Book badminton tomorrow"*)\n- **Check court status** (e.g., *"When is Court 3 free?"*)\n- **Explain booking rules** (e.g., *"What is the daily cap?"*)\n- **Guide custom matches** (e.g., *"How do I join a custom sport match?"*)\n\nAsk me anything!`;
      }
      // Rules FAQs
      else if (cleanText.includes('cancel') || cleanText.includes('refund') || cleanText.includes('delete') || cleanText.includes('release')) {
        replyText = "Bookings can be cancelled up to **3 hours** before the slot start time. Once cancelled, the slot is immediately released to other students, and anyone on the waitlist is promoted. You can cancel slots under the **My Bookings** tab.";
      }
      else if (cleanText.includes('limit') || cleanText.includes('cap') || cleanText.includes('many times') || cleanText.includes('restrictions') || cleanText.includes('rule')) {
        replyText = "To ensure fair court availability, students are capped at **1 active slot per sport per day**. Overlapping slot bookings are blocked, and conflict checking is automated. Booking windows open up to 7 days in advance.";
      }
      else if (cleanText.includes('weather') || cleanText.includes('rain') || cleanText.includes('storm') || cleanText.includes('monsoon')) {
        replyText = "Outdoor bookings (cricket oval, football turf, tennis courts) are subject to weather checks. In case of bad weather, administrators issue bulk-cancellation orders. Affected students receive notifications and priority waitlist re-routing.";
      }
      else if (cleanText.includes('fee') || cleanText.includes('pay') || cleanText.includes('cost') || cleanText.includes('price') || cleanText.includes('charge')) {
        replyText = "All sports facilities and equipment bookings on SportSync are **100% free** for registered college students and staff. You only need to verify your ID QR code at the complex gate.";
      }
      else if (cleanText.includes('time') || cleanText.includes('hour') || cleanText.includes('open') || cleanText.includes('close') || cleanText.includes('schedule')) {
        replyText = "Facilities are open daily from **6:00 AM to 9:00 PM**. Peak usage occurs between **5:00 PM and 8:00 PM**. For a quieter game, we recommend choosing morning slots (before 11:00 AM).";
      }
      else if (cleanText.includes('tournament') || cleanText.includes('league') || cleanText.includes('cup') || cleanText.includes('alpha') || cleanText.includes('points')) {
        replyText = "You can view ongoing tournament schedules, team points, and match brackets in the **Tournaments** tab. Your team *Team Alpha* is active in the Monsoon Badminton Clash! Matches are automatically updated by managers.";
      }
      else if (cleanText.includes('custom') || cleanText.includes('public') || cleanText.includes('board') || cleanText.includes('join')) {
        replyText = "If standard courts are booked, you can schedule a match on open grounds (hostel lawns, etc.) using the **Custom Sport ✦** card in the sidebar. Setting it to **Public** displays it on the **Community Board** for others to join!";
      }
      // General Sport Search fallback
      else if (mentionedSport) {
        // Search available slots for the mentioned sport
        const targetFacs = facilities.filter(f => f.sportType.toLowerCase() === mentionedSport && f.status === 'Active');
        const facIds = targetFacs.map(f => f.id);
        const todayStr = new Date().toISOString().split('T')[0];
        
        // Find 2 available slots for this sport
        const matchedSlots = slots
          .filter(s => facIds.includes(s.facilityId) && s.date >= todayStr && s.status === 'Available')
          .slice(0, 2);

        if (matchedSlots.length > 0) {
          replyText = `I searched the live database and found some available slots for **${mentionedSport.charAt(0).toUpperCase() + mentionedSport.slice(1)}**! Tap below to book:`;
          suggestions = matchedSlots.map(s => {
            const fac = targetFacs.find(f => f.id === s.facilityId)!;
            return {
              facility: fac,
              slot: s,
              title: `${s.date === todayStr ? 'Today' : s.date} at ${s.startTime}`
            };
          });
        } else {
          replyText = `I checked the schedules for **${mentionedSport}**, but it looks like standard courts are fully booked. You can create a custom match for **${mentionedSport}** at open lawns and invite others to join!`;
        }
      }
      // General NLP Fallback
      else {
        const queryTopic = words.length > 2 ? words.slice(0, 3).join(' ') : cleanText;
        replyText = `I've analyzed your question regarding "${queryTopic}". I can help with court scheduling, rules, tournaments, or custom matches.\n\nCould you clarify if you want to search available slots, look up active tournament brackets, or check daily cap rules?`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: replyText,
          timestamp: new Date(),
          suggestionCard: suggestions.length > 0 ? suggestions : undefined
        }
      ]);
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] ai-chat-container border rounded-3xl overflow-hidden shadow-2xl">
      
      {/* Header */}
      <div className="px-6 py-4 ai-chat-header flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5 font-heading">
              SportSync AI Assistant
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">Real-time Booking & Court Audit Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] text-slate-400 font-semibold font-mono">Agent Active</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 ai-chat-bg-area scrollbar-thin scrollbar-thumb-slate-200">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-semibold ${
              msg.sender === 'user' 
                ? 'ai-chat-avatar-user' 
                : 'ai-chat-avatar-ai'
            }`}>
              {msg.sender === 'user' ? currentUser.name.charAt(0) : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className="space-y-3">
              <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'ai-chat-bubble-user rounded-tr-none'
                  : 'ai-chat-bubble-ai rounded-tl-none'
              }`}>
                {msg.text.split('\n').map((para, i) => (
                  <p key={i} className={i > 0 ? 'mt-2' : ''}>
                    {para.startsWith('-') ? (
                      <span className="block pl-4 -indent-4">{para}</span>
                    ) : (
                      // Simple markdown bold conversion
                      para.split('**').map((part, idx) => idx % 2 === 1 ? <strong key={idx} className="font-bold text-white">{part}</strong> : part)
                    )}
                  </p>
                ))}
              </div>

              {/* Suggestions Cards (Page 14 specific CTA styled cards) */}
              {msg.suggestionCard && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 w-full sm:w-[480px]">
                  {msg.suggestionCard.map((sug, idx) => (
                    <div 
                      key={idx}
                      className="bg-[#1E2640]/90 border border-slate-700/60 rounded-2xl p-4 space-y-3 shadow-lg hover:border-blue-500/40 transition flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold rounded-full font-mono uppercase">
                            {sug.facility.sportType}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono font-semibold">
                            {sug.title}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{sug.facility.name}</h4>
                        <div className="space-y-1 text-[10px] text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">{sug.facility.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{sug.slot.startTime} - {sug.slot.endTime}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleBookSlot(sug.facility, sug.slot)}
                        className="w-full mt-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/10 cursor-pointer"
                      >
                        Book This
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Timestamp */}
              <div className="text-[9px] text-slate-550 font-mono px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {/* Pulsing loading dot state */}
        {isLoading && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-350 border border-slate-700/60 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="ai-chat-bubble-ai rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">AI is searching slots</span>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse-green"></span>
                <style>{`
                  @keyframes pulseGreen {
                    0%, 100% { transform: scale(0.7); opacity: 0.4; }
                    50% { transform: scale(1.3); opacity: 1; }
                  }
                  .animate-pulse-green {
                    animation: pulseGreen 1.2s infinite ease-in-out;
                  }
                `}</style>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Chips Bar */}
      <div className="px-6 py-2.5 ai-chat-chips-bar flex flex-wrap items-center gap-2">
        <span className="text-[9px] font-bold text-slate-500 font-mono uppercase mr-1">Suggestions:</span>
        {quickActionChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            disabled={isLoading}
            className="ai-chat-chip text-[10px] px-3 py-1.5 font-medium rounded-full transition cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-4 ai-chat-input-bar">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="flex items-center gap-3 relative"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder="Book a slot, ask about courts, or describe your game..."
            className="flex-1 rounded-2xl px-5 py-3.5 text-xs outline-none transition disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition active:scale-95 disabled:bg-slate-800 disabled:text-slate-650 cursor-pointer shadow-lg shadow-blue-600/20 hover:shadow-blue-500/45 hover:shadow-[0_0_15px_rgba(59,130,246,0.55)] border border-blue-500/30"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
