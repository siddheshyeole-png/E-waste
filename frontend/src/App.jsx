import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import RequestPickup from './pages/RequestPickup';
import MyRequests from './pages/MyRequests';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';

// REST API Base URLs
const API_URL = 'http://localhost:5000/api/requests';
const AUTH_URL = 'http://localhost:5000/api/auth';

// Helper function to normalize API response data into the format expected by UI components
const formatRequestFromApi = (item) => {
  if (!item) return item;

  // Format date string (e.g., YYYY-MM-DD) if returned as ISO timestamp
  let formattedDate = item.pickup_date || item.date || '';
  if (typeof formattedDate === 'string' && formattedDate.includes('T')) {
    formattedDate = formattedDate.split('T')[0];
  } else if (formattedDate instanceof Date) {
    formattedDate = formattedDate.toISOString().split('T')[0];
  }

  return {
    ...item,
    id: item.id,
    name: item.user_name || item.name || '',
    citizen: item.user_name || item.citizen || '',
    item: item.item_name || item.item || '',
    title: item.item_name || item.title || '',
    category: item.category || '',
    quantity: item.quantity !== undefined ? item.quantity : 1,
    quantityDesc: item.quantityDesc || `${item.quantity || 1} Units`,
    city: item.city || '',
    address: item.address || '',
    location: item.location || `${item.address || ''}, ${item.city || ''}`,
    date: formattedDate,
    pickupDate: formattedDate,
    timeSlot: item.time_slot || item.timeSlot || '',
    status: item.status || 'Pending',
    condition: item.condition || 'Recyclable Electronics',
    notes: item.notes || '',
    user_id: item.user_id
  };
};

