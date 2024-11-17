import React, { useState } from 'react';
import { Github, Key, Search, Loader2, MessageSquare } from 'lucide-react';
import { getRepoContent } from './lib/github';
import { analyzeRepo, askQuestion } from './lib/ai';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [files, setFiles] = useState<Array<{ path: string; content: string }>>([]);
  const [error, setError] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const repoFiles = await getRepoContent(repoUrl);
      setFiles(repoFiles);
      const repoSummary = await analyzeRepo(apiKey, repoFiles);
      setSummary(repoSummary || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.length) {
      setError('Please analyze a repository first');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await askQuestion(apiKey, files, question);
      setAnswer(response || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Github className="w-10 h-10" />
            GitHub AI Analyzer
          </h1>
          <p className="text-gray-400">Analyze repositories and ask questions about the code</p>
        </header>

        <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Key className="w-4 h-4" /> OpenAI API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="sk-..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Github className="w-4 h-4" /> GitHub Repository URL
              </label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://github.com/owner/repo"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Analyze Repository
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-xl p-4 text-red-200">
            {error}
          </div>
        )}

        {summary && (
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Repository Summary</h2>
            <div className="prose prose-invert prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700">
              {summary.split('\n').map((line, i) => (
                <p key={i} className="mb-2">{line}</p>
              ))}
            </div>
          </div>
        )}

        {summary && (
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Ask a Question
            </h2>
            <form onSubmit={handleAskQuestion} className="space-y-4">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ask anything about the repository..."
                rows={3}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageSquare className="w-4 h-4" />
                )}
                Ask Question
              </button>
            </form>

            {answer && (
              <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
                <h3 className="font-medium mb-2">Answer:</h3>
                <div className="prose prose-invert prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700">
                  {answer.split('\n').map((line, i) => (
                    <p key={i} className="mb-2">{line}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;