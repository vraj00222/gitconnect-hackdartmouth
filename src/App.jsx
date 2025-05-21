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
          const matches = repos.some(repo => repo.language && repo.language.toLowerCase() === lowerQuery);
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
          const sortedRepos = repos.filter(repo => repo.language && repo.html_url).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 3);
          const repoDetails = sortedRepos.map(repo => `\n- Project Name: ${repo.name}\n- Language: ${repo.language}\n- Link: ${repo.html_url}\n- Description: ${repo.description || "No description available"}`).join("\n");

          let aiSummary = null;
          if (index < maxSummaries) {
            let userInfo;

if (user.type === 'Organization') {
  userInfo = `You're an AI summarizer helping analyze a GitHub organization or open-source community.

Summarize its recent activity based on:
- The most recent repositories
- Tech stack and common languages used
- The kind of tools, frameworks, or libraries it publishes

Be concise, professional, and neutral. Avoid assuming it's an individual. If limited data, just say it’s an active GitHub organization sharing public repositories.

Here is the GitHub activity to analyze:
${repoDetails}`;
} else {
  userInfo = `You're an AI summarizer helping analyze the public GitHub profile of a developer.

Summarize their recent activity based on:
- Their 3 most updated repositories
- The programming languages and tech used
- The type of projects or systems they work on
- Any consistent patterns across their work

Be helpful and conversational, like a professional assistant. Keep it to 2-4 sentences. If there's no bio, skip it gracefully.

Here is the GitHub activity to analyze:
${repoDetails}

Bio:
"${details.bio || "No bio available."}"`;
}
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          minHeight: 'calc(100vh - 120px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px',
          background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)',
          position: 'relative'
        }}>

        <motion.h1
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{ fontSize: '36px', fontWeight: 'bold', color: '#1e1e1e', marginTop: '20px' }}>
          Git-Connect 🚀
        </motion.h1>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ fontSize: '16px', color: '#555', textAlign: 'center', maxWidth: '600px' }}>
          Connect with real developers, powered by AI. Smart profiles, real collaboration.
        </motion.p>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{ width: '100%', maxWidth: '700px', marginTop: '20px' }}>
          <SearchBar onSearch={handleSearch} />
        </motion.div>

        {loading && <p>Loading...</p>}

        {!loading && searchStarted && users.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: '60px',
              color: '#666'
            }}>
            <img src="/novitalogo.png" alt="Novita AI Logo" style={{ width: '90px', opacity: 0.1 }} />
            <p style={{ marginTop: '20px', fontSize: '16px' }}>
  No results found.
</p>

          </motion.div>
        )}

        {!loading && users.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ width: '100%', maxWidth: '1200px', marginTop: '30px' }}>

            {users.filter(user => user.type === 'User').length > 0 && (
              <>
                <h2 style={{ textAlign: 'center' }}>Individuals</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'center' }}>
                  {users.filter(user => user.type === 'User').map(user => (
                    <motion.div
                      key={user.id}
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.4 }}>
                      <UserCard user={user} />
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {users.filter(user => user.type === 'Organization').length > 0 && (
              <>
                <h2 style={{ textAlign: 'center' }}>Communities</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'center' }}>
                  {users.filter(user => user.type === 'Organization').map(user => (
                    <motion.div
                      key={user.id}
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.4 }}>
                      <UserCard user={user} />
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Footer */}
      <div style={{
        padding: '20px 10px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#888',
        borderTop: '1px solid #eee',
        backgroundColor: '#f8f9fb'
      }}>
        <p>🚀 Powered by <a href="https://novita.ai" target="_blank" rel="noopener noreferrer" style={{ color: '#4f46e5', fontWeight: '600' }}>Novita AI</a></p>
        <p style={{ fontSize: '13px', marginTop: '4px' }}>🏆 Winner of the Novita AI Prize @ HackDartmouth X</p>
      </div>
    </>
  );
}

export default App;