function App() {
  // Navigation state: 'home' | 'request-pickup' | 'my-requests' | 'admin' | 'login' | 'register'
  // Persisted across page refreshes via window.location.hash and localStorage
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    const validPages = ['home', 'request-pickup', 'my-requests', 'admin', 'login', 'register'];
    if (validPages.includes(hash)) {
      return hash;
    }
    const stored = localStorage.getItem('ecocycle_current_page');
    if (validPages.includes(stored)) {
      return stored;
    }
    return 'home';
  });

  // Authentication State
  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem('ecocycle_token') || null;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ecocycle_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Shared requests list in state (State Lifting allows sharing between pages)
  const [requests, setRequests] = useState([]);

  // Loading and API Error states
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // 1. GET Requests: Load requests from MySQL via Express REST API with verified JWT
  const loadRequests = useCallback(async (tokenToUse = authToken) => {
    if (!tokenToUse) {
      setRequests([]);
      return;
    }

    setLoading(true);
    setApiError('');
    try {
      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${tokenToUse}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        // Token invalid or expired
        handleLogout();
        throw new Error('Your session has expired. Please sign in again.');
      }

      if (!response.ok) {
        throw new Error(`Failed to load requests (Status ${response.status})`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setRequests(data.map(formatRequestFromApi));
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      setApiError(error.message || 'Unable to connect to the server or load requests.');
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  // Verify authentication on mount
  useEffect(() => {
    const verifyAuth = async () => {
      if (!authToken) return;

      try {
        const response = await fetch(`${AUTH_URL}/me`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
          localStorage.setItem('ecocycle_user', JSON.stringify(data.user));
          loadRequests(authToken);
        } else {
          // Token expired or invalid
          handleLogout();
        }
      } catch (err) {
        console.warn('Authentication verification failed:', err);
      }
    };

    verifyAuth();
  }, []);

  // Smooth page navigation helper with route guards
  const handleNavigate = (page) => {
    // Route Guard: 'my-requests' requires authentication
    if (page === 'my-requests' && !currentUser) {
      setCurrentPage('login');
      localStorage.setItem('ecocycle_current_page', 'login');
      window.location.hash = 'login';
      setApiError('Please log in to view your pickup requests.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Route Guard: 'admin' requires admin role
    if (page === 'admin') {
      if (!currentUser) {
        setCurrentPage('login');
        localStorage.setItem('ecocycle_current_page', 'login');
        window.location.hash = 'login';
        setApiError('Administrator authentication required.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (currentUser.role !== 'admin') {
        setApiError('Access denied: Administrator privileges required.');
        return;
      }
    }

    // If already logged in, redirect away from login/register
    if ((page === 'login' || page === 'register') && currentUser) {
      const dest = currentUser.role === 'admin' ? 'admin' : 'my-requests';
      setCurrentPage(dest);
      localStorage.setItem('ecocycle_current_page', dest);
      window.location.hash = dest;
      return;
    }

    setCurrentPage(page);
    localStorage.setItem('ecocycle_current_page', page);
    window.location.hash = page;
    setApiError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Login handler
  const handleLoginSuccess = async (user, token) => {
    setAuthToken(token);
    setCurrentUser(user);
    localStorage.setItem('ecocycle_token', token);
    localStorage.setItem('ecocycle_user', JSON.stringify(user));
    setApiError('');

    await loadRequests(token);

    const dest = user.role === 'admin' ? 'admin' : 'my-requests';
    setCurrentPage(dest);
    localStorage.setItem('ecocycle_current_page', dest);
    window.location.hash = dest;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Logout handler
  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setRequests([]);
    localStorage.removeItem('ecocycle_token');
    localStorage.removeItem('ecocycle_user');
    localStorage.removeItem('ecocycle_current_page');
    window.location.hash = 'home';
    setCurrentPage('home');
    setApiError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. POST: Add a new collection request by sending it to the backend REST API
  const handleAddRequest = async (requestPayload) => {
    setApiError('');
    try {
      if (!authToken) {
        throw new Error('Please sign in as a citizen before scheduling a pickup.');
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create pickup request');
      }

      const created = await response.json();
      const formatted = formatRequestFromApi(created);

      // Prepend the new record into React state and reload from API to synchronize all views
      setRequests((prev) => [formatted, ...prev]);
      await loadRequests(authToken);
      return formatted;
    } catch (error) {
      console.error('Error creating request:', error);
      setApiError(error.message || 'Unable to create pickup request. Please check backend connection.');
      throw error;
    }
  };

  // 3. PUT: Update request status via REST API (Admin: Approve, Schedule, Complete; Citizen: Cancel if Pending)
  const handleUpdateRequest = async (id, newStatus) => {
    setApiError('');
    try {
      if (!authToken) {
        throw new Error('Authentication required.');
      }

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to update request status');
      }

      const updated = await response.json();
      const formatted = formatRequestFromApi(updated);

      // Update in React state using Array.prototype.map()
      setRequests((prev) =>
        prev.map((req) => (String(req.id) === String(id) ? formatted : req))
      );
      return formatted;
    } catch (error) {
      console.error('Error updating request:', error);
      setApiError(error.message || 'Request could not be updated. Please verify permissions.');
      throw error;
    }
  };

  // 4. DELETE: Remove a request from the database via REST API (strictly Admin)
  const handleDeleteRequest = async (id) => {
    setApiError('');
    try {
      if (!authToken) {
        throw new Error('Authentication required.');
      }

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to delete request');
      }

      // Remove from React state using Array.prototype.filter()
      setRequests((prev) => prev.filter((req) => String(req.id) !== String(id)));
    } catch (error) {
      console.error('Error deleting request:', error);
      setApiError(error.message || 'Request could not be deleted. Please verify server connection.');
      throw error;
    }
  };

  // 5. Cancel request by citizen/user (sets status to 'Cancelled' via PUT)
  const handleCancelRequest = async (id) => {
    await handleUpdateRequest(id, 'Cancelled');
  };

  return (
    <div className="app-container">
      {/* Reusable Top Navigation Bar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Global API Loading Banner */}
      {loading && (
        <div className="api-loading-banner" role="status">
          <span className="material-symbols-outlined spin-icon">sync</span>
          <span>Loading verified data from server...</span>
        </div>
      )}

      {/* Global API Error Banner */}
      {apiError && (
        <div className="api-error-banner" role="alert">
          <span className="material-symbols-outlined">error</span>
          <span>{apiError}</span>
          <button
            type="button"
            className="btn-close-banner"
            onClick={() => setApiError('')}
            aria-label="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}

      {/* Main View: Conditionally rendered based on currentPage state */}
      <main className="main-content">
        {currentPage === 'home' && (
          <Home onNavigate={handleNavigate} currentUser={currentUser} />
        )}

        {currentPage === 'login' && (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'register' && (
          <Register
            onLoginSuccess={handleLoginSuccess}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'request-pickup' && (
          <RequestPickup
            onNavigate={handleNavigate}
            onAddRequest={handleAddRequest}
            currentUser={currentUser}
          />
        )}

        {currentPage === 'my-requests' && (
          <MyRequests
            requests={requests}
            onNavigate={handleNavigate}
            onCancelRequest={handleCancelRequest}
            currentUser={currentUser}
          />
        )}

        {currentPage === 'admin' && (
          <Admin
            requests={requests}
            onUpdateRequest={handleUpdateRequest}
            onDeleteRequest={handleDeleteRequest}
            onNavigate={handleNavigate}
            currentUser={currentUser}
          />
        )}
      </main>

      {/* Reusable Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
