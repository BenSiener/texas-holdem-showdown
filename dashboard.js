function initApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Texas Hold'em Showdown</h1>
    <div id="login-area">
      <input type="text" id="username" placeholder="Enter your username">
      <button id="login-btn">Login</button>
    </div>
  `;

  document.getElementById('login-btn').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    if (username) {
      localStorage.setItem('username', username);
      initGame();
    } else {
      alert('Please enter a username.');
    }
  });
}

window.onload = initApp;

