import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import VideoPlayer from '../components/VideoPlayer';
import Header from '../components/Header';
import type { Program, VideoLink, Student, ActivityLog } from '../types';

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
  const [selectedProgramIndex, setSelectedProgramIndex] = useState(0);
  const [selectedYearIndex, setSelectedYearIndex] = useState(0);
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<VideoLink | null>(null);
  const [watchState, setWatchState] = useState<{ video: VideoLink; chapterId: number; startTime: number } | null>(null);

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
    // This effect handles logging when the user navigates away or the component unmounts.
    window.addEventListener('beforeunload', logWatchDuration);
    
    return () => {
        logWatchDuration();
        window.removeEventListener('beforeunload', logWatchDuration);
    };
  }, [watchState]); // Re-bind if watchState changes to capture the latest state

  const handleSelectVideo = (video: VideoLink, chapterId: number) => {
    logWatchDuration(); // Log duration for the previous video before starting the new one
    setSelectedVideo(video);
    if (currentUser.role === 'student') {
      setWatchState({ video, chapterId, startTime: Date.now() }); // Start timer for the new video for students
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

  const selectedProgram = programs[selectedProgramIndex];
  const selectedYear = selectedProgram?.years[selectedYearIndex];
  const selectedSubject = selectedYear?.subjects[selectedSubjectIndex];

  return (
    <div className="flex flex-col md:flex-row md:h-[calc(100vh-100px)] font-sans text-slate-900 -m-4 sm:-m-6 lg:-m-8">
      {/* Main Content Area (Header + Video Player) */}
      <div className="flex-1 flex flex-col md:order-2 min-w-0">
        <Header 
          programs={programs}
          selectedProgramIndex={selectedProgramIndex}
          selectedYearIndex={selectedYearIndex}
          selectedSubjectIndex={selectedSubjectIndex}
          onProgramChange={handleProgramChange}
          onYearChange={handleYearChange}
          onSubjectChange={handleSubjectChange}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-50">
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
          <VideoPlayer video={selectedVideo} />
        </main>
      </div>
      
      {/* Sidebar Area */}
      <div className="w-full md:w-80 lg:w-96 md:flex-shrink-0 md:order-1 h-96 md:h-auto">
        <Sidebar
          chapters={selectedSubject?.chapters ?? []}
          selectedVideo={selectedVideo}
          onSelectVideo={handleSelectVideo}
        />
      </div>
    </div>
  );
};

export default DashboardPage;