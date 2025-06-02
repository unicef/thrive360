// src/components/StockOutTable.js

import React, { useState, useEffect, useRef } from 'react';
// Remove the local data import
// import data from './data.json'; // Import the JSON data
import { fetchCountryData, fetchStoreData } from './api';
import LoginModal from './LoginModal';
import TicketSystem from './TicketSystem';
import TopBar from './TopBar';
import AIModels from './AIModels';
import RouteOptimization from './RouteOptimization';
//import SupportChatbot from './SupportChatbot';
import SupportChatbotV2 from './SupportChatbotV2';

const StockOutTable = () => {
  // Check for existing authentication in localStorage
  const checkExistingAuth = () => {
    const storedAuth = localStorage.getItem('stockOutDashboardAuth');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        // Check if the authentication is still valid (within 30 days)
        if (authData.expiry > Date.now()) {
          return true;
        } else {
          // Clear expired authentication
          localStorage.removeItem('stockOutDashboardAuth');
        }
      } catch (e) {
        // If there's an error parsing, clear the invalid data
        localStorage.removeItem('stockOutDashboardAuth');
      }
    }
    return false;
  };

  // Initialize authentication state from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(checkExistingAuth());
  const [showLoginModal, setShowLoginModal] = useState(!checkExistingAuth());
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add state for active tab - default to powerbi dashboard
  const [activeTab, setActiveTab] = useState('powerbi');
  
  // Add state for user role (default to Country Office for now)
  const [userRole, setUserRole] = useState('Country Office');
  const [userEmail, setUserEmail] = useState('nigeria.office@example.com');
  const [countryCode, setCountryCode] = useState('Nigeria');

  // Update filter states to use risk category with 'above80' as default
  const [filters, setFilters] = useState({
    Central: { store: '', riskCategory: 'above80' },
    Subnational: { store: '', riskCategory: 'above80' },
    Local: { store: '', riskCategory: 'above80' }
  });

  // Fetch country data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const countryData = await fetchCountryData();
        setData(countryData);
      } catch (err) {
        console.error("Error loading country data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Group data by level and categorize - moved inside useEffect to depend on data
  const [groupedData, setGroupedData] = useState({});
  
  useEffect(() => {
    if (data.length > 0) {
      const grouped = data.reduce((acc, item) => {
        const levelCode = item.unique_id.split('-')[1]; // Extract level from unique_id
        const level = levelCode === 'Ce' ? 'Central' : levelCode === 'Su' ? 'Subnational' : 'Local';
        if (!acc[level]) {
          acc[level] = [];
        }
        acc[level].push(item);
        return acc;
      }, {});
      setGroupedData(grouped);
    }
  }, [data]);

  // State to track expanded levels
  const [expandedLevels, setExpandedLevels] = useState({});
  const [storeData, setStoreData] = useState({});
  const fetchedStoreIds = useRef(new Set());
  const [loadingStores, setLoadingStores] = useState({});

  // Fetch store data from API
  useEffect(() => {
    if (Object.keys(groupedData).length === 0) return;
    
    const loadStoreData = async (storeId) => {
      if (loadingStores[storeId]) return; // Skip if already loading
      
      try {
        setLoadingStores(prev => ({ ...prev, [storeId]: true }));
        const storeInfo = await fetchStoreData(storeId);
        setStoreData((prev) => ({ ...prev, [storeId]: storeInfo }));
      } catch (error) {
        console.error(`Error fetching store data for store ${storeId}:`, error);
        setStoreData((prev) => ({ ...prev, [storeId]: null }));
      } finally {
        setLoadingStores(prev => ({ ...prev, [storeId]: false }));
      }
    };
    
    // Only fetch data for visible stores when a level is expanded
    Object.entries(expandedLevels).forEach(([level, isExpanded]) => {
      if (isExpanded && groupedData[level]) {
        groupedData[level].forEach((item) => {
          const storeId = item.unique_id.split('-').slice(0, 3).join('-');
          if (!fetchedStoreIds.current.has(storeId)) {
            fetchedStoreIds.current.add(storeId);
            loadStoreData(storeId);
          }
        });
      }
    });
  }, [groupedData, expandedLevels, loadingStores]);

  // Toggle function for expanding/collapsing levels
  const toggleLevel = (level) => {
    setExpandedLevels((prev) => ({
      ...prev,
      [level]: !prev[level],
    }));
  };

  // Define color classes for each level
  const colorClasses = {
    Central: {
      header: 'bg-indigo-200',
      row: 'bg-indigo-100',
      expandedHeader: 'bg-indigo-300',
      expandedRow: 'bg-indigo-50',
    },
    Subnational: {
      header: 'bg-teal-200',
      row: 'bg-teal-100',
      expandedHeader: 'bg-teal-300',
      expandedRow: 'bg-teal-50',
    },
    Local: {
      header: 'bg-yellow-200',
      row: 'bg-yellow-100',
      expandedHeader: 'bg-yellow-300',
      expandedRow: 'bg-yellow-50',
    },
  };

  // Order levels
  const orderedLevels = ['Central', 'Subnational', 'Local'];

  // Add filter handlers
  const handleStoreFilterChange = (level, value) => {
    setFilters(prev => ({
      ...prev,
      [level]: { ...prev[level], store: value }
    }));
  };

  const handleRiskCategoryChange = (level, category) => {
    setFilters(prev => ({
      ...prev,
      [level]: { ...prev[level], riskCategory: category }
    }));
  };

  // Filter data based on filters
  const getFilteredData = (level) => {
    if (!groupedData[level]) return [];
    
    return groupedData[level].filter(item => {
      // Filter by store name
      const storeMatch = item.store_name.toLowerCase().includes(filters[level].store.toLowerCase());
      
      // Filter by risk category
      const riskValue = item.probability * 100;
      let riskMatch = true;
      
      switch(filters[level].riskCategory) {
        case 'below50':
          riskMatch = riskValue < 50;
          break;
        case '50to80':
          riskMatch = riskValue >= 50 && riskValue <= 80;
          break;
        case 'above80':
          riskMatch = riskValue > 80;
          break;
        case 'all':
        default:
          riskMatch = true;
          break;
      }
      
      return storeMatch && riskMatch;
    });
  };

  // Handle successful login
  const handleLogin = (success, role = 'Country Office') => {
    if (success) {
      // Set authentication state
      setIsAuthenticated(true);
      setShowLoginModal(false);
      
      // Set user role based on login (in a real app, this would come from the authentication response)
      setUserRole(role);
      
      // Store authentication in localStorage with 30-day expiry
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
      const authData = {
        authenticated: true,
        timestamp: Date.now(),
        expiry: Date.now() + thirtyDaysInMs,
        userRole: role,
        // In a real app, these would come from the authentication response
        userEmail: role === 'Administrator' ? 'admin@example.com' : 
                  role === 'UNICEF' ? 'unicef.supply@example.com' :
                  role === 'GAVI' ? 'gavi.program@example.com' :
                  'nigeria.office@example.com',
        countryCode: role === 'Country Office' ? 'Nigeria' : null
      };
      
      // Set the user email and country code based on role
      setUserEmail(authData.userEmail);
      setCountryCode(authData.countryCode);
      
      localStorage.setItem('stockOutDashboardAuth', JSON.stringify(authData));
    }
  };

  // Add logout function
  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowLoginModal(true);
    localStorage.removeItem('stockOutDashboardAuth');
  };

  // Function to create a ticket for specific store
  const handleCreateTicketForStore = (storeItem) => {
    // Switch to the ticket tab
    setActiveTab('tickets');
    
    // Ticket creation would happen in the TicketSystem component
    // We just switch to that tab here
  };

  return (
    <div className="container mx-auto">
      {/* Show login modal if not authenticated */}
      <LoginModal 
        isOpen={showLoginModal && !isAuthenticated} 
        onLogin={handleLogin} 
      />
      
      {/* Support Chatbot - always visible */}
      <SupportChatbotV2 />
      
      {/* Only show the dashboard content if authenticated */}
      {isAuthenticated && (
        <>
          {/* Use the TopBar component */}
          <TopBar 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            userRole={userRole}
            handleLogout={handleLogout}
            countryCode={countryCode}
          />

          {/* PowerBI Dashboard Tab */}
          {activeTab === 'powerbi' && (
            <div className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">THRIVE360 Analytics</h2>
              <div className="iframe-container flex justify-center">
                <iframe 
                  title="Thrive360 Monthly Reports" 
                  width="100%" 
                  height="700" 
                  src="https://app.powerbi.com/reportEmbed?reportId=6bb83dec-9338-4f3d-80ae-86c765bc05b3&autoAuth=true&ctid=77410195-14e1-4fb8-904b-ab1892023667" 
                  frameBorder="0" 
                  allowFullScreen={true}
                  style={{ minHeight: '600px' }}
                />
              </div>
            </div>
          )}

          {/* Data Warehouse Tab */}
          {activeTab === 'warehouse' && (
            <div className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">THRIVE360 Data Warehouse</h2>
              <div className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-blue-100">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Data Warehouse Module</h3>
                <p className="text-gray-600 mb-4">Centralized repository for all THRIVE360 data assets and analytics.</p>
                <p className="text-gray-500">This module is under development. Coming soon.</p>
              </div>
            </div>
          )}

          {/* AI Models Tab */}
          {activeTab === 'ai' && <AIModels />}

          {/* Forecasting Planning Tab */}
          {activeTab === 'forecasting' && (
            <div className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Vaccine Forecasting Planning</h2>
              <div className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-orange-100">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Forecasting Planning Module</h3>
                <p className="text-gray-600 mb-4">Plan and optimize vaccine forecasts to improve supply chain efficiency.</p>
                <p className="text-gray-500">This module is under development. Coming soon.</p>
              </div>
            </div>
          )}

          {/* Solar Electrification Tab */}
          {activeTab === 'solar' && (
            <div className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Health Facility Solar Electrification</h2>
              <div className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-yellow-100">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Solar Electrification Module</h3>
                <p className="text-gray-600 mb-4">Track and manage solar power installations at health facilities.</p>
                <p className="text-gray-500">This module is under development. Coming soon.</p>
              </div>
            </div>
          )}

          {/* Waste Management Tab */}
          {activeTab === 'waste' && (
            <div className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Healthcare Waste Management</h2>
              <div className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-green-100">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Waste Management Module</h3>
                <p className="text-gray-600 mb-4">Monitor and optimize healthcare waste management processes.</p>
                <p className="text-gray-500">This module is under development. Coming soon.</p>
              </div>
            </div>
          )}

          {/* Carbon Footprint Tab */}
          {activeTab === 'carbon' && (
            <div className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Carbon Footprint of Immunization Program</h2>
              <div className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-teal-100">
                  <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Carbon Footprint Module</h3>
                <p className="text-gray-600 mb-4">Measure and manage the carbon impact of immunization programs.</p>
                <p className="text-gray-500">This module is under development. Coming soon.</p>
              </div>
            </div>
          )}

          {/* Cold Chain Equipment Tab */}
          {activeTab === 'coldchain' && (
            <div className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Cold Chain Equipment Management</h2>
              <div className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-indigo-100">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Cold Chain Equipment Module</h3>
                <p className="text-gray-600 mb-4">Monitor and manage refrigerators, freezers, and other cold chain equipment at health facilities.</p>
                <p className="text-gray-500">This module is under development. Coming soon.</p>
              </div>
            </div>
          )}

          {/* Temperature (RTMD) Tab */}
          {activeTab === 'rtmd' && (
            <div className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Real-Time Temperature Monitoring</h2>
              <div className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-indigo-100">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Temperature Monitoring (RTMD) Module</h3>
                <p className="text-gray-600 mb-4">Track real-time temperature data from cold chain equipment to ensure vaccine potency.</p>
                <p className="text-gray-500">This module is under development. Coming soon.</p>
              </div>
            </div>
          )}

          {/* Route Optimization Tab */}
          {activeTab === 'route' && <RouteOptimization />}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <>
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
              
              {!loading && !error && (
                <div className="p-4">
                  {orderedLevels.map((level) => (
                    groupedData[level] && (
                      <div key={level} className="mb-8">
                        <h2 className="text-xl font-semibold mb-2">Level: {level}</h2>
                        <p className="mb-4">This table shows the stock-out situations for level {level}.</p>
                        
                        {/* Updated filter section with buttons */}
                        <div className="bg-gray-100 p-4 mb-4 rounded-lg">
                          <h3 className="text-lg font-medium mb-2">Filters</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Store Name
                              </label>
                              <input
                                type="text"
                                className="w-full p-2 border rounded-md"
                                placeholder="Filter by store name..."
                                value={filters[level].store}
                                onChange={(e) => handleStoreFilterChange(level, e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stock-out Risk
                              </label>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  className={`px-3 py-1 rounded-md ${
                                    filters[level].riskCategory === 'below50' 
                                      ? 'bg-blue-500 text-white' 
                                      : 'bg-gray-200 text-gray-800'
                                  }`}
                                  onClick={() => handleRiskCategoryChange(level, 'below50')}
                                >
                                  Below 50%
                                </button>
                                <button
                                  className={`px-3 py-1 rounded-md ${
                                    filters[level].riskCategory === '50to80' 
                                      ? 'bg-blue-500 text-white' 
                                      : 'bg-gray-200 text-gray-800'
                                  }`}
                                  onClick={() => handleRiskCategoryChange(level, '50to80')}
                                >
                                  50% - 80%
                                </button>
                                <button
                                  className={`px-3 py-1 rounded-md ${
                                    filters[level].riskCategory === 'above80' 
                                      ? 'bg-blue-500 text-white' 
                                      : 'bg-gray-200 text-gray-800'
                                  }`}
                                  onClick={() => handleRiskCategoryChange(level, 'above80')}
                                >
                                  Above 80%
                                </button>
                                <button
                                  className={`px-3 py-1 rounded-md ${
                                    filters[level].riskCategory === 'all' 
                                      ? 'bg-blue-500 text-white' 
                                      : 'bg-gray-200 text-gray-800'
                                  }`}
                                  onClick={() => handleRiskCategoryChange(level, 'all')}
                                >
                                  Show All
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                          <table className="min-w-full border-collapse border border-gray-300">
                            <thead>
                              <tr className={colorClasses[level]?.header || 'bg-gray-200'}>
                                <th className="px-6 py-3 border border-gray-300">Level</th>
                                <th className="px-6 py-3 border border-gray-300">Number of Unique IDs</th>
                                <th className="px-6 py-3 border border-gray-300">Number of Stores</th>
                                <th className="px-6 py-3 border border-gray-300">Number of Vaccines</th>
                                <th className="px-6 py-3 border border-gray-300">Action</th>
                                <th className="px-6 py-3 border border-gray-300">Description</th>
                                <th className="px-6 py-3 border border-gray-300">Comments</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                className={`${colorClasses[level]?.row || 'bg-gray-100'} cursor-pointer`}
                                onClick={() => toggleLevel(level)}
                              >
                                <td className="px-6 py-4 border border-gray-300">{level}</td>
                                <td className="px-6 py-4 border border-gray-300">{getFilteredData(level).length}</td>
                                <td className="px-6 py-4 border border-gray-300">{new Set(getFilteredData(level).map(item => item.store_name)).size}</td>
                                <td className="px-6 py-4 border border-gray-300">{new Set(getFilteredData(level).map(item => item.vaccine_type)).size}</td>
                                <td className="px-6 py-4 border border-gray-300">{expandedLevels[level] ? 'Collapse' : 'Expand'}</td>
                                <td className="py-2 px-6 border border-gray-300 flex flex-col">
                                  <button className="bg-gray-500 text-white text-xs px-2 py-1 mb-2 rounded" data-tooltip-target="tooltip-funding">Funding</button>
                                  <button className="bg-gray-500 text-white text-xs px-2 py-1 mb-2 rounded" data-tooltip-target="tooltip-in-country-distribution">In Country Distribution</button>
                                  <button className="bg-gray-500 text-white text-xs px-2 py-1 mb-2 rounded" data-tooltip-target="tooltip-procurement-and-supply-unicef">Procurement and Supply (UNICEF)</button>
                                  <button className="bg-gray-500 text-white text-xs px-2 py-1 mb-2 rounded" data-tooltip-target="tooltip-storage-capacity-functionality">Storage capacity/functionality</button>
                                  <button className="bg-gray-500 text-white text-xs px-2 py-1 mb-2 rounded" data-tooltip-target="tooltip-procurement-and-supply-epi">Procurement and Supply (EPI)</button>
                                  <button className="bg-gray-500 text-white text-xs px-2 py-1 mb-2 rounded" data-tooltip-target="tooltip-forecasting-and-allocation">Forecasting and allocation</button>
                                </td>
                                <td className="px-6 py-4 border border-gray-300">Comments here</td>
                              </tr>
                              {expandedLevels[level] && (
                                <>
                                  <tr className={colorClasses[level]?.expandedHeader || 'bg-gray-300'}>
                                    <th className="px-6 py-3 border border-gray-300">Country</th>
                                    <th className="px-6 py-3 border border-gray-300">Store</th>
                                    <th className="px-6 py-3 border border-gray-300">Parent Store</th>
                                    <th className="px-6 py-3 border border-gray-300">Vaccine Type</th>
                                    <th className="px-6 py-3 border border-gray-300">3M Stockout Risk*</th>
                                    <th className="px-6 py-3 border border-gray-300">Curent Stataus(Min/Max)</th>
                                    <th className="px-6 py-3 border border-gray-300">Actions</th>
                                  </tr>
                                  {getFilteredData(level).map((item, index) => {
                                    const storeId = item.unique_id.split('-').slice(0, 3).join('-');
                                    const storeInfo = storeData[storeId];
                                    const storeDataRecord = Array.isArray(storeInfo) ? storeInfo[0] : storeInfo;
                                    const vaccineType = item.vaccine_type.toLowerCase();
                                    
                                    // Get parent store data
                                    console.log('Store Data Record', storeDataRecord);
                                    const parentStoreId = storeDataRecord?.parentstore;
                                    const parentStoreInfo = parentStoreId ? storeData[parentStoreId] : null;
                                    const parentStoreRecord = Array.isArray(parentStoreInfo) ? parentStoreInfo[0] : parentStoreInfo;
                                    const parentVaccineStock = parentStoreRecord?.[vaccineType];
                                   

                                    let progressBarContent = 'Loading...';
                                    if (storeDataRecord === null && level !== 'Central') {
                                      progressBarContent = 'No Data';
                                    } else if (
                                      storeDataRecord !== undefined &&
                                      level !== 'Central' &&
                                      storeDataRecord.hasOwnProperty(vaccineType) &&
                                      storeDataRecord.hasOwnProperty(`${vaccineType}_min`) &&
                                      storeDataRecord.hasOwnProperty(`${vaccineType}_max`)
                                    ) {
                                      const actual = storeDataRecord[vaccineType];
                                      const min = storeDataRecord[`${vaccineType}_min`];
                                      const max = storeDataRecord[`${vaccineType}_max`];

                                      if (actual < min) {
                                        const progress = ((actual - min) / (max - min)) * 100;
                                        const barWidth = Math.min(Math.abs(progress), 100);
                                        progressBarContent = (
                                          <div className="flex flex-col">
                                            <span className="text-sm font-bold text-center">Available Stock: {actual}</span>
                                            <div className="relative w-full h-4 bg-gray-200 rounded overflow-hidden">
                                            
                                              <div
                                                className="absolute top-0 left-0 h-4 bg-red-500 rounded"
                                                style={{ width: `${barWidth}%` }}
                                              ></div>
                                             
                                              <span className="absolute inset-0 flex items-center justify-center text-xs text-black">
                                                {progress.toFixed(0)}%
                                              </span>
                                            </div>
                                            <div className="flex justify-between text-xs mt-1">
                                              <span>Min: {min}</span>
                                              
                                              <span>Max: {max}</span>
                                            </div>
                                          </div>
                                        );
                                      } else {
                                        // Calculate progress percentage (can be >100)
                                        const progress = max !== min ? ((actual - min) / (max - min)) * 100 : 0;
                                        const barWidth = Math.min(progress, 100);
                                        progressBarContent = (
                                          <div className="flex flex-col">
                                            <span className="text-sm font-bold text-center">Avalible Stock: {actual}</span>
                                            <div className="relative w-full h-4 bg-gray-200 rounded overflow-hidden">
                                              <div
                                                className="absolute top-0 left-0 h-4 bg-green-500 rounded"
                                                style={{ width: `${barWidth}%` }}
                                              ></div>
                                              <span className="absolute inset-0 flex items-center justify-center text-xs text-black">
                                                {progress.toFixed(0)}%
                                              </span>
                                            </div>
                                            <div className="flex justify-between text-xs mt-1">
                                              <span>Min: {min}</span>
                                            
                                              <span>Max: {max}</span>
                                            </div>
                                          </div>
                                        );
                                      }
                                     
                                    } else if (storeDataRecord !== undefined && level !== 'Central') {
                                      progressBarContent = 'No Data';
                                    } else {
                                      progressBarContent = item.stockout_risk;
                                    }
                                  

                                    return (
                                      <tr key={index} className={colorClasses[level]?.expandedRow || 'bg-gray-50'}>
                                        <td className="px-6 py-4 border border-gray-300">{item.country_name}</td>
                                        <td className="px-6 py-4 border border-gray-300">
                                          <div className="flex flex-col">
                                            <span className="font-normal">{item.store_name}</span>
                                            <span className="text-xs text-gray-600">{item.unique_id}</span>
                                          </div>
                                        </td>
                                        <td className="px-6 py-4 border border-gray-300">
                                          <div className="flex flex-col">
                                          
                                            <span className=" text-sm font-bold">{parentStoreRecord?.adminlevel1}</span>
                                            
                                            <span className="text-xs">{storeDataRecord?.parentstore || 'No Parent Store'}</span>
                                            {parentVaccineStock !== undefined && (
                                              <span className="text-xs text-gray-600 font-bold">Parent Stock: {parentVaccineStock}</span>
                                            )}
                                          </div>
                                        </td>
                                        <td className="px-6 py-4 border border-gray-300">{item.vaccine_type}</td>
                                        <td className="px-6 py-4 border border-gray-300">{(item.probability * 100).toFixed(0)}%</td>
                                        <td className="px-6 py-4 border border-gray-300">
                                          {progressBarContent}
                                        </td>
                                        
                                        <td className="px-6 py-4 border border-gray-300">
                                          <div className="flex flex-col items-center">
                                            <span className="text-xs text-gray-500 mb-1">
                                              {new Date(item.report_date).toLocaleDateString()}
                                            </span>
                                            
                                            {/* Create Ticket button */}
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleCreateTicketForStore(item);
                                              }}
                                              className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded"
                                            >
                                              Create Ticket
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </>
          )}
          
          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <TicketSystem 
              userRole={userRole}
              userEmail={userEmail}
              countryCode={countryCode}
            />
          )}
        </>
      )}
    </div>
  );
};

export default StockOutTable;
