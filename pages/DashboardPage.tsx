import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import type { Program, VideoLink, Student, ActivityLog, Year, Subject, Chapter } from '../types';
import { FilterIcon } from '../components/Icons';

type CurrentUser = {
  role: 'student' | 'admin' | 'guest';
  user?: Student | { id: string; email: string };
};

interface DashboardPageProps {
  programs: Program[];
  currentUser: CurrentUser;
  onNavigate: (path: string) => void;
  onLogActivity: (logData: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ programs, currentUser, onNavigate, onLogActivity }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgramIndex, setSelectedProgramIndex] = useState(0);
  const [selectedYearIndex, setSelectedYearIndex] = useState(0);
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<VideoLink | null>(null);
  const [watchState, setWatchState] = useState<{ video: VideoLink; chapterId: number; startTime: number } | null>(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const filteredPrograms = useMemo(() => {
    if (!searchTerm.trim()) {
      return programs;
    }

    const lowercasedFilter = searchTerm.toLowerCase();

    const filterVideos = (videos: VideoLink[]) => videos.filter(video => video.title.toLowerCase().includes(lowercasedFilter));
    const filterChapters = (chapters: Chapter[]) => {
      return chapters.map(chapter => {
        if (chapter.title.toLowerCase().includes(lowercasedFilter)) return chapter;
        const filteredVideos = filterVideos(chapter.videos);
        return filteredVideos.length > 0 ? { ...chapter, videos: filteredVideos } : null;
      }).filter((c): c is Chapter => c !== null);
    };
    const filterSubjects = (subjects: Subject[]) => {
      return subjects.map(subject => {
        if (subject.name.toLowerCase().includes(lowercasedFilter)) return subject;
        const filteredChapters = filterChapters(subject.chapters);
        return filteredChapters.length > 0 ? { ...subject, chapters: filteredChapters } : null;
      }).filter((s): s is Subject => s !== null);
    };
    const filterYears = (years: Year[]) => {
      return years.map(year => {
        const filteredSubjects = filterSubjects(year.subjects);
        return filteredSubjects.length > 0 ? { ...year, subjects: filteredSubjects } : null;
      }).filter((y): y is Year => y !== null);
    };

    return programs.map(program => {
      if (program.name.toLowerCase().includes(lowercasedFilter)) return program;
      const filteredYears = filterYears(program.years);
      return filteredYears.length > 0 ? { ...program, years: filteredYears } : null;
    }).filter((p): p is Program => p !== null);

  }, [programs, searchTerm]);

  useEffect(() => {
    // Reset selections when search term changes to avoid out-of-bounds errors
    setSelectedProgramIndex(0);
    setSelectedYearIndex(0);
    setSelectedSubjectIndex(0);
    setSelectedVideo(null);
  }, [searchTerm]);


  const logWatchDuration = () => {
    if (watchState && currentUser.role === 'student' && currentUser.user) {
      const durationWatched = Math.round((Date.now() - watchState.startTime) / 1000);
      if (durationWatched > 0) {
          const student = currentUser.user as Student;
          const program = programs[selectedProgramIndex];
          const year = program?.years[selectedYearIndex];
          const subject = year?.subjects[selectedSubjectIndex];

          if (student && program && year && subject) {
              onLogActivity({
                  studentId: student.id,
                  programId: program.id,
                  yearId: year.id,
                  subjectId: subject.id,
                  chapterId: watchState.chapterId,
                  videoId: watchState.video.id,
                  durationWatched: durationWatched,
              });
          }
      }
    }
  };

  useEffect(() => {
    window.addEventListener('beforeunload', logWatchDuration);
    return () => {
        logWatchDuration();
        window.removeEventListener('beforeunload', logWatchDuration);
    };
  }, [watchState]);

  const handleSelectVideo = (video: VideoLink, chapterId: number) => {
    const isDeselecting = selectedVideo?.id === video.id;
    
    logWatchDuration();

    if (isDeselecting) {
        setSelectedVideo(null);
        setWatchState(null);
    } else {
        // This logic ensures only one video can be played at a time.
        // By setting a single `selectedVideo` in the state, React unmounts the
        // component for the previous video (stopping its playback) and mounts
        // a new one for the selected video.
        setSelectedVideo(video);
        if (currentUser.role === 'student') {
            setWatchState({ video, chapterId, startTime: Date.now() });
        }
    }
  };

  const handleProgramChange = (index: number) => {
    logWatchDuration();
    setWatchState(null);
    setSelectedProgramIndex(index);
    setSelectedYearIndex(0);
    setSelectedSubjectIndex(0);
    setSelectedVideo(null);
  };
  
  const handleYearChange = (index: number) => {
    logWatchDuration();
    setWatchState(null);
    setSelectedYearIndex(index);
    setSelectedSubjectIndex(0);
    setSelectedVideo(null);
  };

  const handleSubjectChange = (index: number) => {
    logWatchDuration();
    setWatchState(null);
    setSelectedSubjectIndex(index);
    setSelectedVideo(null);
  };

  const selectedProgram = filteredPrograms[selectedProgramIndex];
  const selectedYear = selectedProgram?.years[selectedYearIndex];
  const selectedSubject = selectedYear?.subjects[selectedSubjectIndex];

  return (
    <div className="flex flex-col font-sans text-slate-900 -m-4 sm:-m-6 lg:-m-8">
        <Header 
          isOpen={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          programs={filteredPrograms}
          selectedProgramIndex={selectedProgramIndex}
          selectedYearIndex={selectedYearIndex}
          selectedSubjectIndex={selectedSubjectIndex}
          onProgramChange={handleProgramChange}
          onYearChange={handleYearChange}
          onSubjectChange={handleSubjectChange}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        <main className="p-4 sm:p-6 lg:p-8 bg-slate-50">
          {currentUser.role === 'guest' && (
            <div className="bg-sky-100 border-l-4 border-sky-500 text-sky-800 p-4 rounded-md mb-6 shadow-sm" role="alert">
              <p className="font-bold">You are browsing as a guest.</p>
              <p>
                <a 
                  href="#login" 
                  onClick={(e) => { e.preventDefault(); onNavigate('#login'); }} 
                  className="font-semibold underline hover:text-sky-900"
                >
                  Log in or create an account
                </a> to track your progress and access all features.
              </p>
            </div>
          )}

          <div className="flex justify-end items-center mb-4">
             <button
                onClick={() => setIsFilterDrawerOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
             >
                <FilterIcon className="h-5 w-5"/>
                <span className="hidden sm:inline">Filters & Search</span>
             </button>
          </div>

        </main>
      
        <Sidebar
          chapters={selectedSubject?.chapters ?? []}
          selectedVideo={selectedVideo}
          onSelectVideo={handleSelectVideo}
        />
    </div>
  );
};

export default DashboardPage;