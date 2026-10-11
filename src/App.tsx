import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { DemoSwitcher } from './components/common/DemoSwitcher';
import { ToastContainer } from './components/common/ToastContainer';
import { AccessDenied } from './components/common/AccessDenied';

// Pages
import { LandingPage } from './components/pages/LandingPage';
import { ResearchAreasPage } from './components/pages/ResearchAreasPage';
import { ProjectsListPage } from './components/pages/ProjectsListPage';
import { ProjectDetailsPage } from './components/pages/ProjectDetailsPage';
import { LoginPage } from './components/pages/LoginPage';
import { RegisterPage } from './components/pages/RegisterPage';
import { StudentDashboardPage } from './components/pages/StudentDashboardPage';
import { MyApplicationsPage } from './components/pages/MyApplicationsPage';
import { SavedProjectsPage } from './components/pages/SavedProjectsPage';
import { MyProjectsPage } from './components/pages/MyProjectsPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { ResearcherDashboardPage } from './components/pages/ResearcherDashboardPage';
import { ProjectDiscussionPage } from './components/pages/ProjectDiscussionPage';
import { ProjectProgressPage } from './components/pages/ProjectProgressPage';
import { TeamMembersPage } from './components/pages/TeamMembersPage';
import { NotificationsPage } from './components/pages/NotificationsPage';
import { CalendarPage } from './components/pages/CalendarPage';
import { AdminDashboardPage } from './components/pages/AdminDashboardPage';
import { AdminManageProjectsPage } from './components/pages/AdminManageProjectsPage';
import { AdminManageUsersPage } from './components/pages/AdminManageUsersPage';
import { PapersListPage } from './components/pages/PapersListPage';
import { AiPaperWriterPage } from './components/pages/AiPaperWriterPage';
import { PublishProjectPage } from './components/pages/PublishProjectPage';
import { SearchResultsPage } from './components/pages/SearchResultsPage';
import { AboutContactPage } from './components/pages/AboutContactPage';
import { NotFoundPage } from './components/pages/NotFoundPage';

/**
 * Public route determination:
 * Visitors who are NOT logged in may access:
 * - Home (/)
 * - Research Areas (/research-areas, /research-areas/:slug)
 * - Public Projects Listing (/projects, /projects?...)
 * - Public Project Details (/projects/:id, where :id !== 'new')
 * - Papers Listing (/papers, /papers?...)
 * - About (/about)
 * - Contact (/contact)
 * - FAQ (/faq)
 * - Global Search (/search)
 * - Login (/login)
 * - Register (/register)
 */
export const isPublicPath = (path: string): boolean => {
  const cleanPath = path.split('?')[0].split('#')[0];
  if (
    cleanPath === '' ||
    cleanPath === '/' ||
    cleanPath === '/login' ||
    cleanPath === '/register' ||
    cleanPath === '/research-areas' ||
    cleanPath.startsWith('/research-areas/') ||
    cleanPath === '/projects' ||
    cleanPath === '/papers' ||
    cleanPath.startsWith('/papers/') ||
    cleanPath === '/about' ||
    cleanPath === '/contact' ||
    cleanPath === '/faq' ||
    cleanPath === '/search'
  ) {
    return true;
  }

  // Public project details (e.g. /projects/proj-1)
  // BUT NOT /projects/new or internal project workspace tools (/discussion, /progress, /team)
  if (cleanPath.startsWith('/projects/')) {
    const sub = cleanPath.slice('/projects/'.length);
    if (sub === 'new') return false; // Creating a project requires auth
    if (sub.includes('/discussion') || sub.includes('/progress') || sub.includes('/team')) {
      return false; // Workspaces require auth
    }
    return true;
  }

  return false;
};

/**
 * Checks if a path is recognized as a valid route within CollabX.
 * Distinguishes genuine application routes (public or protected) from invalid 404 URLs.
 */
export const isKnownRoute = (path: string): boolean => {
  const cleanPath = path.split('?')[0].split('#')[0];
  if (isPublicPath(cleanPath)) {
    return true;
  }

  // Known authenticated / role-specific routes
  if (
    cleanPath === '/dashboard' ||
    cleanPath === '/applications' ||
    cleanPath === '/saved' ||
    cleanPath === '/my-projects' ||
    cleanPath === '/profile' ||
    cleanPath.startsWith('/u/') ||
    cleanPath === '/notifications' ||
    cleanPath === '/calendar' ||
    cleanPath.startsWith('/ai-writer') ||
    cleanPath === '/researcher' ||
    cleanPath.startsWith('/researcher/') ||
    cleanPath === '/admin' ||
    cleanPath.startsWith('/admin/') ||
    cleanPath === '/settings'
  ) {
    return true;
  }

  // Project workspace sub-routes and creation
  if (cleanPath.startsWith('/projects/')) {
    return true;
  }

  return false;
};

