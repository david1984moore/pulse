import { useState, useEffect, useRef } from "react";
import { Bill } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import AliceCssEcg from "./alice-css-ecg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Loader2, DollarSign, MessageSquare } from "lucide-react";
import { secureApiRequest } from "@/lib/csrf";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/hooks/use-language";
import { TypeAnimation } from "@/components/ui/type-animation";

interface ChatbotProps {
  bills: Bill[];
}

interface Message {
  text: string;
  sender: "user" | "bot";
  isAnimating?: boolean;
}

export default function ChatbotNew({ bills }: ChatbotProps) {
  const { t, language } = useLanguage();
  
  // UI State
  const [selectedAmount, setSelectedAmount] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustomAmount, setIsCustomAmount] = useState<boolean>(false);
  const [freeFormQuestion, setFreeFormQuestion] = useState<string>("");
  const [questionMode, setQuestionMode] = useState<"amount" | "freeform">("amount");
  const [isPending, setIsPending] = useState(false);

  // Chat messages
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm Alice. Ask me about your finances.",
      sender: "bot",
      isAnimating: true,
    },
  ]);

  // Scroll area for messages
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Handle text animation completion
  const handleAnimationComplete = (index: number) => {
    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages];
      if (updatedMessages[index]) {
        updatedMessages[index] = { ...updatedMessages[index], isAnimating: false };
      }
      return updatedMessages;
    });
  };

  // Toggle custom amount mode
  useEffect(() => {
    if (selectedAmount === "custom") {
      setIsCustomAmount(true);
      setSelectedAmount(null);
    }
  }, [selectedAmount]);

  // Submit handler
  const handleSubmit = async () => {
    if (questionMode === "amount") {
      const amountToUse = isCustomAmount ? customAmount : (selectedAmount || "");
      if (!amountToUse) return;

      const userMessage = `Can I spend $${amountToUse}?`;
      setMessages(prev => [...prev, { text: userMessage, sender: "user" }]);
      
      setIsPending(true);
      try {
        const response = await secureApiRequest("POST", "/api/spending-advisor", { amount: amountToUse });
        const data = await response.json();
        
        setMessages(prev => [...prev, { text: data.message, sender: "bot", isAnimating: true }]);
      } catch (error) {
        console.error("Error:", error);
        setMessages(prev => [...prev, { 
          text: "Sorry, I had trouble processing that request. Please try again.", 
          sender: "bot", 
          isAnimating: true 
        }]);
      } finally {
        setIsPending(false);
        setSelectedAmount(null);
        setIsCustomAmount(false);
        setCustomAmount("");
      }
    } else {
      if (!freeFormQuestion.trim()) return;
      
      setMessages(prev => [...prev, { text: freeFormQuestion, sender: "user" }]);
      
      setIsPending(true);
      try {
        // This endpoint will be implemented later
        const response = await secureApiRequest("POST", "/api/financial-advisor", { query: freeFormQuestion });
        const data = await response.json();
        
        setMessages(prev => [...prev, { text: data.message, sender: "bot", isAnimating: true }]);
      } catch (error) {
        console.error("Error:", error);
        setMessages(prev => [...prev, { 
          text: "I'm still learning to answer that type of question. Try asking about your spending or bills.", 
          sender: "bot", 
          isAnimating: true 
        }]);
      } finally {
        setIsPending(false);
        setFreeFormQuestion("");
      }
    }
  };

  return (
    <div className="relative">
      <Card className="backdrop-blur-xl bg-white/90 shadow-xl border-none overflow-hidden rounded-2xl relative z-10 border-t border-l border-white/40">
        <CardHeader className="pb-4 border-b border-primary-100/30 bg-gradient-to-r from-primary/20 to-primary/10">
          <div className="flex flex-row items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center px-5 py-2.5">
                {/* Avatar */}
                <div className="relative h-12 w-12 mr-3">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-primary to-primary-600 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse rounded-xl overflow-hidden" 
                       style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-xl font-bold tracking-wide text-primary-600 relative">
                    <span className="relative">
                      <span className="absolute -inset-1 bg-gradient-to-r from-primary/5 to-transparent rounded-lg blur-sm opacity-70"></span>
                      <span className="relative">Alice</span>
                      <span className="ml-1.5 text-xs font-medium text-primary-500 opacity-70 tracking-wider">v2.0</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-5">
          {/* Chat message area */}
          <ScrollArea 
            ref={scrollAreaRef} 
            className="bg-gradient-to-b from-white/70 to-white/40 backdrop-blur-lg rounded-xl p-4 mb-5 h-72 border border-primary-100/30 shadow-inner relative overflow-hidden"
          >
            {/* Messages display */}
            {messages.map((message, index) => (
              <div key={index} className="mb-6 relative z-10">
                <div
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Bot avatar */}
                  {message.sender === "bot" && (
                    <div className="relative flex-shrink-0 h-8 w-8 mr-3">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-primary to-primary-600" 
                           style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">A</span>
                      </div>
                    </div>
                  )}

                  <div
                    className={`max-w-sm relative ${
                      message.sender === "user"
                        ? "text-right"
                        : ""
                    }`}
                  >
                    {/* Message content */}
                    <div className="relative z-10">
                      <p className={`text-base leading-relaxed relative z-10 ${
                          message.sender === "user" 
                            ? "text-primary-600 font-medium" 
                            : "text-gray-700"
                        }`}
                      >
                        {message.sender === "bot" && message.isAnimating ? (
                          <TypeAnimation 
                            text={message.text} 
                            speed={12}
                            onComplete={() => handleAnimationComplete(index)}
                          />
                        ) : (
                          message.text
                        )}
                      </p>
                    </div>
                    
                    {/* Timestamp */}
                    <div className={`text-[10px] mt-1 ${message.sender === "user" ? "text-right text-primary-500" : "text-primary-400"}`}>
                      <span className="font-mono tracking-wider">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>

          {/* Question mode toggle */}
          <div className="mb-3 flex justify-center">
            <div className="inline-flex items-center p-1 bg-primary-50/50 backdrop-blur-sm rounded-lg border border-primary-100/50">
              <button
                onClick={() => setQuestionMode("amount")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  questionMode === "amount"
                    ? "bg-white text-primary-700 shadow-sm"
                    : "text-primary-600 hover:bg-white/50"
                }`}
              >
                <DollarSign className="h-3.5 w-3.5 inline-block mr-1.5" />
                Spending
              </button>
              <button
                onClick={() => setQuestionMode("freeform")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  questionMode === "freeform"
                    ? "bg-white text-primary-700 shadow-sm"
                    : "text-primary-600 hover:bg-white/50"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5 inline-block mr-1.5" />
                Questions
              </button>
            </div>
          </div>

          {/* Input area */}
          <div className="p-5 rounded-xl bg-gradient-to-b from-white/90 to-white/70 backdrop-blur-lg border border-primary-50 shadow-sm relative">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 relative z-10">
              {questionMode === "amount" ? (
                // Amount-based question inputs
                isCustomAmount ? (
                  // Custom amount input
                  <div className="flex w-full sm:flex-1">
                    <div className="relative flex-1">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                        <span className="text-primary-600 font-bold filter drop-shadow-sm">$</span>
                      </div>
                      
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full pl-8 pr-4 py-2.5 border-0 bg-primary-50/30 text-primary-900 rounded-lg 
                                   focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white/80 
                                   shadow-inner transition-all duration-150 backdrop-blur-sm"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && customAmount && !isPending) {
                            handleSubmit();
                          }
                        }}
                      />
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-2"
                      onClick={() => {
                        setIsCustomAmount(false);
                        setCustomAmount("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  // Amount select dropdown
                  <Select value={selectedAmount || ""} onValueChange={setSelectedAmount}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select an amount to spend" />
                    </SelectTrigger>
                    
                    <SelectContent>
                      <SelectItem value="10">$10</SelectItem>
                      <SelectItem value="25">$25</SelectItem>
                      <SelectItem value="50">$50</SelectItem>
                      <SelectItem value="100">$100</SelectItem>
                      <SelectItem value="200">$200</SelectItem>
                      <SelectItem value="custom">Custom amount</SelectItem>
                    </SelectContent>
                  </Select>
                )
              ) : (
                // Free-form question input
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    value={freeFormQuestion}
                    onChange={(e) => setFreeFormQuestion(e.target.value)}
                    placeholder="Ask about your finances, bills, budget, or savings..."
                    className="w-full px-4 py-2.5 border-0 bg-primary-50/30 text-primary-900 rounded-lg 
                              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white/80 
                              shadow-inner transition-all duration-150 backdrop-blur-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && freeFormQuestion.trim() && !isPending) {
                        handleSubmit();
                      }
                    }}
                  />
                </div>
              )}
              
              {/* Submit button or loading indicator */}
              {isPending ? (
                <div className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-primary-600/90 text-white 
                                flex items-center justify-center relative overflow-hidden group">
                  <div className="relative z-10 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="font-medium tracking-wide">Thinking...</span>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-md"
                >
                  {questionMode === "freeform" ? "Ask" : "Calculate"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}