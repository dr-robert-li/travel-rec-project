// Function to fetch travel data
async function fetchTravelData() {
    try {
        const response = await fetch('travel_recommendation_api.json');
        const data = await response.json();
        console.log('Travel Data:', data);
        return data; // Only return data, don't display it
    } catch (error) {
        console.log('Error fetching travel data:', error);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchTravelData(); // Just fetch the data, don't display it
});

function createDestinationCard(item, timeZone) {
    const timeOptions = {
        hour12: true,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    };
    
    const localTime = new Date().toLocaleTimeString('en-US', { ...timeOptions, timeZone });
    console.log(`Current time in ${item.name}:`, localTime);

    return `
        <div class="destination-card">
            <img src="${item.imageUrl}" alt="${item.name}">
            <div class="content">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <p class="local-time">Local Time: ${localTime}</p>
            </div>
        </div>
    `;
}

// Function to display travel data
function displayTravelData(results) {
    const resultsContainer = document.querySelector('.results-container');
    const resultsGrid = document.querySelector('.results-grid');

    // Clear previous results
    resultsGrid.innerHTML = '';

    // Display results if we have any
    if (results && results.length > 0) {
        resultsContainer.classList.add('active');
        resultsGrid.innerHTML = results.map(item => 
            createDestinationCard(item, getTimeZone(item.name))
        ).join('');
    } else {
        resultsContainer.classList.remove('active');
    }
}

// Helper function to get time zone based on location
function getTimeZone(location) {
    const timeZones = {
        'Sydney': 'Australia/Sydney',
        'Melbourne': 'Australia/Melbourne',
        'Tokyo': 'Asia/Tokyo',
        'Kyoto': 'Asia/Tokyo',
        'Rio de Janeiro': 'America/Sao_Paulo',
        'São Paulo': 'America/Sao_Paulo',
        'Cambodia': 'Asia/Phnom_Penh',
        'India': 'Asia/Kolkata',
        'French Polynesia': 'Pacific/Tahiti',
        'Brazil': 'America/Sao_Paulo'
    };

    return Object.keys(timeZones).find(key => location.includes(key)) 
        ? timeZones[Object.keys(timeZones).find(key => location.includes(key))]
        : 'UTC';
}

// Function to search through all destinations
function searchDestinations(data, searchTerm) {
    // Normalize search term
    searchTerm = searchTerm.toLowerCase();
    
    // Get all destinations in a single array
    let allDestinations = [];

    // Check for category keywords and include all items in that category
    if (searchTerm.includes('beach') || searchTerm.includes('beaches')) {
        allDestinations = data.beaches;
        return allDestinations;
    }
    else if (searchTerm.includes('temple') || searchTerm.includes('temples')) {
        allDestinations = data.temples;
        return allDestinations;
    }
    else if (searchTerm.includes('country') || searchTerm.includes('countries')) {
        allDestinations = data.countries.flatMap(country => country.cities);
        return allDestinations;
    }
    else {
        // For other searches, combine all destinations
        allDestinations = [
            ...data.countries.flatMap(country => country.cities),
            ...data.temples,
            ...data.beaches
        ];

        // Return all matches
        return allDestinations.filter(destination => 
            destination.name.toLowerCase().includes(searchTerm) || 
            destination.description.toLowerCase().includes(searchTerm)
        );
    }
}

// Function to handle search button click
async function search() {
    const searchInput = document.querySelector('.search-section input');
    const searchTerm = searchInput.value;
    
    if (searchTerm.trim() === '') {
        console.log('Please enter a search term');
        return;
    }

    const data = await fetchTravelData();
    const searchResults = searchDestinations(data, searchTerm);
    console.log('Search Results:', searchResults);
    displayTravelData(searchResults);
}

// Function to reset search
function reset() {
    const searchInput = document.querySelector('.search-section input');
    const resultsContainer = document.querySelector('.results-container');
    searchInput.value = '';
    
    // Clear all result sections
    document.querySelectorAll('.results-grid').forEach(grid => {
        grid.innerHTML = '';
    });
    
    // Hide section headers if no results
    document.querySelectorAll('.result-section').forEach(section => {
        section.style.display = 'none';
    });

    // Hide the entire results container
    resultsContainer.classList.remove('active');
    
    console.log('Search reset');
    fetchTravelData(); // Reload all destinations
}