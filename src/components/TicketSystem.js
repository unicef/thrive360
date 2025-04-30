// src/components/TicketSystem.js

import React, { useState, useEffect } from 'react';
import { fetchTickets } from './api';
import TicketCreateModal from './TicketCreateModal';
import TicketDetailModal from './TicketDetailModal';
import { Link } from 'react-router-dom';

const TicketSystem = ({ userRole, userEmail, countryCode = null }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadTickets = async () => {
      try {
        setLoading(true);
        const data = await fetchTickets(userRole, countryCode);
        setTickets(data);
      } catch (err) {
        console.error("Error loading tickets:", err);
        setError("Failed to load tickets. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    loadTickets();
  }, [userRole, countryCode]);

  const handleTicketCreated = (newTicket) => {
    setTickets(prevTickets => [newTicket, ...prevTickets]);
    setShowCreateModal(false);
  };

  const handleTicketUpdated = (updatedTicket) => {
    setTickets(prevTickets => 
      prevTickets.map(ticket => 
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      )
    );
    setSelectedTicket(null);
  };

  const openTicketDetail = (ticket) => {
    setSelectedTicket(ticket);
  };

  const filteredTickets = tickets.filter(ticket => {
    // Filter by status
    if (filterStatus !== 'all' && ticket.status !== filterStatus) {
      return false;
    }
    
    // Filter by priority
    if (filterPriority !== 'all' && ticket.priority !== filterPriority) {
      return false;
    }
    
    // Search by title, ID, or store
    if (searchTerm && !ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !ticket.store.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Get status color based on ticket status
  const getStatusColor = (status) => {
    switch(status) {
      case 'Open':
        return 'bg-red-100 text-red-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Pending Approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'Implementing':
        return 'bg-purple-100 text-purple-800';
      case 'Verification':
        return 'bg-indigo-100 text-indigo-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority color based on ticket priority
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get level color based on ticket level
  const getLevelColor = (level) => {
    switch(level) {
      case 'Central':
        return 'bg-indigo-100 text-indigo-800';
      case 'Subnational':
        return 'bg-teal-100 text-teal-800';
      case 'Local':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Ticket Management System</h2>
        
        <div className="flex gap-4">
          {/* Only show create button if user has permission */}
          {(userRole === 'Country Office' || userRole === 'UNICEF' || userRole === 'GAVI' || userRole === 'Administrator') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
            >
              Create New Ticket
            </button>
          )}
          
          {/* Show admin panel link for administrators */}
          {userRole === 'Administrator' && (
            <Link
              to="/ticket-admin"
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
            >
              Admin Panel
            </Link>
          )}
        </div>
      </div>
      
      {/* Filters */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by title, ID, or store..."
              className="w-full p-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2 border rounded-md"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Implementing">Implementing</option>
              <option value="Verification">Verification</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="p-2 border rounded-md"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Loading and error states */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      
      {/* Tickets table */}
      {!loading && !error && (
        <>
          {filteredTickets.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No tickets found. {userRole === 'Country Office' && 'Create a new ticket to get started.'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Country</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTickets.map((ticket) => (
                    <tr 
                      key={ticket.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => openTicketDetail(ticket)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ticket.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.country}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLevelColor(ticket.level)}`}>
                          {ticket.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.createdDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            openTicketDetail(ticket);
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      
      {/* Ticket create modal */}
      <TicketCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTicketCreated={handleTicketCreated}
        userRole={userRole}
        userEmail={userEmail}
        countryCode={countryCode}
      />
      
      {/* Ticket detail modal */}
      {selectedTicket && (
        <TicketDetailModal
          isOpen={!!selectedTicket}
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onTicketUpdated={handleTicketUpdated}
          userRole={userRole}
          userEmail={userEmail}
        />
      )}
    </div>
  );
};

export default TicketSystem; 