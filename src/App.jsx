import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import UserCard from './components/UserCard';
import { techList } from './techList';
import { searchUsers, fetchUserDetails, fetchUserRepos } from './services/githubApi';
import { getGeminiSummary } from './services/geminiApi';

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchStarted, setSearchStarted] = useState(false);

  async function handleSearch(query) {
    if (!query.trim()) return;
    try {
      setLoading(true);
      setSearchStarted(true);

      const result = await searchUsers(query);
      const lowerQuery = query.toLowerCase();
      const isTechSearch = techList.includes(lowerQuery);
      

      let finalUsers = [];
      if (isTechSearch) {

        console.log("Doing repo analysis search for tech:", query);

        finalUsers = await Promise.all(result.map(async (user) => {
          const repos = await fetchUserRepos(user.login);
          const matches = repos.some(repo =>
            repo.language && repo.language.toLowerCase() === lowerQuery
          );
          if (matches) return user;
          return null;
        }));

        finalUsers = finalUsers.filter(Boolean);
      } else {
        console.log("Doing bio/name search for:", query);
        finalUsers = result;
      }

      // SPLIT into individuals and organizations
      const individuals = finalUsers.filter(user => user.type === 'User');
      const organizations = finalUsers.filter(user => user.type === 'Organization');

      const MAX_SUMMARY = 3;

      const enrichProfiles = async (users, maxSummaries) => {
        return Promise.all(users.map(async (user, index) => {
          const details = await fetchUserDetails(user.login);
          const repos = await fetchUserRepos(user.login);

          const sortedRepos = repos
            .filter(repo => repo.language && repo.html_url)
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 3);

          const repoDetails = sortedRepos.map(repo => `
- Project Name: ${repo.name}
- Language: ${repo.language}
- Link: ${repo.html_url}
- Description: ${repo.description || "No description available"}
          `).join("\n");

          let aiSummary = null;
          if (index < maxSummaries) {
            const userInfo = `
You are analyzing a GitHub developer's public information.

Here are their 3 most recently updated repositories:

${repoDetails}

Their GitHub bio says:
"${details.bio || "No bio available."}"

TASK:
- Summarize the technologies they mainly use.
- Summarize the kind of projects they build.
- Summarize their recent work or contributions.
- Keep it short (2-4 sentences), clean, professional (no emojis).
- If information is limited, just say they are an active developer in their primary tech area.
            `;
            aiSummary = await getGeminiSummary(userInfo);
          }

          return {
            ...user,
            ...details,
            techStack: [...new Set(repos.map(repo => repo.language).filter(Boolean))].slice(0, 3),
            aiSummary
          };
        }));
      };

      const enrichedIndividuals = await enrichProfiles(individuals, MAX_SUMMARY);
      const enrichedOrganizations = await enrichProfiles(organizations, MAX_SUMMARY);

      setUsers([...enrichedIndividuals, ...enrichedOrganizations]);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)',  // soft gradient background
      position: 'relative',
    }}>
      {/* Floating GitHub Logos */}
      <img src="/github1.svg" alt="GitHub Logo" style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '150px',
        opacity: 0.04,
        borderRadius: '50%',
        filter: 'drop-shadow(0 0 15px #a18cd1)',
        animation: 'float 6s ease-in-out infinite alternate'
      }} />

      <img src="/github2.svg" alt="GitHub Logo" style={{
        position: 'absolute',
        bottom: '10%',
        right: '8%',
        width: '120px',
        opacity: 0.04,
        borderRadius: '50%',
        filter: 'drop-shadow(0 0 15px #fbc2eb)',
        animation: 'float2 8s ease-in-out infinite alternate'
      }} />

      <h1 style={{ color: '#333', marginBottom: '20px' }}>Git-Connect 🚀</h1>
      <p style={{
        marginTop: '10px',
        color: '#666',
        fontSize: '18px',
        fontWeight: '500',
        textAlign: 'center'
      }}>
        Real Developers. Real Connections. Build the Future Together.
      </p>
      <SearchBar onSearch={handleSearch} />

      {loading && <p>Loading...</p>}

      {!loading && searchStarted && users.length === 0 && (
        <p>No users found.</p>
      )}

      {!loading && users.length > 0 && (
        <div style={{ width: '100%', maxWidth: '1200px', marginTop: '30px' }}>
          {/* Individuals Section */}
          {users.filter(user => user.type === 'User').length > 0 && (
            <>
              <h2 style={{ color: '#555', marginBottom: '20px', textAlign: 'center' }}>Individuals</h2>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '40px',
                justifyContent: 'center',
                marginBottom: '60px',
                padding: '20px'
              }}>
                {users.filter(user => user.type === 'User').map(user => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            </>
          )}

          {/* Communities Section */}
          {users.filter(user => user.type === 'Organization').length > 0 && (
            <>
              <h2 style={{ color: '#555', marginBottom: '20px', textAlign: 'center' }}>Communities</h2>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '40px',
                justifyContent: 'center',
                marginBottom: '60px',
                padding: '20px'
              }}>
                {users.filter(user => user.type === 'Organization').map(user => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
