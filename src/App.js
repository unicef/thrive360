import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import StockOutTable from './components/StockOutTable';
import TicketSystem from './components/TicketSystem';
import TicketAdminPanel from './components/TicketAdminPanel';

function App() {
  // In a real application, this would come from your auth context
  const userCountry = 'Nigeria'; // This should be replaced with actual user context

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="mb-4 flex gap-4">
          <Link to="/" className="text-blue-600 hover:text-blue-800">Dashboard</Link>
          <Link to="/tickets" className="text-blue-600 hover:text-blue-800">Tickets</Link>
          <Link to="/ticket-admin" className="text-blue-600 hover:text-blue-800">Admin Panel</Link>
        </div>
        <Routes>
          <Route path="/" element={<StockOutTable />} />
          <Route path="/tickets" element={<TicketSystem userRole="Administrator" userEmail="admin@example.com" countryCode={userCountry} />} />
          <Route path="/ticket-admin" element={<TicketAdminPanel countryCode={userCountry} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

