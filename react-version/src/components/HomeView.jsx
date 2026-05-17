import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HomeView({ countries }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Toggle custom dropdown
  const toggleDropdown = () => setDropdownOpen(prev => !prev);

  // Select a region option
  const selectRegion = (region) => {
    setSelectedRegion(region);
    setDropdownOpen(false);
  };

  // Close dropdown on click outside can be added via hook, but standard toggle is already robust
  const handleDropdownBlur = (e) => {
    // Timeout allows option click event to fire before dropdown closes
    setTimeout(() => {
      setDropdownOpen(false);
    }, 200);
  };

  // Combined Searching & Filtering Logic
  const filteredCountries = countries.filter(country => {
    const matchesSearch = country.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === '' || country.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  return (
    <div>
      {/* Search and Filter Controls */}
      <div className="controls-row">
        {/* Search Input Container */}
        <div className="search-container">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search for a country..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
        </div>

        {/* Custom styled Region Dropdown Container */}
        <div className="filter-container" onBlur={handleDropdownBlur}>
          <button 
            className="filter-btn" 
            onClick={toggleDropdown}
            aria-haspopup="listbox" 
            aria-expanded={dropdownOpen}
          >
            <span>{selectedRegion ? selectedRegion : 'Filter by Region'}</span>
            <i className="fa-solid fa-chevron-down"></i>
          </button>
          
          <ul className={`filter-options ${dropdownOpen ? 'show' : ''}`} role="listbox">
            <li className="filter-option" onClick={() => selectRegion('')} role="option">All Regions</li>
            <li className="filter-option" onClick={() => selectRegion('Africa')} role="option">Africa</li>
            <li className="filter-option" onClick={() => selectRegion('Americas')} role="option">Americas</li>
            <li className="filter-option" onClick={() => selectRegion('Asia')} role="option">Asia</li>
            <li className="filter-option" onClick={() => selectRegion('Europe')} role="option">Europe</li>
            <li className="filter-option" onClick={() => selectRegion('Oceania')} role="option">Oceania</li>
          </ul>
        </div>
      </div>

      {/* Countries Cards Grid */}
      <div className="countries-grid">
        {filteredCountries.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 0', fontSize: '18px', opacity: 0.7 }}>
            No countries match your search criteria.
          </div>
        ) : (
          filteredCountries.map(country => (
            <div 
              key={country.code} 
              className="card" 
              role="link" 
              tabIndex={0}
              onClick={() => navigate(`/country/${country.code}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate(`/country/${country.code}`);
              }}
            >
              <div className="card__flag-wrapper">
                <img className="card__flag" src={country.flag} alt={`${country.name} Flag`} loading="lazy" />
              </div>
              <div className="card__info">
                <h2 className="card__name">{country.name}</h2>
                <ul class="card__details">
                  <li><strong>Population:</strong> {country.population.toLocaleString()}</li>
                  <li><strong>Region:</strong> {country.region}</li>
                  <li><strong>Capital:</strong> {country.capital}</li>
                </ul>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default HomeView;