const AppContent: React.FC = () => {
  const { currentUser } = useApp();

  // Simple client-side path router
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cleanPath = currentPath.split('?')[0].split('#')[0];
  const isAuthPage = cleanPath === '/login' || cleanPath === '/register';
  const isPublicPage = isPublicPath(cleanPath);
  const isKnown = isKnownRoute(cleanPath);

  // AUTH PROTECTION REDIRECT:
  // If not logged in and visitor tries to open a valid protected route directly,
  // sync history and redirect to Login while preserving destination.
  // Genuinely invalid routes are NOT redirected to login so user sees custom 404 page!
  useEffect(() => {
    if (!currentUser && isKnown && !isPublicPath(cleanPath)) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
      window.history.replaceState({}, '', redirectUrl);
      setCurrentPath(redirectUrl);
    }
  }, [currentUser, isKnown, cleanPath, currentPath]);

  // Helper parser for dynamic routes
  const getRouteComponent = () => {
    // 0. GENUINELY INVALID ROUTE:
    // Render custom 404 page preserving requested URL without blindly redirecting to Home
    if (!isKnown) {
      return <NotFoundPage navigate={navigate} currentPath={cleanPath} />;
    }

    // 0b. STRICT AUTH GUARD:
    // If unauthenticated visitor attempts to access a protected route,
    // immediately render LoginPage to prevent any private content flash
    if (!currentUser && !isPublicPath(cleanPath)) {
      return <LoginPage navigate={navigate} />;
    }

    // 1. Landing / Public Home
    if (cleanPath === '' || cleanPath === '/') {
      return <LandingPage navigate={navigate} />;
    }

    // 2. Auth Pages
    if (cleanPath === '/login') {
      return <LoginPage navigate={navigate} />;
    }
    if (cleanPath === '/register') {
      return <RegisterPage navigate={navigate} />;
    }

    // 3. Research Areas (Page 2) - Public
    if (cleanPath.startsWith('/research-areas')) {
      return <ResearchAreasPage navigate={navigate} />;
    }

    // 4. Project Workspace Sub-routes (Pages 13, 14, 15) - Requires Login
    if (cleanPath.includes('/discussion')) {
      const parts = cleanPath.split('/');
      const pId = parts[2] || 'proj-1';
      return <ProjectDiscussionPage projectId={pId} navigate={navigate} />;
    }
    if (cleanPath.includes('/progress')) {
      const parts = cleanPath.split('/');
      const pId = parts[2] || 'proj-1';
      return <ProjectProgressPage projectId={pId} navigate={navigate} />;
    }
    if (cleanPath.includes('/team')) {
      const parts = cleanPath.split('/');
      const pId = parts[2] || 'proj-1';
      return <TeamMembersPage projectId={pId} navigate={navigate} />;
    }

    // 5. Project Publishing & Details (Page 4)
    if (cleanPath.startsWith('/projects/')) {
      const parts = cleanPath.split('/');
      const pId = parts[2] || 'proj-1';
      if (pId === 'new') {
        // Publish Project requires Supervisor or Admin role
        if (!currentUser) return <LoginPage navigate={navigate} />;
        if (currentUser.role !== 'supervisor' && currentUser.role !== 'researcher' && currentUser.role !== 'admin') {
          return (
            <AccessDenied
              navigate={navigate}
              requiredRole="Supervisor or Researcher"
              userRole={currentUser.role}
              customMessage="Only Faculty Supervisors and Principal Investigators can publish new research projects."
            />
          );
        }
        return <PublishProjectPage navigate={navigate} />;
      }
      return <ProjectDetailsPage projectId={pId} navigate={navigate} />;
    }

    // Projects Listing (Page 3) - Public
    if (cleanPath === '/projects') {
      const urlParams = new URLSearchParams(currentPath.split('?')[1] || '');
      const areaSlug = urlParams.get('area') || undefined;
      return <ProjectsListPage navigate={navigate} initialAreaSlug={areaSlug} />;
    }

    // 6. Administrator Dashboards & Tools (Pages 18, 19, 20) - Requires Admin Role
    if (cleanPath === '/admin' || cleanPath.startsWith('/admin/') || cleanPath === '/settings') {
      if (!currentUser) return <LoginPage navigate={navigate} />;
      if (currentUser.role !== 'admin') {
        return (
          <AccessDenied
            navigate={navigate}
            requiredRole="System Administrator"
            userRole={currentUser.role}
            customMessage="You do not have administrative privileges to access the Administrator Portal. This area is strictly restricted to System Administrators."
          />
        );
      }
      if (cleanPath === '/admin') {
        return <AdminDashboardPage navigate={navigate} />;
      }
      if (cleanPath === '/admin/projects') {
        return <AdminManageProjectsPage navigate={navigate} />;
      }
      if (cleanPath === '/admin/users') {
        return <AdminManageUsersPage navigate={navigate} />;
      }
      return <AdminDashboardPage navigate={navigate} />;
    }

    // 7. Researcher / Supervisor Dashboard (Page 12) - Requires Supervisor / Researcher / Admin Role
    if (cleanPath.startsWith('/researcher')) {
      if (!currentUser) return <LoginPage navigate={navigate} />;
      if (currentUser.role !== 'supervisor' && currentUser.role !== 'researcher' && currentUser.role !== 'admin') {
        return (
          <AccessDenied
            navigate={navigate}
            requiredRole="Supervisor or Researcher"
            userRole={currentUser.role}
            customMessage="This dashboard is designated for Faculty Supervisors and Research Mentors. As a student researcher, your portal is located at the Student Dashboard."
          />
        );
      }
      return <ResearcherDashboardPage navigate={navigate} />;
    }

    // 8. Student Dashboard (Page 7) - Requires Login
    if (cleanPath === '/dashboard') {
      if (!currentUser) return <LoginPage navigate={navigate} />;
      return <StudentDashboardPage navigate={navigate} />;
    }

    // 9. Student Views & Collaborations (Pages 8, 9, 10, 11) - Requires Login
    if (cleanPath === '/applications') {
      if (!currentUser) return <LoginPage navigate={navigate} />;
      return <MyApplicationsPage navigate={navigate} currentPath={currentPath} />;
    }
    if (cleanPath === '/saved') {
      if (!currentUser) return <LoginPage navigate={navigate} />;
      return <SavedProjectsPage navigate={navigate} />;
    }
    if (cleanPath === '/my-projects') {
      if (!currentUser) return <LoginPage navigate={navigate} />;
      return <MyProjectsPage navigate={navigate} />;
    }
    if (cleanPath === '/profile') {
      if (!currentUser) return <LoginPage navigate={navigate} />;
      return <ProfilePage navigate={navigate} />;
    }
    if (cleanPath.startsWith('/u/')) {
      const uId = cleanPath.split('/')[2];
      return <ProfilePage userId={uId} navigate={navigate} />;
    }

    // 10. Notifications & Calendar (Pages 16, 17) - Requires Login
    if (cleanPath === '/notifications') {
      if (!currentUser) return <LoginPage navigate={navigate} />;
      return <NotificationsPage navigate={navigate} />;
    }
    if (cleanPath === '/calendar') {
      if (!currentUser) return <LoginPage navigate={navigate} />;
      return <CalendarPage navigate={navigate} />;
    }

    // 11. AI Paper Writer - Requires Login
    if (cleanPath.startsWith('/ai-writer')) {
      if (!currentUser) return <LoginPage navigate={navigate} />;
      const urlParams = new URLSearchParams(currentPath.split('?')[1] || '');
      const topicParam = urlParams.get('topic') || undefined;
      return <AiPaperWriterPage navigate={navigate} initialTopic={topicParam} />;
    }

    // 12. Research Papers Listing - Public
    if (cleanPath.startsWith('/papers')) {
      const urlParams = new URLSearchParams(currentPath.split('?')[1] || '');
      const pId = urlParams.get('id') || undefined;
      return <PapersListPage navigate={navigate} selectedPaperId={pId} />;
    }

    // 13. Search Results Page - Public
    if (cleanPath.startsWith('/search')) {
      const urlParams = new URLSearchParams(currentPath.split('?')[1] || '');
      const q = urlParams.get('q') || '';
      return <SearchResultsPage navigate={navigate} queryParam={q} />;
    }

    // 14. About, Contact, Policies - Public
    if (cleanPath === '/about') {
      return <AboutContactPage navigate={navigate} activeSection="about" />;
    }
    if (cleanPath === '/contact') {
      return <AboutContactPage navigate={navigate} activeSection="contact" />;
    }
    if (cleanPath === '/faq') {
      return <AboutContactPage navigate={navigate} activeSection="faq" />;
    }

    // Fallback: If somehow an unrecognized route is reached
    return <NotFoundPage navigate={navigate} currentPath={cleanPath} />;
  };

  // Public pages, authentication pages (login/register), invalid (404) pages, or unauthenticated visitors:
  // Full-width layout with the shared CollabX Navbar and Footer (WITHOUT the internal left sidebar)
  if (isPublicPage || isAuthPage || !isKnown || !currentUser) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#F5F8FC]">
        <Navbar currentPath={currentPath} navigate={navigate} />
        <main className="flex-1 w-full flex flex-col">{getRouteComponent()}</main>
        <Footer navigate={navigate} />
        <GlobalSearchModal navigate={navigate} />
        <ToastContainer />
        <DemoSwitcher />
      </div>
    );
  }

  // Authenticated internal dashboard & workspace pages: Shell WITH Sidebar
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F5F8FC]">
      {/* Top Navbar */}
      <Navbar currentPath={currentPath} navigate={navigate} />

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar currentPath={currentPath} navigate={navigate} />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pb-16">{getRouteComponent()}</main>
      </div>

      {/* Global Footer */}
      <Footer navigate={navigate} />

      {/* Global Overlays & Modals */}
      <GlobalSearchModal navigate={navigate} />
      <ToastContainer />
      <DemoSwitcher />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
