import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import UserCard from './components/UserCard';
import { techList } from './techList';
import { searchUsers, fetchUserDetails, fetchUserRepos } from './services/githubApi';
import { getNovitaSummary } from './services/novitaApi';
import { motion } from 'framer-motion';

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
        finalUsers = await Promise.all(result.map(async (user) => {
          const repos = await fetchUserRepos(user.login);
          const matches = repos.some(repo =>
            repo.language && repo.language.toLowerCase() === lowerQuery
          );
          return matches ? user : null;
        }));
        finalUsers = finalUsers.filter(Boolean);
      } else {
        finalUsers = result;
      }

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
You are analyzing the GitHub activity of a software developer.

Here are their 3 most recently updated repositories:
${repoDetails}

Their GitHub bio:
"${details.bio || "No bio available."}"

TASK:
- Identify the technologies they frequently use.
- Describe the type of projects they tend to build.
- Comment on any recent contributions or patterns you see.
- Format the summary in 2-4 concise and professional sentences.
- If there's not enough data, say: "This developer appears active in their core tech area."
`;
            aiSummary = await getNovitaSummary(userInfo);
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
    <>
      <div style={{
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)',
        position: 'relative',
      }}>
        {/* Floating Background Logos */}
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
        <img src="/novitalogo.png" alt="Novita AI Logo" style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '180px',
          opacity: 0.03,
          zIndex: 0,
          animation: 'floatNovita 10s ease-in-out infinite alternate',
          filter: 'blur(1px)'
        }} />

        {/* Header with Animation */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            color: '#1e1e1e',
            marginBottom: '10px',
            fontSize: '36px',
            fontWeight: '700',
            marginTop: '20px'
          }}
        >
          Git-Connect 🚀
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            marginTop: '0px',
            color: '#555',
            fontSize: '16px',
            fontWeight: '500',
            textAlign: 'center',
            maxWidth: '600px',
            lineHeight: '1.5'
          }}
        >
          Connect with real developers, powered by AI. Smart profiles, real collaboration.
        </motion.p>

        <SearchBar onSearch={handleSearch} />

        {loading && <p>Loading...</p>}
        {!loading && searchStarted && users.length === 0 && <p>No users found.</p>}

        {!loading && users.length > 0 && (
          <div style={{ width: '100%', maxWidth: '1200px', marginTop: '30px' }}>
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

      {/* Footer (fixed outside main layout) */}
      <div style={{
        padding: '20px 10px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#888',
        borderTop: '1px solid #eee',
        backgroundColor: '#f8f9fb',
      }}>
        <p>🚀 Powered by <a href="https://novita.ai" target="_blank" rel="noopener noreferrer" style={{ color: '#4f46e5', fontWeight: '600' }}>Novita AI</a></p>
        <p style={{ fontSize: '13px', marginTop: '4px' }}>🏆 Winner of the Novita AI Prize @ HackDartmouth X</p>
      </div>
    </>
  );
}

export default App;
