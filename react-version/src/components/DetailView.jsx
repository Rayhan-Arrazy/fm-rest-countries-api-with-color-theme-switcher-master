import { useParams, useNavigate, Link } from 'react-router-dom';

function DetailView({ countries }) {
  const { code } = useParams();
  const navigate = useNavigate();

  // Guard clause for initial load when countries data hasn't finished fetching yet
  if (!countries || countries.length === 0) {
    return (
      <div className="loading-state">
        <p>Loading country details...</p>
      </div>
    );
  }

  // Find target country (case-insensitive to be highly resilient)
  const country = countries.find(c => c.code.toUpperCase() === code.toUpperCase());

  if (!country) {
    return (
      <div>
        <Link to="/" className="back-btn">
          <i className="fa-solid fa-arrow-left"></i> Back
        </Link>
        <div className="not-found-state">
          <h2>Country not found ({code})</h2>
          <p className="not-found-msg">The country code might be invalid or does not exist in our database.</p>
        </div>
      </div>
    );
  }

  // Helper function to map a 3-letter border code to its human-readable common name
  const getCountryNameByCode = (borderCode) => {
    const found = countries.find(c => c.code.toUpperCase() === borderCode.toUpperCase());
    return found ? found.name : borderCode;
  };

  return (
    <div>
      {/* Back Button */}
      <button type="button" className="back-btn" onClick={() => navigate(-1)}>
        <i className="fa-solid fa-arrow-left"></i> Back
      </button>

      {/* Main Details Flex Grid */}
      <div className="detail-container">
        {/* Flag Image Column */}
        <div className="detail__flag-wrapper">
          <img
            className="detail__flag"
            src={country.flag}
            alt={`Flag of ${country.name}`}
          />
        </div>

        {/* Text Content Column */}
        <div className="detail__content">
          <h2 className="detail__title">{country.name}</h2>

          <div className="detail__stats-row">
            {/* Stats Column 1 */}
            <ul className="detail__stats-col">
              <li><strong>Native Name:</strong> {country.nativeName}</li>
              <li><strong>Population:</strong> {country.population.toLocaleString()}</li>
              <li><strong>Region:</strong> {country.region}</li>
              <li><strong>Sub Region:</strong> {country.subregion}</li>
              <li><strong>Capital:</strong> {country.capital}</li>
            </ul>

            {/* Stats Column 2 */}
            <ul className="detail__stats-col">
              <li><strong>Top Level Domain:</strong> {country.tld}</li>
              <li><strong>Currencies:</strong> {country.currencies}</li>
              <li><strong>Languages:</strong> {country.languages}</li>
            </ul>
          </div>

          {/* Border Countries Badge Bar */}
          <div className="detail__borders-section">
            <h3 className="detail__borders-title">Border Countries:</h3>
            {country.borders && country.borders.length > 0 ? (
              <ul className="detail__borders-list">
                {country.borders.map(borderCode => (
                  <li key={borderCode}>
                    <Link
                      to={`/country/${borderCode}`}
                      className="border-badge"
                    >
                      {getCountryNameByCode(borderCode)}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="detail__borders-none">None</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailView;
