import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, MessageSquare, X, Send } from 'lucide-react';

interface AIAssistantProps {
  chartData?: any[];
  chartType?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  chartData = [],
  chartType = '',
  isOpen,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleQuery(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }

    synthesisRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = (text: string) => {
    if (synthesisRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      synthesisRef.current.speak(utterance);
    }
  };

  const analyzeData = (query: string) => {
    if (!chartData.length) return "No data available for analysis.";

    const lowerQuery = query.toLowerCase();
    const totalRecords = chartData.length;
    const fields = Object.keys(chartData[0] || {});
    
    // Salary analysis
    if (lowerQuery.includes('salary') || lowerQuery.includes('pay') || lowerQuery.includes('compensation')) {
      if (chartData[0].salary) {
        const salaries = chartData.map(d => parseFloat(d.salary) || 0).filter(s => s > 0);
        const avgSalary = salaries.reduce((a, b) => a + b, 0) / salaries.length;
        const maxSalary = Math.max(...salaries);
        const minSalary = Math.min(...salaries);
        
        if (chartData[0].department) {
          const deptSalaries = chartData.reduce((acc, emp) => {
            const dept = emp.department;
            const salary = parseFloat(emp.salary) || 0;
            if (!acc[dept]) acc[dept] = [];
            acc[dept].push(salary);
            return acc;
          }, {} as Record<string, number[]>);
          
          const deptAvgs = Object.entries(deptSalaries).map(([dept, salaries]) => ({
            dept,
            avg: salaries.reduce((a, b) => a + b, 0) / salaries.length
          })).sort((a, b) => b.avg - a.avg);
          
          return `Salary Analysis:\n• Highest paying: ${deptAvgs[0].dept} ($${deptAvgs[0].avg.toLocaleString()})\n• Lowest paying: ${deptAvgs[deptAvgs.length-1].dept} ($${deptAvgs[deptAvgs.length-1].avg.toLocaleString()})\n• Overall average: $${avgSalary.toLocaleString()}\n• Range: $${minSalary.toLocaleString()} - $${maxSalary.toLocaleString()}`;
        }
        return `Salary insights: Average $${avgSalary.toLocaleString()}, ranging from $${minSalary.toLocaleString()} to $${maxSalary.toLocaleString()}`;
      }
    }
    
    // Performance analysis
    if (lowerQuery.includes('performance') || lowerQuery.includes('score')) {
      if (chartData[0].performance_score) {
        const scores = chartData.map(d => parseFloat(d.performance_score) || 0);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const topPerformers = chartData.filter(d => parseFloat(d.performance_score) > avgScore * 1.2);
        const lowPerformers = chartData.filter(d => parseFloat(d.performance_score) < avgScore * 0.8);
        
        return `Performance Analysis:\n• Average score: ${avgScore.toFixed(1)}/10\n• High performers: ${topPerformers.length} employees\n• Low performers: ${lowPerformers.length} employees\n• Top performer: ${topPerformers[0]?.name || 'N/A'} (${topPerformers[0]?.performance_score || 'N/A'})`;
      }
    }
    
    // Outlier detection
    if (lowerQuery.includes('outlier') || lowerQuery.includes('unusual')) {
      const outliers = [];
      
      if (chartData[0].salary) {
        const salaries = chartData.map(d => parseFloat(d.salary) || 0);
        const avgSalary = salaries.reduce((a, b) => a + b, 0) / salaries.length;
        const highSalaryOutliers = chartData.filter(d => parseFloat(d.salary) > avgSalary * 1.5);
        
        if (highSalaryOutliers.length > 0) {
          outliers.push(`High salary: ${highSalaryOutliers.map(e => `${e.name} ($${parseFloat(e.salary).toLocaleString()})`).slice(0,3).join(', ')}`);
        }
      }
      
      return outliers.length > 0 ? 
        `Outlier Analysis:\n${outliers.map(o => `• ${o}`).join('\n')}` :
        'No significant outliers detected in the current data.';
    }
    
    // Department comparison
    if (lowerQuery.includes('department') || lowerQuery.includes('compare')) {
      if (chartData[0].department && chartData[0].salary) {
        const deptStats = chartData.reduce((acc, emp) => {
          const dept = emp.department;
          if (!acc[dept]) acc[dept] = { salaries: [], scores: [], count: 0 };
          acc[dept].salaries.push(parseFloat(emp.salary) || 0);
          if (emp.performance_score) acc[dept].scores.push(parseFloat(emp.performance_score) || 0);
          acc[dept].count++;
          return acc;
        }, {} as Record<string, any>);
        
        const deptAnalysis = Object.entries(deptStats).map(([dept, stats]) => ({
          dept,
          avgSalary: stats.salaries.reduce((a: number, b: number) => a + b, 0) / stats.salaries.length,
          avgScore: stats.scores.length > 0 ? stats.scores.reduce((a: number, b: number) => a + b, 0) / stats.scores.length : 0,
          count: stats.count
        })).sort((a, b) => b.avgSalary - a.avgSalary);
        
        return `Department Comparison:\n${deptAnalysis.map(d => 
          `• ${d.dept}: $${d.avgSalary.toLocaleString()} avg, ${d.avgScore.toFixed(1)} performance (${d.count} employees)`
        ).join('\n')}`;
      }
    }

    // Top performers
    if (lowerQuery.includes('top') || lowerQuery.includes('best')) {
      if (chartData[0].performance_score) {
        const sorted = [...chartData].sort((a, b) => parseFloat(b.performance_score) - parseFloat(a.performance_score));
        const top3 = sorted.slice(0, 3);
        return `Top Performers:\n${top3.map((emp, i) => 
          `${i+1}. ${emp.name}: ${emp.performance_score}/10 (${emp.department})`
        ).join('\n')}`;
      }
      if (chartData[0].salary) {
        const sorted = [...chartData].sort((a, b) => parseFloat(b.salary) - parseFloat(a.salary));
        const top3 = sorted.slice(0, 3);
        return `Highest Earners:\n${top3.map((emp, i) => 
          `${i+1}. ${emp.name}: $${parseFloat(emp.salary).toLocaleString()} (${emp.department})`
        ).join('\n')}`;
      }
    }
    
    // Default overview
    const insights = [];
    if (chartData[0].salary) {
      const avgSalary = chartData.reduce((sum, emp) => sum + (parseFloat(emp.salary) || 0), 0) / totalRecords;
      insights.push(`Average salary: $${avgSalary.toLocaleString()}`);
    }
    if (chartData[0].performance_score) {
      const avgScore = chartData.reduce((sum, emp) => sum + (parseFloat(emp.performance_score) || 0), 0) / totalRecords;
      insights.push(`Average performance: ${avgScore.toFixed(1)}/10`);
    }
    if (chartData[0].department) {
      const depts = [...new Set(chartData.map(d => d.department))];
      insights.push(`${depts.length} departments`);
    }
    
    return `Dataset Overview (${totalRecords} records):\n${insights.map(i => `• ${i}`).join('\n')}\n\nTry: "Compare departments", "Find outliers", "Show top performers"`;
  };

