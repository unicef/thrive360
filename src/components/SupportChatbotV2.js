import React, { useState, useRef, useEffect } from 'react';
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { DynamicTool } from "langchain/tools";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { Client } from "langsmith";
import { LangChainTracer } from "langchain/callbacks";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const SupportChatbotV2 = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: 'Hello! I\'m the THRIVE360 Support Assistant V2. I can help you with both documentation and data queries. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiStatus, setApiStatus] = useState('Initializing system...');
  const [apiReady, setApiReady] = useState(false);
  const [currentTool, setCurrentTool] = useState(null);
  
  const messagesEndRef = useRef(null);
  const llmRef = useRef(null);
  const agentRef = useRef(null);
  const tracerRef = useRef(null);

  // Initialize LLM and tools
  useEffect(() => {
    const setupSystem = async () => {
      try {
        console.log("Initializing support chatbot V2...");

        
        
        // Initialize LangSmith client
        const client = new Client({
          apiKey: process.env.LANGCHAIN_API_KEY,
          apiUrl: "https://api.smith.langchain.com",
        });

        // Initialize tracer
        tracerRef.current = new LangChainTracer({
          projectName: "thrive360-chatbot-v2",
          client,
        });

        // Initialize OpenAI model with tracing
        llmRef.current = new ChatOpenAI({
          openAIApiKey: process.env.REACT_APP_OPENAI_API_KEY,
          modelName: "gpt-4o-mini",
          temperature: 0.7,
          callbacks: [tracerRef.current],
        });

        // Create document chain for better context handling
        const documentChain = await createStuffDocumentsChain({
          llm: llmRef.current,
          prompt: ChatPromptTemplate.fromMessages([
            ["system", "You are a helpful assistant for the THRIVE360 Suite. Use the following context to answer questions. If you don't know the answer from the context, say so rather than making things up.\n\nContext: {context}"],
            ["human", "{question}"]
          ])
        });

        // Create tools with tracing
        const tools = [
          new DynamicTool({
            name: "document_search",
            description: "Search through documentation and knowledge base. Input should be a question or topic to search for.",
            func: async (input) => {
              try {
                setCurrentTool("document_search");
                const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
                const response = await fetch(`${apiUrl}/api/query`, {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                  },
                  body: JSON.stringify({ 
                    query: input, 
                    n_results: 2 
                  }),
                });
                
                if (!response.ok) {
                  const errorText = await response.text();
                  console.error('Document search failed:', errorText);
                  throw new Error(`Document search failed: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                console.log("Document search data:", data);
                
                if (!data.results || data.results.length === 0) {
                  return "NO_RESULTS_FOUND";
                }
                return data.results.map((result, idx) => {
                  return `Result ${idx + 1}:\n` +
                         `${result.content}\n` +
                         `(Source: ${result.metadata?.filename || "unknown"})`;
                }).join("\n\n");

                // Return the results directly since they are already properly formatted
                return data.results.join("\n\n");
              } catch (error) {
                console.error('Document search error:', error);
                throw error;
              } finally {
                setCurrentTool(null);
              }
            },
          }),
          new DynamicTool({
            name: "database_query",
            description: `Query the PostgreSQL database for data. Available tables and columns:
            stores table columns:
            - id: integer, not null — Unique ID for the store
            - storename: text, nullable — Name of the store or health facility
            - countryname: text, nullable — Country in which the store is located
            - iso3: character, nullable — ISO 3166-1 alpha-3 country code
            - sclevel: text, nullable — Supply chain level (e.g., central, regional)
            - storeid: text, nullable — Unique identifier for the store
            - countrycapital: text, nullable — Capital city of the country
            - latitude: numeric, nullable — Latitude coordinate of the store
            - longitude: numeric, nullable — Longitude coordinate of the store
            - parentstore: text, nullable — ID of the parent store (for hierarchical structures)
            - distancetoparent: numeric, nullable — Distance to the parent store in kilometers
            - adminlevel1: text, nullable — First-level administrative division (e.g., state/province)
            - adminlevel2: text, nullable — Second-level administrative division (e.g., district)
            - bcg_min: integer, nullable — Minimum stock threshold for BCG vaccine
            - bcg_max: integer, nullable — Maximum stock threshold for BCG vaccine
            - hepb_min: integer, nullable — Minimum stock threshold for Hepatitis B vaccine
            - hepb_max: integer, nullable — Maximum stock threshold for Hepatitis B vaccine
            - bopv_min: integer, nullable — Minimum stock threshold for bOPV
            - bopv_max: integer, nullable — Maximum stock threshold for bOPV
            - penta_min: integer, nullable — Minimum stock threshold for Pentavalent vaccine
            - penta_max: integer, nullable — Maximum stock threshold for Pentavalent vaccine
            - pcv_min: integer, nullable — Minimum stock threshold for PCV
            - pcv_max: integer, nullable — Maximum stock threshold for PCV
            - rota_min: integer, nullable — Minimum stock threshold for Rotavirus vaccine
            - rota_max: integer, nullable — Maximum stock threshold for Rotavirus vaccine
            - ipv_min: integer, nullable — Minimum stock threshold for IPV
            - ipv_max: integer, nullable — Maximum stock threshold for IPV
            - mcv_min: integer, nullable — Minimum stock threshold for MCV
            - mcv_max: integer, nullable — Maximum stock threshold for MCV
            - yf_min: integer, nullable — Minimum stock threshold for Yellow Fever vaccine
            - yf_max: integer, nullable — Maximum stock threshold for Yellow Fever vaccine
            - mena_min: integer, nullable — Minimum stock threshold for Meningitis A vaccine
            - mena_max: integer, nullable — Maximum stock threshold for Meningitis A vaccine
            - hpv_min: integer, nullable — Minimum stock threshold for HPV vaccine
            - hpv_max: integer, nullable — Maximum stock threshold for HPV vaccine
            - tttddt_min: integer, nullable — Minimum stock threshold for TT/Td vaccine
            - tttddt_max: integer, nullable — Maximum stock threshold for TT/Td vaccine

            stock_reports table columns:
            - id: integer, not null — Unique ID for the stock report entry
            - reportdate: date, nullable — Date of the report
            - countryname: text, nullable — Name of the country reporting stock
            - isclevel: text, nullable — Level in the supply chain (e.g., national, regional, district)
            - storename: text, nullable — Name of the reporting store or facility
            - bcg: integer, nullable — Stock level of BCG vaccine
            - hepb: integer, nullable — Stock level of Hepatitis B vaccine
            - bopv: integer, nullable — Stock level of bivalent oral polio vaccine (bOPV)
            - penta: integer, nullable — Stock level of Pentavalent vaccine
            - pcv: integer, nullable — Stock level of Pneumococcal conjugate vaccine (PCV)
            - rota: integer, nullable — Stock level of Rotavirus vaccine
            - ipv: integer, nullable — Stock level of Inactivated polio vaccine (IPV)
            - mcv: integer, nullable — Stock level of Measles-containing vaccine (MCV)
            - yf: integer, nullable — Stock level of Yellow Fever vaccine
            - mena: integer, nullable — Stock level of Meningitis A vaccine
            - hpv: integer, nullable — Stock level of Human Papillomavirus vaccine
            - covid19: integer, nullable — Stock level of COVID-19 vaccine
            - malaria: integer, nullable — Stock level of malaria treatment or vaccine
            - typhoid: integer, nullable — Stock level of Typhoid vaccine
            - rabies: integer, nullable — Stock level of Rabies vaccine
            - cholera: integer, nullable — Stock level of Cholera vaccine
            - hexa: integer, nullable — Stock level of Hexavalent vaccine
            - bopvsia: integer, nullable — Stock level of bOPV used in Supplementary Immunization Activities (SIA)
            - mopv2sia: integer, nullable — Stock level of monovalent OPV type 2 for SIA
            - nopv2sia: integer, nullable — Stock level of novel OPV type 2 for SIA
            - topvsia: integer, nullable — Stock level of trivalent OPV for SIA
            - ipvsia: integer, nullable — Stock level of IPV for SIA
            - mcvsia: integer, nullable — Stock level of MCV for SIA
            - yfsia: integer, nullable — Stock level of Yellow Fever vaccine for SIA
            - menasia: integer, nullable — Stock level of Meningitis A vaccine for SIA
            - tttdsia: integer, nullable — Stock level of TT/Td vaccine for SIA
            - ads0_05ml: integer, nullable — Quantity of 0.05ml Auto-Disable Syringes
            - ads0_3ml: integer, nullable — Quantity of 0.3ml Auto-Disable Syringes
            - ads_0_5ml: integer, nullable — Quantity of 0.5ml Auto-Disable Syringes
            - ads1ml: integer, nullable — Quantity of 1ml Auto-Disable Syringes
            - rupfsdilution2ml: integer, nullable — Quantity of RUP syringes for 2ml dilution
            - sdilution6ml: integer, nullable — Quantity of standard dilution 6ml syringes
            - sb_5l: integer, nullable — Quantity of 5-liter safety boxes
            - sdilution5ml: integer, nullable — Quantity of standard dilution 5ml syringes
            - level: text, nullable — Reporting level in the system (e.g., L0, L1)
            - iso3: character, nullable — ISO 3166-1 alpha-3 country code
            - storeid: text, nullable — Unique ID of the reporting store

            Input should be a PostgreSQL query or natural language question.
            IMPORTANT: Use ONLY the columns listed above. Do not invent or use any other column names.
            Use PostgreSQL-specific syntax:
            - Use ILIKE for case-insensitive text matching
            - Use ::type for type casting (e.g., '2023-01-01'::date)
            - Use INTERVAL for date arithmetic
            - Use COALESCE for NULL handling
            - Use ARRAY_AGG for array aggregation
            - Use JSONB operators for JSON data`,
            func: async (input) => {
              try {
                setCurrentTool("database_query");
                const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
                const response = await fetch(`${apiUrl}/api/db-query`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    query: input,
                    tables: ['stores', 'stock_reports']
                  }),
                });
                
                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || 'Database query failed');
                }
                
                const data = await response.json();
                
                if (!data.result || data.result.length === 0) {
                  return "NO_RESULTS_FOUND";
                }
                
                // Format the results for better readability
                if (Array.isArray(data.result)) {
                  return data.result.map(row => 
                    Object.entries(row)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join('\n')
                  ).join('\n\n');
                }
                
                return JSON.stringify(data.result, null, 2);
              } catch (error) {
                console.error('Database query error:', error);
                throw error;
              } finally {
                setCurrentTool(null);
              }
            },
          }),
        ];

        // Create prompt template
        const prompt = ChatPromptTemplate.fromMessages([
          ["system", `You are a helpful assistant for the THRIVE360 Suite. You have access to documentation and a database. 
          If a tool returns "NO_RESULTS_FOUND", do not guess the answer or make assumptions. Instead, say you couldn't find any data.
         
          Use the appropriate tools to answer questions.`],
          new MessagesPlaceholder("chat_history"),
          ["human", "{input}"],
          new MessagesPlaceholder("agent_scratchpad"),
        ]);

        // Create agent with tracing
        const agent = await createOpenAIFunctionsAgent({
          llm: llmRef.current,
          tools,
          prompt,
        });

        agentRef.current = AgentExecutor.fromAgentAndTools({
          agent,
          tools,
          verbose: true,
          callbacks: [tracerRef.current],
        });

        setApiStatus("System initialized successfully");
        setApiReady(true);
        console.log("System is ready");
      } catch (error) {
        console.error("Error setting up system:", error);
        setApiStatus(`Error: ${error.message}`);
      }
    };

    setupSystem();
  }, []); // Removed tableDocs from dependencies

  // Handle messages with agent
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
      // Convert messages to chat history format
      const chatHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'human' : 'ai',
        content: msg.text
      }));

      const result = await agentRef.current.invoke({
        input: input,
        chat_history: chatHistory
      }, {
        callbacks: [tracerRef.current],
        metadata: {
          timestamp: new Date().toISOString(),
          user_id: "anonymous", // You might want to add user identification here
          session_id: "current-session", // You might want to track sessions
        }
      });
      
      const botMessage = {
        sender: 'bot',
        text: result.output,
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

  // UI components remain the same as SupportChatbot.js
  // ... (copy the rest of the UI code from SupportChatbot.js)
  
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
        <div className={`absolute bottom-16 right-0 ${isExpanded ? 'w-[800px] h-[600px]' : 'w-80 sm:w-96 h-96'} bg-white rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-300 transition-all duration-300`}>
          {/* Chat header */}
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">THRIVE360 Support V2</h3>
                <p className="text-xs text-blue-100">AI Assistant with Data Access</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded-full hover:bg-blue-700 transition-colors"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>
            </div>
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
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({node, ...props}) => <p className="text-sm whitespace-pre-line" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-4" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-4" {...props} />,
                        li: ({node, ...props}) => <li className="text-sm" {...props} />,
                        table: ({node, ...props}) => <table className="border-collapse border border-gray-300" {...props} />,
                        th: ({node, ...props}) => <th className="border border-gray-300 px-2 py-1 bg-gray-100" {...props} />,
                        td: ({node, ...props}) => <td className="border border-gray-300 px-2 py-1" {...props} />,
                        code: ({node, inline, ...props}) => 
                          inline ? (
                            <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props} />
                          ) : (
                            <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                              <code className="text-sm" {...props} />
                            </pre>
                          ),
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic" {...props} />,
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  </div>
                  <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start mb-3">
                <div className="bg-white text-gray-800 px-4 py-3 rounded-lg rounded-bl-none shadow-sm max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                    {currentTool && (
                      <span className="text-xs text-gray-500">
                        Using {currentTool === 'document_search' ? 'document search' : 'database query'}...
                      </span>
                    )}
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
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about THRIVE360 or query data..."
              className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!apiReady || isTyping}
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

export default SupportChatbotV2; 