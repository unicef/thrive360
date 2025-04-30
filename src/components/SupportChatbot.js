import React, { useState, useRef, useEffect } from 'react';
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const SupportChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: 'Hello! I\'m the THRIVE360 Support Assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiStatus, setApiStatus] = useState('Connecting to knowledge base...');
  const [apiReady, setApiReady] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  
  const messagesEndRef = useRef(null);
  const llmRef = useRef(null);
  
  // Initialize LLM and check API health
  useEffect(() => {
    const setupSystem = async () => {
      try {
        console.log("Initializing support chatbot...");
        
        // Initialize OpenAI model
        llmRef.current = new ChatOpenAI({
          openAIApiKey: process.env.REACT_APP_OPENAI_API_KEY,
          modelName: "gpt-4o-mini", // Or your preferred model
          temperature: 0.7
        });
        
        // Check API health
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        console.log(`Checking Chroma API health at: ${apiUrl}/api/health`);
        
        const response = await fetch(`${apiUrl}/api/health`);
        
        if (response.ok) {
          const health = await response.json();
          console.log("API Health Response:", health);
          
          if (health.status === "healthy") {
            setApiStatus("Knowledge base connected successfully");
            setApiReady(true);
            console.log("API is healthy and ready");
            
            // Also check what collections are available
            const collectionsResponse = await fetch(`${apiUrl}/api/collections`);
            if (collectionsResponse.ok) {
              const collections = await collectionsResponse.json();
              console.log("Available collections:", collections);
            }
          } else {
            setApiStatus(`Knowledge base status: ${health.database || "unknown"}`);
            console.warn("API is not fully healthy:", health);
          }
        } else {
          console.error("API health check failed with status:", response.status);
          setApiStatus("Cannot connect to knowledge base API");
        }
      } catch (error) {
        console.error("Error setting up system:", error);
        setApiStatus(`Error: ${error.message}`);
      }
    };

    setupSystem();
  }, []);

  // RAG query function using our API
  const queryRAG = async (question) => {
    if (!llmRef.current) {
      return "Sorry, my model is still initializing. Please try again in a moment.";
    }
    
    if (!apiReady) {
      console.warn("API not ready, using built-in responses");
      return getBuiltInResponse(question);
    }
    
    try {
      console.log("Querying Chroma API with:", question);
      
      // Step 1: Retrieve relevant documents using our API
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: question,
          n_results: 5
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API query failed with status ${response.status}:`, errorText);
        throw new Error(`Failed to fetch from knowledge base (${response.status})`);
      }
      
      const data = await response.json();
      console.log("API Response:", data);
      
      const retrievedDocs = data.documents || [];
      console.log("Retrieved documents:", retrievedDocs.length);
      
      if (retrievedDocs.length === 0) {
        console.log("No documents found, using built-in responses");
        return getBuiltInResponse(question);
      }
      
      // Step 2: Format prompt with retrieved context and question
      const promptTemplate = ChatPromptTemplate.fromMessages([
        ["system", "You are a helpful assistant for the THRIVE360 Suite, a comprehensive platform for vaccine supply chain management. Answer based on the following information. If you don't know the answer from this context, say so rather than making things up.\n\nContext: {context}"],
        ["human", "{question}"]
      ]);
      
      const docsContent = retrievedDocs.join("\n\n");
      
      const messages = await promptTemplate.invoke({
        context: docsContent,
        question: question
      });
      
      // Step 3: Generate answer
      const aiResponse = await llmRef.current.invoke(messages);
      
      // If debug mode is on, add context info
      if (debugMode) {
        return `${aiResponse.content}\n\n---\n*Debug: Found ${retrievedDocs.length} relevant docs*`;
      }
      
      return aiResponse.content;
    } catch (error) {
      console.error('RAG error:', error);
      return "I encountered an error while searching for information. " + error.message;
    }
  };
  
  // Built-in responses as a fallback
  const getBuiltInResponse = (question) => {
    const lowerQuestion = question.toLowerCase();
    
    // General THRIVE360 questions
    if (lowerQuestion.includes('what is thrive360') || lowerQuestion.includes('thrive360 suite')) {
      return 'THRIVE360 is a comprehensive platform for vaccine supply chain management. It includes tools for stock-out prediction, analytics, ticket management, forecasting, equipment monitoring, and sustainability tracking.';
    }
    
    // AI Models questions
    if (lowerQuestion.includes('ai model') || lowerQuestion.includes('machine learning') || lowerQuestion.includes('prediction')) {
      return 'Our AI models predict stock-out probability with up to 100% accuracy for some vaccines like HepB. They analyze factors such as utilization trends, geographic information, weather patterns, and historical data to help prevent stock-outs before they occur.';
    }
    
    // Dashboard questions
    if (lowerQuestion.includes('dashboard') || lowerQuestion.includes('analytics')) {
      return 'The THRIVE360 Analytics dashboard provides visual insights into your supply chain performance. It displays key metrics, trends, and predictions using PowerBI integration to help you make data-driven decisions.';
    }
    
    // PowerBI specific questions
    if (lowerQuestion.includes('power bi') || lowerQuestion.includes('powerbi')) {
      return 'THRIVE360 was initially developed as an in-house Power BI dashboard before evolving into a comprehensive solution used by GAVI, Country Offices, and other partners.';
    }
    
    // Fallback for unknown questions
    return "I don't have specific information about that in my knowledge base. Could you try rephrasing your question or ask about another aspect of THRIVE360?";
  };

  // Message handling
  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    
    const userMessage = {
      sender: 'user',
      text: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    try {
      const answer = await queryRAG(input);
      
      const botMessage = {
        sender: 'bot',
        text: answer,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error in chat:', error);
      
      const errorMessage = {
        sender: 'bot',
        text: "I'm having trouble processing your request. Please try again.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Scroll functionality
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Toggle debug mode with Alt+D keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key === 'd') {
        setDebugMode(prev => !prev);
        console.log("Debug mode:", !debugMode);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [debugMode]);

  // UI
  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chat toggle button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center ${isOpen ? 'bg-red-500' : 'bg-blue-600'} text-white`}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
      
      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-96 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-300">
          {/* Chat header */}
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">THRIVE360 Support</h3>
                <p className="text-xs text-blue-100">AI Assistant</p>
              </div>
            </div>
            {debugMode && (
              <span className="text-xs bg-yellow-400 text-black px-2 py-1 rounded">Debug Mode</span>
            )}
          </div>
          
          {/* Database status message */}
          {!apiReady && (
            <div className="bg-blue-50 px-4 py-2 text-xs text-blue-800">
              {apiStatus}
              <div className="w-full mt-1 h-1 bg-blue-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
          
          {/* Chat messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`mb-3 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`px-4 py-3 rounded-lg max-w-[80%] ${
                    message.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 shadow-sm rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start mb-3">
                <div className="bg-white text-gray-800 px-4 py-3 rounded-lg rounded-bl-none shadow-sm max-w-[80%]">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Chat input */}
          <div className="border-t border-gray-200 p-3 flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about THRIVE360..."
              className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!apiReady && isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={input.trim() === '' || isTyping || !apiReady}
              className={`px-4 py-2 rounded-r-lg ${
                input.trim() === '' || isTyping || !apiReady
                  ? 'bg-gray-300 text-gray-500' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportChatbot; 