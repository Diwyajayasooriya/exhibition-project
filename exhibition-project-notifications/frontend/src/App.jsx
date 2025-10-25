import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';

// --- API Configuration ---
// During development we proxy /api to the backend via Vite (see vite.config.js).
// Using a relative base URL avoids CORS and cookie issues in dev.
const API_URL = '/api';
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // sends cookies with requests
});

// --- Auth Context ---
// This will store the user's state and share it across the app
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if session is active on app load
  useEffect(() => {
    async function checkSession() {
      try {
        const response = await api.get('/auth/check');
        setUser(response.data);
      } catch (error) {
        setUser(null);
      }
      setIsLoading(false);
    }
    checkSession();
  }, []);

  const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    setUser(response.data);
    return response.data;
  };

  const register = async (username, password) => {
    const response = await api.post('/auth/register', { username, password });
    setUser(response.data);
    return response.data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  const authValue = {
    user,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

// --- Main App Component ---
export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

function MainApp() {
  const [page, setPage] = useState('events'); // 'login', 'events', 'bookmarks', 'notifications'
  const { user, isLoading, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);

  // Refetch notifications when user logs in
  useEffect(() => {
    if (user) {
      setPage('events');
      fetchNotifications();
    } else {
      setPage('login');
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/events/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {user && (
        <header className="bg-white shadow-md sticky top-0 z-10">
          <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-indigo-600">ExpoEvents</span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  className="flex items-center space-x-3 p-1 rounded-full bg-white shadow-md hover:shadow-xl transition-shadow border border-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  style={{ cursor: 'pointer' }}
                  title="Profile"
                >
                  <span className="w-12 h-12 rounded-full flex items-center justify-center text-white font-extrabold text-lg shadow-lg bg-gradient-to-br from-indigo-500 via-pink-500 to-yellow-400 border-4 border-white">
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </span>
                  <span className="text-gray-800 font-semibold text-base drop-shadow-sm">{user.username}</span>
                </button>
                <NavButton
                  label="Events"
                  isActive={page === 'events'}
                  onClick={() => setPage('events')}
                />
                <NavButton
                  label="My Bookmarks"
                  isActive={page === 'bookmarks'}
                  onClick={() => setPage('bookmarks')}
                />
                <NavButton
                  label="Notifications"
                  isActive={page === 'notifications'}
                  onClick={() => setPage('notifications')}
                  badgeCount={unreadCount}
                />
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          </nav>
        </header>
      )}

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {page === 'login' && <AuthPage />}
        {page === 'events' && <EventListPage />}
        {page === 'bookmarks' && <BookmarksPage />}
        {page === 'notifications' && <NotificationsPage notifications={notifications} fetchNotifications={fetchNotifications} />}
      </main>
    </div>
  );
}

// --- Page Components ---

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, password);
      }
    } catch (err) {
      console.error('Auth error:', err);
      const status = err.response?.status ? `(${err.response.status}) ` : '';
      const message = err.response?.data?.message || err.message || 'An error occurred. Please try again.';
      setError(`${status}${message}`);
    }
  };

  return (
    <div className="flex justify-center items-center mt-10">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
          {isLogin ? 'Login' : 'Register'}
        </h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-300"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <p className="text-center text-gray-600 text-sm mt-6">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 hover:text-indigo-800 font-medium ml-2"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}

function EventListPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleBookmarkToggle = (event) => {
    // Optimistically update the UI
    setEvents(currentEvents =>
      currentEvents.map(e =>
        e.id === event.id ? { ...e, isBookmarked: !e.isBookmarked } : e
      )
    );
    
    // Send request to backend
    const promise = event.isBookmarked
      ? api.delete(`/events/${event.id}/bookmark`)
      : api.post(`/events/${event.id}/bookmark`);
      
    promise.catch(err => {
      console.error("Failed to toggle bookmark", err);
      // Revert UI on failure
      setEvents(currentEvents =>
        currentEvents.map(e =>
          e.id === event.id ? { ...e, isBookmarked: event.isBookmarked } : e
        )
      );
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">All Events</h1>
      {isLoading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <p className="text-gray-600">No events scheduled yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onBookmarkToggle={() => handleBookmarkToggle(event)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BookmarksPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookmarkedEvents = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/events/my-bookmarks');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    fetchBookmarkedEvents();
  }, []);
  
  const handleRemoveBookmark = (event) => {
    // Optimistically remove from UI
    setEvents(currentEvents => currentEvents.filter(e => e.id !== event.id));
    
    // Send request to backend
    api.delete(`/events/${event.id}/bookmark`)
      .catch(err => {
        console.error("Failed to remove bookmark", err);
        // Add back to UI on failure
        setEvents(currentEvents => [...currentEvents, event]);
      });
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Bookmarked Events</h1>
      {isLoading ? (
        <p>Loading bookmarks...</p>
      ) : events.length === 0 ? (
        <p className="text-gray-600">You haven't bookmarked any events yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onBookmarkToggle={() => handleRemoveBookmark(event)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationsPage({ notifications, fetchNotifications }) {
  const handleMarkRead = async (id) => {
    try {
      await api.put(`/events/notifications/${id}/read`);
      // Refetch to show updated state
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Notifications</h1>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {notifications.length === 0 ? (
            <li className="p-6 text-gray-600">You have no notifications.</li>
          ) : (
            notifications.map((notif) => (
              <li
                key={notif.id}
                className={`p-4 ${notif.is_read ? 'bg-gray-50' : 'bg-white'} transition-colors duration-300`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`text-sm font-medium ${notif.is_read ? 'text-gray-500' : 'text-gray-900'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notif.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="ml-4 flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

// --- Reusable UI Components ---

function NavButton({ label, isActive, onClick, badgeCount = 0 }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
        isActive
          ? 'bg-indigo-100 text-indigo-700'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
      {badgeCount > 0 && (
        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
          {badgeCount}
        </span>
      )}
    </button>
  );
}

function EventCard({ event, onBookmarkToggle }) {
  const { user } = useAuth();
  
  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.name}</h3>
        <p className="text-gray-600 text-sm mb-4">{event.description}</p>
        <div className="text-sm text-gray-800 space-y-1">
          <p><strong>Location:</strong> {event.location || 'TBD'}</p>
          <p><strong>Starts:</strong> {formatTime(event.start_time)}</p>
          <p><strong>Ends:</strong> {formatTime(event.end_time)}</p>
        </div>
      </div>
      {user && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onBookmarkToggle}
            className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
              event.isBookmarked
                ? 'text-red-700 bg-red-100 hover:bg-red-200'
                : 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200'
            }`}
          >
            {event.isBookmarked ? 'Remove Bookmark' : 'Bookmark Event'}
          </button>
        </div>
      )}
    </div>
  );
}
