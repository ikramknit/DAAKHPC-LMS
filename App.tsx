
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminPanel from './pages/AdminPanel';
import { PROGRAM_DATA } from './constants';
import type { Program, Student, ActivityLog } from './types';

type CurrentUser = {
  role: 'student' | 'admin' | 'guest';
  user?: Student | { id: string; email: string };
};

const getInitialState = <T,>(key: string, defaultValue: T): T => {
    try {
        const savedState = localStorage.getItem(key);
        if (savedState) {
            return JSON.parse(savedState);
        }
    } catch (error) {
        console.error(`Failed to parse ${key} from localStorage`, error);
        localStorage.removeItem(key);
    }
    return defaultValue;
};


const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash || '#home');
  const [programs, setPrograms] = useState<Program[]>(PROGRAM_DATA);
  const [students, setStudents] = useState<Student[]>(() => getInitialState<Student[]>('students', []));
  const [activityLog, setActivityLog] = useState<ActivityLog[]>(() => getInitialState<ActivityLog[]>('activityLog', []));
  const [currentUser, setCurrentUser] = useState<CurrentUser>(() => getInitialState<CurrentUser>('currentUser', { role: 'guest' }));

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || '#home');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    try {
        if (currentUser.role === 'guest') {
            localStorage.removeItem('currentUser');
        } else {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
    } catch (error) {
        console.error("Error saving currentUser to localStorage", error);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
        localStorage.setItem('students', JSON.stringify(students));
    } catch (error) {
        console.error("Error saving students to localStorage", error);
    }
  }, [students]);

  useEffect(() => {
    try {
        localStorage.setItem('activityLog', JSON.stringify(activityLog));
    } catch (error) {
        console.error("Error saving activityLog to localStorage", error);
    }
  }, [activityLog]);


  const handleAdminLogin = (success: boolean) => {
    if (success) {
      setCurrentUser({ role: 'admin', user: { id: 'admin', email: 'admin@gmail.com' } });
      window.location.hash = '#admin';
    }
  };
  
  const handleStudentLogin = (mobile: string, password: string): boolean => {
    const student = students.find(s => s.mobile === mobile && s.password === password);
    if (student && student.isActive) {
      setCurrentUser({ role: 'student', user: student });
      window.location.hash = '#courses';
      return true;
    }
    return false;
  };

  const handleStudentSignUp = (name: string, mobile: string, password: string, programId: number): boolean => {
    if (students.some(s => s.mobile === mobile)) {
      return false; // mobile number already exists
    }
    const newStudent: Student = {
      id: Date.now(),
      name,
      mobile,
      password,
      isActive: true,
      programId,
    };
    setStudents([...students, newStudent]);
    setCurrentUser({ role: 'student', user: newStudent });
    window.location.hash = '#courses';
    return true;
  };

  const handleLogout = () => {
    setCurrentUser({ role: 'guest' });
    window.location.hash = '#home';
  };

  const handleNavigate = (path: string) => {
    window.location.hash = path;
  };

  const handleLogActivity = (logData: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newLogEntry: ActivityLog = {
      ...logData,
      id: Date.now(),
      timestamp: Date.now(),
    };
    setActivityLog(prevLog => [newLogEntry, ...prevLog]);
  };

  const renderPage = () => {
    switch (route) {
      case '#courses':
        return <DashboardPage 
                  programs={programs} 
                  currentUser={currentUser} 
                  onNavigate={handleNavigate} 
                  onLogActivity={handleLogActivity} 
                />;
      case '#login':
        return <LoginPage 
                  programs={programs}
                  onAdminLogin={handleAdminLogin} 
                  onStudentLogin={handleStudentLogin} 
                  onStudentSignUp={handleStudentSignUp} 
                />;
      case '#admin':
        return currentUser.role === 'admin' ? 
          <AdminPanel 
            programs={programs} 
            onUpdatePrograms={setPrograms}
            students={students}
            onUpdateStudents={setStudents}
            activityLog={activityLog}
          /> : <LoginPage programs={programs} onAdminLogin={handleAdminLogin} onStudentLogin={handleStudentLogin} onStudentSignUp={handleStudentSignUp} />;
      case '#home':
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <Navbar currentUser={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} />
      <div className="p-4 sm:p-6 lg:p-8">
        {renderPage()}
      </div>
    </div>
  );
};

export default App;
