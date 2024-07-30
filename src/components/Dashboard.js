export function initDashboard() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <h1>Welcome to Texas Hold'em Showdown</h1>
      <form id="login-form">
        <input type="text" id="username" placeholder="Username" required>
        <input type="password" id="password" placeholder="Password" required>
        <button type="submit">Login</button>
      </form>
      <div>
        <button id="leaderboard-btn">View Leaderboard</button>
      </div>
    `;
  
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      localStorage.setItem('username', username);
      localStorage.setItem('password', password);
      initGame();
    });
  
    document.getElementById('leaderboard-btn').addEventListener('click', () => {
      initLeaderboard();
    });
  }
  