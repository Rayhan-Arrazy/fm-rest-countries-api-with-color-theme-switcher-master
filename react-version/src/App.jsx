import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import HomeView from './components/HomeView';
import DetailView from './components/DetailView';

/**
 * Normalizes country data from both REST Countries API v3.1 and local data.json (v2)
 * into a single unified schema for frontend components.
 */
function normalizeCountryData(country) {
  if (!country) return null;

  // 1. Resolve Name
  const name = typeof country.name === 'object' && country.name !== null
    ? (country.name.common || country.name.official || 'Unknown')
    : (country.name || 'Unknown');

  // 2. Resolve Code (CCA3 / Alpha3)
  const code = String(country.cca3 || country.alpha3Code || country.cioc || '').toUpperCase();

  // 3. Resolve Capital
  const capital = Array.isArray(country.capital)
    ? (country.capital[0] || 'N/A')
    : (country.capital || 'N/A');

  // 4. Resolve Currencies (standardizing into a simple string list)
  let currencies = [];
  if (country.currencies) {
    if (Array.isArray(country.currencies)) {
      currencies = country.currencies.filter(Boolean).map(c => c.name || '');
    } else {
      currencies = Object.values(country.currencies).filter(Boolean).map(c => c.name || '');
    }
  }

  // 5. Resolve Languages (standardizing into a simple string list)
  let languages = [];
  if (country.languages) {
    if (Array.isArray(country.languages)) {
      languages = country.languages.filter(Boolean).map(l => l.name || '');
    } else {
      languages = Object.values(country.languages).filter(Boolean).map(l => typeof l === 'object' && l !== null ? l.name : l);
    }
  }

  // 6. Resolve Borders
  const borders = Array.isArray(country.borders) ? country.borders : [];

  // 7. Resolve Top Level Domain (TLD)
  let tld = 'N/A';
  if (Array.isArray(country.tld) && country.tld.length > 0 && country.tld[0]) {
    tld = country.tld[0];
  } else if (Array.isArray(country.topLevelDomain) && country.topLevelDomain.length > 0 && country.topLevelDomain[0]) {
    tld = country.topLevelDomain[0];
  }

  return {
    name,
    code,
    capital,
    region: country.region || 'N/A',
    subregion: country.subregion || 'N/A',
    population: country.population || 0,
    nativeName: typeof country.name === 'object' && country.name !== null
      ? (Object.values(country.name.nativeName || {})[0]?.common || name)
      : (country.nativeName || name),
    tld,
    flag: country.flags?.svg || country.flags?.png || country.flag || '',
    borders,
    currencies: currencies.filter(Boolean).join(', ') || 'N/A',
    languages: languages.filter(Boolean).join(', ') || 'N/A'
  };
}


function App() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Theme State Setup
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  // Apply Theme Attribute on Document Element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch Countries Data (API with local JSON fallback)
  useEffect(() => {
    const fetchCountriesData = async () => {
      const API_URL = 'https://restcountries.com/v3.1/all';
      const FALLBACK_URL = '/data.json'; // Located in the public folder or root fallback

      try {
        setLoading(true);
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setCountries(data.map(normalizeCountryData).filter(Boolean));
        setLoading(false);
      } catch (err) {
        console.warn('REST Countries API failed, attempting fallback to data.json', err);
        try {
          // Attempt loading from local public/data.json
          const response = await fetch(FALLBACK_URL);
          if (!response.ok) throw new Error('Fallback failed', { cause: err });
          const data = await response.json();
          setCountries(data.map(normalizeCountryData).filter(Boolean));
          setLoading(false);
        } catch (fallbackErr) {
          console.error('All data sources failed:', fallbackErr);
          setError('Failed to fetch country data. Please check your connection.');
          setLoading(false);
        }
      }
    };

    fetchCountriesData();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <Router>
      <div className="app-wrapper">
        {/* Sticky Header */}
        <header className="header">
          <div className="container header__content">
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1 className="header__title">Where in the world?</h1>
            </Link>
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
            >
              <i className={theme === 'dark' ? 'fa-solid fa-moon' : 'fa-regular fa-moon'}></i>
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </header>

        {/* Main Content Router Views */}
        <main className="container" style={{ padding: '40px 24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p>Loading countries data...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'red' }}>
              <p>{error}</p>
            </div>
          ) : (
            <Routes>
              {/* Homepage List View Route */}
              <Route
                path="/"
                element={<HomeView countries={countries} />}
              />

              {/* Detail Page Route */}
              <Route
                path="/country/:code"
                element={<DetailView countries={countries} />}
              />
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;
