// API service for fetching data

const API_BASE_URL = 'https://orekselc5g5qjsp5qz4kkj3eme0etgxp.lambda-url.us-east-1.on.aws';

/**
 * Fetch country data from the API
 */
export const fetchCountryData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/country/Nigeria`, { 
      mode: 'cors' 
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn('No country data found');
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching country data:', error);
    throw error;
  }
};

/**
 * Fetch store data from the API
 */
export const fetchStoreData = async (storeId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/storeid/${storeId}`,
      { mode: 'cors' }
    );

    // Check if response is not OK
    if (!response.ok) {
      // If it's a 404 or similar, treat it as a "no data" case.
      if (response.status === 404) {
        console.warn(`No data found for store ${storeId}`);
        return null;
      }
      console.warn(`Store ${storeId} returned status: ${response.status}`);
      return null; // Return null instead of throwing error
    }

    const json = await response.json();
    if (json.error) {
      console.warn(`Store ${storeId} returned error: ${json.error}`);
      return null;
    }
    return json;
  } catch (error) {
    // For network errors or other exceptions, log but don't throw
    console.warn(`Skipping store ${storeId} due to error: ${error.message}`);
    return null; // Return null instead of re-throwing
  }
};

// Ticket API functions
export const fetchTickets = async (userRole, countryCode = null) => {
  // In a real implementation, this would make an API call to get tickets
  // For now, we'll return mock data
  const mockTickets = [
    {
      id: 'TKT-001',
      title: 'BCG Vaccine Stock-out at Central Store',
      country: 'Ghana',
      level: 'Central',
      store: 'Accra Central Medical Store',
      storeId: 'GH-Ce-001',
      product: 'BCG',
      status: 'Open',
      priority: 'High',
      createdDate: '2023-10-15',
      creator: 'ghana.office@example.com',
      assignedTo: 'unicef.supply@example.com',
      oversight: 'gavi.program@example.com',
      description: 'The central store has completely run out of BCG vaccines. Urgent replenishment needed.',
      rootCause: 'Procurement',
      resolutionSteps: '',
      comments: [
        {
          user: 'ghana.office@example.com',
          role: 'Country Office',
          text: 'We need immediate assistance with expedited procurement.',
          timestamp: '2023-10-15T10:30:00Z'
        }
      ],
      resolutionDate: null
    },
    {
      id: 'TKT-002',
      title: 'OPV Supply Disruption at Regional Level',
      country: 'Kenya',
      level: 'Subnational',
      store: 'Nairobi Regional Store',
      storeId: 'KE-Su-002',
      product: 'OPV',
      status: 'In Progress',
      priority: 'Medium',
      createdDate: '2023-10-12',
      creator: 'kenya.office@example.com',
      assignedTo: 'kenya.office@example.com',
      oversight: 'unicef.supply@example.com',
      description: 'Transportation issues have disrupted supply chain to subnational level.',
      rootCause: 'Distribution',
      resolutionSteps: 'Working with local transportation partners to establish alternative routes.',
      comments: [
        {
          user: 'kenya.office@example.com',
          role: 'Country Office',
          text: 'Supply disruption due to flooding in the northern route.',
          timestamp: '2023-10-12T08:15:00Z'
        },
        {
          user: 'unicef.supply@example.com',
          role: 'UNICEF',
          text: 'We are coordinating with logistics partners to provide alternative transportation.',
          timestamp: '2023-10-13T14:25:00Z'
        }
      ],
      resolutionDate: null
    },
    // Nigeria tickets
    {
      id: 'TKT-003',
      title: 'Critical Shortage of Pentavalent Vaccine in Lagos',
      country: 'Nigeria',
      level: 'Subnational',
      store: 'Lagos State Vaccine Store',
      storeId: 'NG-Su-001',
      product: 'Pentavalent',
      status: 'Open',
      priority: 'Critical',
      createdDate: '2023-11-05',
      creator: 'nigeria.office@example.com',
      assignedTo: 'nigeria.office@example.com',
      oversight: 'unicef.supply@example.com',
      description: 'Lagos State Vaccine Store is reporting critically low levels of Pentavalent vaccine. Current stock will last only 7 days based on consumption patterns. This affects over 200 health facilities and thousands of children.',
      rootCause: 'Procurement',
      resolutionSteps: '',
      comments: [
        {
          user: 'nigeria.office@example.com',
          role: 'Country Office',
          text: 'Emergency situation. Current stock will last only one week. Need immediate resupply to avoid service disruption.',
          timestamp: '2023-11-05T09:15:00Z'
        }
      ],
      resolutionDate: null
    },
    {
      id: 'TKT-004',
      title: 'Cold Chain Equipment Failure at Kano Central Store',
      country: 'Nigeria',
      level: 'Central',
      store: 'Kano Central Medical Store',
      storeId: 'NG-Ce-002',
      product: 'Multiple',
      status: 'In Progress',
      priority: 'High',
      createdDate: '2023-11-10',
      creator: 'nigeria.office@example.com',
      assignedTo: 'unicef.supply@example.com',
      oversight: 'gavi.program@example.com',
      description: 'The main cold room at Kano Central Store is experiencing temperature fluctuations due to equipment failure. This puts at risk vaccines worth approximately $1.2 million, including OPV, BCG, and Yellow Fever vaccines.',
      rootCause: 'Storage',
      resolutionSteps: 'Technical team dispatched to assess the situation. Temporary relocation of vaccines to functioning cold rooms initiated.',
      comments: [
        {
          user: 'nigeria.office@example.com',
          role: 'Country Office',
          text: 'Cold chain equipment failure reported at Kano Central Store. Temperature readings showing fluctuations between 2-12°C over the past 24 hours.',
          timestamp: '2023-11-10T07:30:00Z'
        },
        {
          user: 'unicef.supply@example.com',
          role: 'UNICEF',
          text: 'Technical team dispatched to the site. ETA 3 hours. Please continue temperature monitoring and execute emergency protocol.',
          timestamp: '2023-11-10T08:45:00Z'
        },
        {
          user: 'nigeria.office@example.com',
          role: 'Country Office',
          text: 'Emergency protocol activated. Moving critical vaccines to backup storage. Will need replacement parts for compressor based on initial assessment.',
          timestamp: '2023-11-10T10:15:00Z'
        }
      ],
      resolutionDate: null
    },
    {
      id: 'TKT-005',
      title: 'Rotavirus Vaccine Stock-out in Abuja Local Facilities',
      country: 'Nigeria',
      level: 'Local',
      store: 'Abuja Municipal Area Council Clinics',
      storeId: 'NG-Lo-023',
      product: 'Rotavirus',
      status: 'Resolved',
      priority: 'Medium',
      createdDate: '2023-10-28',
      creator: 'nigeria.office@example.com',
      assignedTo: 'nigeria.office@example.com',
      oversight: 'unicef.supply@example.com',
      description: '15 health facilities in Abuja Municipal Area have reported stock-outs of Rotavirus vaccine. Last distribution was delayed due to administrative issues.',
      rootCause: 'Distribution',
      resolutionSteps: 'Expedited distribution from central store to affected facilities. Administrative process revised to prevent recurrence.',
      comments: [
        {
          user: 'nigeria.office@example.com',
          role: 'Country Office',
          text: 'Multiple facilities reporting Rotavirus vaccine stock-outs. Investigating distribution delay.',
          timestamp: '2023-10-28T11:20:00Z'
        },
        {
          user: 'unicef.supply@example.com',
          role: 'UNICEF',
          text: 'Sufficient stock available at central level. Please advise if additional support needed for distribution.',
          timestamp: '2023-10-28T13:45:00Z'
        },
        {
          user: 'nigeria.office@example.com',
          role: 'Country Office',
          text: 'Distribution completed to all affected facilities. Stock now available. Issue was administrative delay in approval process which has been streamlined for future distributions.',
          timestamp: '2023-11-02T09:10:00Z'
        }
      ],
      resolutionDate: '2023-11-02'
    },
    {
      id: 'TKT-006',
      title: 'Yellow Fever Buffer Stock Below Threshold',
      country: 'Nigeria',
      level: 'Central',
      store: 'National Strategic Cold Store, Abuja',
      storeId: 'NG-Ce-001',
      product: 'Yellow Fever',
      status: 'Pending Approval',
      priority: 'Medium',
      createdDate: '2023-11-12',
      creator: 'nigeria.office@example.com',
      assignedTo: 'gavi.program@example.com',
      oversight: 'unicef.supply@example.com',
      description: 'National buffer stock for Yellow Fever vaccine has fallen below the recommended 3-month threshold due to higher than forecasted utilization in recent outbreak response activities.',
      rootCause: 'Forecasting',
      resolutionSteps: 'Emergency procurement request submitted to increase buffer stock to 4-month level considering recent consumption patterns.',
      comments: [
        {
          user: 'nigeria.office@example.com',
          role: 'Country Office',
          text: 'Yellow Fever vaccine buffer stock at 1.5 months only. Recent outbreak response in North East depleted planned stocks. Requesting emergency procurement approval.',
          timestamp: '2023-11-12T14:30:00Z'
        },
        {
          user: 'unicef.supply@example.com',
          role: 'UNICEF',
          text: 'Procurement can be expedited once funding approval received. Estimated delivery time: 4 weeks from approval.',
          timestamp: '2023-11-13T09:20:00Z'
        },
        {
          user: 'gavi.program@example.com',
          role: 'GAVI',
          text: 'Reviewing funding request. Can we receive updated consumption data for the past 6 months to validate new forecasting model?',
          timestamp: '2023-11-13T11:45:00Z'
        },
        {
          user: 'nigeria.office@example.com',
          role: 'Country Office',
          text: 'Updated consumption data and forecast model attached. Includes adjustments for potential outbreak scenarios based on historical patterns and current surveillance data.',
          timestamp: '2023-11-14T08:15:00Z'
        }
      ],
      resolutionDate: null
    }
  ];

  // Filter tickets based on role and country
  if (userRole === 'Country Office' && countryCode) {
    return mockTickets.filter(ticket => ticket.country === countryCode);
  }
  
  return mockTickets;
};

