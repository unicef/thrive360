import React, { useState, useEffect } from 'react';
import { updateRaciMatrix, updateSlaConfig } from './api';

const TicketAdminPanel = ({ countryCode }) => {
  const [raciMatrix, setRaciMatrix] = useState({
    logistic: '',
    financing: '',
    gavi: '',
    unicefSd: '',
    unicefPd: '',
    unicefRo: '',
    unicefCo: '',
    epi: '',
    moh: ''
  });

  const [slaConfig, setSlaConfig] = useState({
    low: { response: 24, resolution: 72 },
    medium: { response: 12, resolution: 48 },
    high: { response: 6, resolution: 24 },
    critical: { response: 2, resolution: 8 }
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (countryCode) {
      loadConfigurations();
    }
  }, [countryCode]);

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      // TODO: Implement API calls to fetch existing configurations for specific country
      // const raciData = await fetchRaciMatrix(countryCode);
      // const slaData = await fetchSlaConfig(countryCode);
      // setRaciMatrix(raciData);
      // setSlaConfig(slaData);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load configurations' });
    } finally {
      setLoading(false);
    }
  };

  const handleRaciChange = (field, value) => {
    setRaciMatrix(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSlaChange = (priority, field, value) => {
    setSlaConfig(prev => ({
      ...prev,
      [priority]: {
        ...prev[priority],
        [field]: parseInt(value)
      }
    }));
  };

  const handleSaveRaci = async () => {
    try {
      setLoading(true);
      await updateRaciMatrix(countryCode, raciMatrix);
      setMessage({ type: 'success', text: 'RACI Matrix updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update RACI Matrix' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSla = async () => {
    try {
      setLoading(true);
      await updateSlaConfig(countryCode, slaConfig);
      setMessage({ type: 'success', text: 'SLA configuration updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update SLA configuration' });
    } finally {
      setLoading(false);
    }
  };

  if (!countryCode) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p>Please select a country to configure its settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ticket System Administration</h1>
        <div className="text-lg font-semibold text-gray-600">
          Country: {countryCode}
        </div>
      </div>
      
      {message.text && (
        <div className={`mb-4 p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* RACI Matrix Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">RACI Matrix Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(raciMatrix).map(([key, value]) => (
            <div key={key} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => handleRaciChange(key, e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter contact email"
              />
            </div>
          ))}
        </div>
        <button
          onClick={handleSaveRaci}
          disabled={loading}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save RACI Matrix'}
        </button>
      </div>

      {/* SLA Configuration Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">SLA Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(slaConfig).map(([priority, config]) => (
            <div key={priority} className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3 capitalize">{priority} Priority</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Response Time (hours)</label>
                  <input
                    type="number"
                    value={config.response}
                    onChange={(e) => handleSlaChange(priority, 'response', e.target.value)}
                    className="w-full p-2 border rounded-md"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Resolution Time (hours)</label>
                  <input
                    type="number"
                    value={config.resolution}
                    onChange={(e) => handleSlaChange(priority, 'resolution', e.target.value)}
                    className="w-full p-2 border rounded-md"
                    min="1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handleSaveSla}
          disabled={loading}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save SLA Configuration'}
        </button>
      </div>
    </div>
  );
};

export default TicketAdminPanel; 