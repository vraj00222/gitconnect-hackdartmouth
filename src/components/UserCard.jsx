import React, { useState } from 'react';
import { FaGithub, FaLink, FaTwitter } from 'react-icons/fa';

function UserCard({ user }) {
  const [hovered, setHovered] = useState(false);

  const hasSummary = user.aiSummary && user.aiSummary !== "No AI summary available.";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '260px',
        minHeight: '340px',
        backgroundColor: hasSummary ? '#f4f1ff' : '#ffffff',
        borderRadius: '20px',
        padding: '20px',
        color: '#333',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: hovered
          ? '0 8px 24px rgba(138, 43, 226, 0.3)'
          : '0 4px 12px rgba(0,0,0,0.1)',
        transform: hovered ? 'translateY(-5px)' : 'none',
        transition: 'all 0.4s ease',
        border: hasSummary ? '2px solid #bfa2f7' : '1px solid #eee'
      }}
    >
      {hasSummary && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          backgroundColor: '#bfa2f7',
          color: 'white',
          fontSize: '12px',
          padding: '4px 8px',
          borderRadius: '12px',
          fontWeight: 'bold',
          boxShadow: '0 0 8px rgba(191, 162, 247, 0.7)'
        }}>
          Gemini AI
        </div>
      )}

      <img
        src={user.avatar_url}
        alt={user.login}
        style={{ width: '70px', height: '70px', borderRadius: '50%' }}
      />
      <h3 style={{ marginTop: '10px', fontSize: '18px', fontWeight: 'bold' }}>{user.login}</h3>

      {user.bio && (
        <p style={{ marginTop: '5px', fontSize: '13px', color: '#666' }}>
          {user.bio.length > 80 ? user.bio.slice(0, 80) + "..." : user.bio}
        </p>
      )}

      {user.techStack?.length > 0 && (
        <p style={{ marginTop: '8px', fontSize: '14px' }}>
          <strong>Stack:</strong> {user.techStack.join(" · ")}
        </p>
      )}

      {/* Social Links */}
      <div style={{
        marginTop: '10px',
        display: 'flex',
        gap: '12px',
        fontSize: '20px',
        justifyContent: 'center'
      }}>
        {user.html_url && (
          <a href={user.html_url} target="_blank" rel="noopener noreferrer" style={{ color: '#333' }}>
            <FaGithub />
          </a>
        )}
        {user.blog && (
          <a href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} target="_blank" rel="noopener noreferrer" style={{ color: '#333' }}>
            <FaLink />
          </a>
        )}
        {user.twitter_username && (
          <a href={`https://twitter.com/${user.twitter_username}`} target="_blank" rel="noopener noreferrer" style={{ color: '#333' }}>
            <FaTwitter />
          </a>
        )}
      </div>

      {/* AI Summary */}
      {hasSummary && (
        <div style={{
          marginTop: '14px',
          fontSize: '13px',
          color: '#444',
          maxHeight: '100px',
          overflowY: 'auto',
          textAlign: 'left',
          padding: '8px',
          backgroundColor: '#fafafa',
          borderRadius: '12px'
        }}>
          {user.aiSummary}
        </div>
      )}
    </div>
  );
}

export default UserCard;
