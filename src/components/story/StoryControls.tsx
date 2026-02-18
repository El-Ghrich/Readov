import { Send, StopCircle, Loader2 } from 'lucide-react'

type StoryControlsProps = {
    input: string
    setInput: (v: string) => void
    onSend: () => void
    onEndStory: () => void
    isGenerating: boolean
    isCollapsed: boolean
}

export function StoryControls({ input, setInput, onSend, onEndStory, isGenerating, isCollapsed }: StoryControlsProps) {
    return (
        <div className={`fixed bottom-0 right-0 left-0 transition-all duration-300 p-4 bg-white/80 dark:bg-background/80 backdrop-blur-lg border-t border-gray-200 z-20 ${isCollapsed ? 'md:left-20' : 'md:left-64'}`}>
            <div className="max-w-4xl mx-auto flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isGenerating ? "AI is writing..." : "Describe what happens next..."}
                    disabled={isGenerating}
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-[#1e1e2e] border border-gray-300 rounded-full focus:outline-none focus:border-purple-500"
                    onKeyDown={(e) => e.key === 'Enter' && !isGenerating && input.trim() && onSend()}
                />

                <button
                    onClick={onEndStory}
                    disabled={isGenerating}
                    className="px-4 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-full flex items-center gap-2 font-medium"
                >
                    <StopCircle className="w-5 h-5" />
                    <span className="hidden md:inline">End</span>
                </button>

                <button
                    onClick={onSend}
                    disabled={isGenerating || !input.trim()}
                    className="px-6 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center min-w-[3rem]"
                >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
            </div>
        </div>
    )
}