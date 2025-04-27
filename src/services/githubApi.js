const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

export async function searchUsers(query) {
    const finalQuery = `${query} repos:>5 followers:>10`;  // Auto add filters
  
    const response = await fetch(`https://api.github.com/search/users?q=${encodeURIComponent(finalQuery)}`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`
      }
    });
  
    if (!response.ok) {
      throw new Error('GitHub API request failed');
    }
  
    const data = await response.json();
    return data.items;
  }
  
  export async function fetchUserDetails(username) {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`
      }
    });
  
    if (!response.ok) {
      return {}; // fallback
    }
  
    const data = await response.json();
    return {
      bio: data.bio,
      blog: data.blog,
      twitter_username: data.twitter_username,
    };
  }
  export async function fetchUserRepos(username) {
    const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`
      }
    });
  
    if (!response.ok) {
      console.error('Fetching repos failed for', username);
      return [];
    }
  
    const data = await response.json();
    return data;
  }