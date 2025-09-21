
import React from 'react';
import type { Chapter, VideoLink } from '../types';
import { PlayIcon } from './Icons';

interface SidebarProps {
  chapters: Chapter[];
  selectedVideo: VideoLink | null;
  onSelectVideo: (video: VideoLink, chapterId: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ chapters, selectedVideo, onSelectVideo }) => {
  return (
    <aside className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800">Subject Content</h2>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {chapters.length > 0 ? (
          chapters.map((chapter) => (
            <div key={chapter.id} className="py-2">
              <h3 className="font-semibold text-slate-700 mb-2 px-2 text-md">{chapter.id}. {chapter.title}</h3>
              <ul className="space-y-1">
                {chapter.videos.map((video) => {
                  const isSelected = selectedVideo?.id === video.id;
                  return (
                    <li key={video.id}>
                      <button
                        onClick={() => onSelectVideo(video, chapter.id)}
                        className={`w-full text-left flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200 relative ${
                          isSelected
                            ? 'bg-sky-50 text-sky-700 font-semibold'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                        aria-current={isSelected ? 'page' : undefined}
                      >
                        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-r-full transition-colors ${isSelected ? 'bg-sky-500' : 'bg-transparent'}`}></div>
                        <PlayIcon className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-sky-500' : 'text-slate-400'}`} />
                        <span className="text-sm leading-tight">{video.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        ) : (
          <div className="text-center text-slate-500 pt-8 px-4">
             <div className="flex items-center justify-center h-12 w-12 bg-slate-100 rounded-full mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <p className="font-medium text-slate-600">Coming Soon</p>
            <p className="text-sm">Content for this subject will be available shortly.</p>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;