export const createTicket = async (ticketData) => {
  // In a real implementation, this would make an API call to create a ticket
  // For now, we'll just return the ticket with an ID
  const newTicket = {
    ...ticketData,
    id: `TKT-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    createdDate: new Date().toISOString().split('T')[0],
    status: 'Open',
    comments: [
      {
        user: ticketData.creator,
        role: 'Country Office',
        text: `Created ticket: ${ticketData.title}`,
        timestamp: new Date().toISOString()
      }
    ],
    resolutionDate: null
  };
  
  return newTicket;
};

export const updateTicket = async (ticketId, updates) => {
  // In a real implementation, this would make an API call to update a ticket
  // For now, we'll just return the updated ticket
  return {
    id: ticketId,
    ...updates,
    updatedAt: new Date().toISOString()
  };
};

export const addComment = async (ticketId, comment) => {
  // In a real implementation, this would make an API call to add a comment
  // For now, we'll just return the comment with a timestamp
  return {
    ...comment,
    timestamp: new Date().toISOString()
  };
};

// RACI Matrix API functions
export const fetchRaciMatrix = async (countryCode) => {
  try {
    const response = await fetch(`${API_BASE_URL}/raci-matrix/${countryCode}`, { 
      mode: 'cors' 
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching RACI Matrix:', error);
    throw error;
  }
};

export const updateRaciMatrix = async (countryCode, raciMatrix) => {
  try {
    const response = await fetch(`${API_BASE_URL}/raci-matrix/${countryCode}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(raciMatrix),
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating RACI Matrix:', error);
    throw error;
  }
};

// SLA Configuration API functions
export const fetchSlaConfig = async (countryCode) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sla-config/${countryCode}`, { 
      mode: 'cors' 
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching SLA configuration:', error);
    throw error;
  }
};

export const updateSlaConfig = async (countryCode, slaConfig) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sla-config/${countryCode}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slaConfig),
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating SLA configuration:', error);
    throw error;
  }
};