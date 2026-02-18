import { CheckCircle, Trash2 } from 'lucide-react'

type StoryHeaderProps = {
  story: any
  onDelete: () => void
  onComplete: () => void
}

export function StoryHeader({ story, onDelete, onComplete }: StoryHeaderProps) {
  return (
    <div className="mb-8 flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{story.title}</h1>
        <div className="flex gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="px-2 py-0.5 bg-gray-200 dark:bg-white/10 rounded">{story.genre}</span>
          <span className="px-2 py-0.5 bg-gray-200 dark:bg-white/10 rounded">{story.language}</span>
          {story.is_completed && (
            <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Completed
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        {!story.is_completed && (
          <button onClick={onComplete} className="p-2 hover:bg-gray-200 rounded-full text-green-600">
            <CheckCircle className="w-5 h-5" />
          </button>
        )}
        <button onClick={onDelete} className="p-2 hover:bg-gray-200 rounded-full text-red-600">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}