  const generateInsights = (query: string) => {
    const analysis = analyzeData(query);
    
    const getRecommendation = () => {
      const lowerQuery = query.toLowerCase();
      
      if (lowerQuery.includes('salary')) {
        return "Consider salary equity audits to ensure fair compensation across departments.";
      }
      if (lowerQuery.includes('performance')) {
        return "Identify training opportunities for low performers and recognize high achievers.";
      }
      if (lowerQuery.includes('outlier')) {
        return "Investigate outliers to understand exceptional cases and learning opportunities.";
      }
      if (lowerQuery.includes('department')) {
        return "Focus on knowledge sharing between high and low performing departments.";
      }
      
      return "Drill down into specific segments for actionable business insights.";
    };

    return `${analysis}\n\n💡 Recommendation: ${getRecommendation()}`;
  };

  const handleQuery = async (query: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const response = generateInsights(query);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      const spokenResponse = response.split('\n')[0].replace(/[•$]/g, '').substring(0, 150);
      speak(spokenResponse);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm having trouble analyzing the data right now. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      handleQuery(textInput);
      setTextInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl h-3/4 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Business Assistant
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Ask me about your data!</p>
              <p className="text-sm mb-4">
                Analyzing {chartData.length} records with {Object.keys(chartData[0] || {}).length} fields
              </p>
              <div className="text-xs space-y-1">
                <p>💰 "Compare salary by department"</p>
                <p>📊 "Find performance outliers"</p>
                <p>🔍 "Show me the top performers"</p>
                <p>📈 "Analyze department trends"</p>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <form onSubmit={handleTextSubmit} className="flex space-x-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={chartData.length > 0 ? `Ask about your ${chartData.length} records...` : "Ask about your data..."}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`px-3 py-2 rounded-md ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300'
              }`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};