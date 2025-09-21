import React from 'react';
import type { Chapter, VideoLink } from '../types';
import { PlayIcon } from './Icons';
import VideoPlayer from './VideoPlayer';

interface SidebarProps {
  chapters: Chapter[];
  selectedVideo: VideoLink | null;
  onSelectVideo: (video: VideoLink, chapterId: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ chapters, selectedVideo, onSelectVideo }) => {
  return (
    <div className="w-full bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="p-4 border-b border-slate-200 mb-6">
            <h2 className="text-xl font-semibold text-slate-800">Subject Content</h2>
          </div>
          <div className="space-y-6">
            {chapters.length > 0 ? (
              chapters.map((chapter) => (
                <div key={chapter.id}>
                  <h3 className="font-semibold text-slate-800 mb-3 text-md">{chapter.id}. {chapter.title}</h3>
                  <ul className="space-y-3">
                    {chapter.videos.map((video) => {
                      const isSelected = selectedVideo?.id === video.id;
                      return (
                        <li key={video.id}>
                          {isSelected ? (
                            <div className="p-3 rounded-lg transition-all duration-200 border-2 bg-white border-sky-500 shadow-lg scale-[1.02]">
                               <button onClick={() => onSelectVideo(video, chapter.id)} className="w-full text-left">
                                <p className={`font-semibold text-sm leading-tight text-sky-600`}>{video.title}</p>
                              </button>
                              <div className="mt-2.5 rounded-md overflow-hidden">
                                <VideoPlayer video={video} />
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => onSelectVideo(video, chapter.id)}
                              className={`w-full text-left p-3 rounded-lg transition-all duration-200 border-2 bg-slate-50 border-transparent hover:bg-white hover:border-slate-300 hover:shadow-sm`}
                              aria-current={isSelected ? 'page' : undefined}
                            >
                              <p className={`font-semibold text-sm leading-tight text-slate-800`}>{video.title}</p>
                              <div className="mt-2.5 rounded-md overflow-hidden relative group/thumb">
                                <img
                                  src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                                  alt={`Thumbnail for ${video.title}`}
                                  className="w-full h-auto"
                                />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300">
                                  <PlayIcon className="w-10 h-10 text-white drop-shadow-lg" />
                                </div>
                              </div>
                            </button>
                          )}
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
                <p className="font-medium text-slate-600">No Content Available</p>
                <p className="text-sm">Content for this subject will be available shortly, or no results match your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;