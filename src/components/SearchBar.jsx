import React, { useState } from 'react';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '700px', marginTop: '20px' }}>
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#1c1c1e',
        padding: '10px 20px',
        borderRadius: '50px',
        border: '1px solid #333',
        boxShadow: '0 0 10px rgba(79,156,249,0.2)',
        transition: 'box-shadow 0.3s ease'
      }}>
        <input
          type="text"
          value={query}
          placeholder="Search developers, technologies, or communities..."
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: '1',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            outline: 'none',
            padding: '10px',
          }}
        />
        <button type="submit" style={{
          backgroundColor: '#4facfe',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '30px',
          color: 'white',
          fontWeight: '600',
          fontSize: '16px',
          cursor: 'pointer',
          marginLeft: '10px'
        }}>
          Search
        </button>
      </form>
    </div>
  );
}

export default SearchBar;
