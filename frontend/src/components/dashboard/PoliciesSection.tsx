import { useState, useEffect } from 'react';
import {
    Search, Brain, Eye, Download, CheckCircle, Clock, X, FileText
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

const PoliciesSection = () => {
    const [policies, setPolicies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
    const [showPolicyModal, setShowPolicyModal] = useState(false);
    const [policyContent, setPolicyContent] = useState('');
    const [aiSearchQuery, setAiSearchQuery] = useState('');
    const [aiPolicyAnswer, setAiPolicyAnswer] = useState('');
    const [isAiSearching, setIsAiSearching] = useState(false);

    useEffect(() => {
        fetchPolicies();
    }, []);

    const fetchPolicies = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/ai/policies`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPolicies(data.policies || []);
            }
        } catch (error) {
            console.error('Error fetching policies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewPolicy = async (filename: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/ai/policies/${filename}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPolicyContent(data.content);
                setSelectedPolicy(policies.find(p => p.filename === filename));
                setShowPolicyModal(true);
            } else {
                alert('Failed to load policy content');
            }
        } catch (error) {
            console.error('Error fetching policy content:', error);
            alert('Error loading policy');
        }
    };

    const handleAiPolicySearch = async () => {
        if (!aiSearchQuery.trim()) return;
        setIsAiSearching(true);
        setAiPolicyAnswer('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/ai/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ query: aiSearchQuery })
            });

            if (response.ok) {
                const data = await response.json();
                setAiPolicyAnswer(data.answer);
            } else {
                setAiPolicyAnswer('Sorry, I could not process your query at the moment.');
            }
        } catch (error) {
            console.error("AI Search Error:", error);
            setAiPolicyAnswer('Network error. Please try again.');
        } finally {
            setIsAiSearching(false);
        }
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="w-8 h-8 text-emerald-500 mr-2" />
                Policy & Compliance Center
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search policies..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                                    value={aiSearchQuery}
                                    onChange={(e) => setAiSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAiPolicySearch()}
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleAiPolicySearch}
                            disabled={isAiSearching}
                            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2"
                        >
                            {isAiSearching ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Searching...</span>
                                </>
                            ) : (
                                <span>Search with AI</span>
                            )}
                        </button>
                    </div>

                    {aiPolicyAnswer && (
                        <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
                            <div className="flex items-start space-x-3">
                                <Brain className="w-6 h-6 text-blue-600 mt-1" />
                                <div className="flex-1">
                                    <h4 className="font-bold text-blue-800 mb-1">AI Answer:</h4>
                                    <p className="text-blue-900 whitespace-pre-wrap">{aiPolicyAnswer}</p>
                                </div>
                                <button
                                    onClick={() => setAiPolicyAnswer('')}
                                    className="text-blue-400 hover:text-blue-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Company Policies</h3>
                    <div className="space-y-3">
                        {loading ? (
                            <div className="text-center py-10 text-gray-500">Loading policies...</div>
                        ) : policies.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No policies found. Please check back later.</p>
                        ) : (
                            policies.map((policy) => (
                                <div key={policy.filename} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{policy.title}</h4>
                                            <div className="flex items-center space-x-4 mt-1">
                                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-xs">{policy.category}</span>
                                                <span className="text-sm text-gray-500">Updated: {policy.lastUpdated}</span>
                                                <span className="text-sm text-gray-400 text-xs">{policy.size}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleViewPolicy(policy.filename)}
                                                className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                                                title="View Policy"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Download">
                                                <Download className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Policy Assistant</h3>
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100 mb-6">
                        <div className="flex items-start space-x-3">
                            <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-blue-800">Ask AI About Policies</p>
                                <p className="text-sm text-blue-600 mt-1">
                                    Use natural language to understand complex policies and compliance requirements.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="font-medium text-gray-700 mb-3">Compliance Checklist</h4>
                        <div className="space-y-2">
                            {[
                                { task: 'Code of Conduct Acknowledgment', completed: true },
                                { task: 'Data Privacy Training', completed: true },
                                { task: 'Annual Security Training', completed: false },
                                { task: 'Diversity & Inclusion Course', completed: true },
                            ].map((item, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    {item.completed ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <Clock className="w-5 h-5 text-yellow-500" />
                                    )}
                                    <span className={item.completed ? 'text-gray-600 font-medium' : 'text-gray-900 font-medium'}>{item.task}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-3">Quick Access</h4>
                        <div className="space-y-2">
                            <button className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                                Employee Handbook
                            </button>
                            <button className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                                Leave Policy
                            </button>
                            <button className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                                Remote Work Guidelines
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Policy Modal */}
            {showPolicyModal && selectedPolicy && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedPolicy.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{selectedPolicy.category} • Last Updated: {selectedPolicy.lastUpdated}</p>
                            </div>
                            <button
                                onClick={() => setShowPolicyModal(false)}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto flex-1 bg-white font-mono text-sm leading-relaxed text-gray-700">
                            <pre className="whitespace-pre-wrap font-sans">{policyContent}</pre>
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowPolicyModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Close
                            </button>
                            <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2">
                                <Download className="w-4 h-4" />
                                <span>Download PDF</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PoliciesSection;
