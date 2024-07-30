export function initLeaderboard() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <h1>Leaderboard</h1>
      <ul id="leaderboard">
        <!-- Leaderboard entries will be inserted here -->
      </ul>
      <button id="back-btn">Back to Dashboard</button>
    `;
  
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    const leaderboardElement = document.getElementById('leaderboard');
  
    leaderboard.forEach(entry => {
      const li = document.createElement('li');
      li.textContent = `${entry.username}: ${entry.score}`;
      leaderboardElement.appendChild(li);
    });
  
    document.getElementById('back-btn').addEventListener('click', () => {
      initDashboard();
    });
  }
  