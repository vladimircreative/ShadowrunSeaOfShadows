// ==================== CONFIG + DATA ====================
let currentUser = { nick: "", level: 1 };
let topics = [];
let users = [];

const levelNames = {
  1: { name: "Red",     class: "level-red" },
  2: { name: "Orange",  class: "level-orange" },
  3: { name: "Yellow",  class: "level-yellow" },
  4: { name: "Green",   class: "level-green" },
  5: { name: "Blue",    class: "level-blue" },
  6: { name: "Indigo",  class: "level-indigo" },
  7: { name: "Violet",  class: "level-violet" },
  8: { name: "White",   class: "level-white" },
  9: { name: "Black",   class: "level-black" }
};

// Load data
async function loadData() {
  try {
    const [topicsRes, usersRes] = await Promise.all([
      fetch('topics.json'),
      fetch('users.json')
    ]);
    topics = await topicsRes.json();
    users = await usersRes.json();
  } catch (e) {
    console.warn("Failed to load data files", e);
    topics = [];
    users = [];
  }
}

function getLevelInfo(level) {
  return levelNames[level] || { name: "Unknown", class: "" };
}

function findUser(nick) {
  if (!nick) return null;
  return users.find(u => u.nick.toLowerCase() === nick.toLowerCase());
}

async function handleLogin() {
  const input = document.getElementById('login-nick');
  let nick = input.value.trim();

  if (!nick) {
    nick = "Anonymous" + Math.floor(Math.random() * 999);
  }

  let user = findUser(nick);

  if (!user) {
    // New user
    user = { nick: nick, level: 1 };
    users.push(user);
    console.log(`New user created: ${nick} (Level 1)`);
  } else {
    console.log(`Existing user logged in: ${nick} (Level ${user.level})`);
  }

  currentUser = user;

  // Hide login modal
  document.getElementById('login-modal').style.display = 'none';

  // Update UI
  document.getElementById('username-display').textContent = currentUser.nick;
  updateUserDisplay();

  // Render topics AFTER user is set
  renderTopics();
}

function updateUserDisplay() {
  const info = getLevelInfo(currentUser.level);
  const el = document.getElementById('user-level-display');
  el.textContent = `${info.name} [Lv.${currentUser.level}]`;
  el.className = `level-name ${info.class}`;
}

function logout() {
  document.getElementById('login-modal').style.display = 'flex';
  document.getElementById('login-nick').value = currentUser.nick || '';
}

// Topic rendering
// Topic rendering - More robust version
function renderTopics() {
  const container = document.getElementById('topic-list');
  if (!container) {
    console.error("topic-list element not found!");
    return;
  }

  container.innerHTML = '';

  if (topics.length === 0) {
    container.innerHTML = '<div class="topic" style="color:#ff6688; padding:20px;">No topics loaded. Check topics.json</div>';
    return;
  }

  topics.forEach((topic, index) => {
    const isRestricted = (topic.minLevel || 1) > currentUser.level;

    const div = document.createElement('div');
    div.className = `topic ${isRestricted ? 'restricted' : ''}`;

    let displayTitle = topic.title || "Untitled Topic";
    let displayPosts = `${topic.messages ? topic.messages.length : 0} posts`;
    let displayLastPost = topic.lastPost || '—';

    if (isRestricted) {
      const corruptions = [
        "ACCESS DENIED"
      ];
      displayTitle = corruptions[Math.floor(Math.random() * corruptions.length)];
      displayPosts = "";
      displayLastPost = "";
    }

    div.innerHTML = `
      <div class="topic-title">
        ${index + 1}. ${displayTitle}
      </div>
      <div class="topic-info">
        ${displayPosts}<br>
        <small>${displayLastPost}</small>
      </div>
    `;

    if (!isRestricted) {
      div.style.cursor = "pointer";
      div.onclick = () => openTopic(topic);
    }

    container.appendChild(div);
  });
}

function openTopic(topic) {
  document.getElementById('topic-screen').style.display = 'none';
  const msgScreen = document.getElementById('message-screen');
  msgScreen.style.display = 'flex';

  document.getElementById('current-topic-title').textContent = topic.title;

  const messagesContainer = document.getElementById('messages');
  messagesContainer.innerHTML = '';

  topic.messages.forEach(msg => {
    const div = document.createElement('div');
    div.className = 'message';

    // Get color class for this user's level
    const levelInfo = getLevelInfo(msg.level);
    const nickColorClass = levelInfo.class || 'level-red';

    div.innerHTML = `
      <div class="message-header-info">
		  <span class="nickname ${nickColorClass}">${msg.nick}</span>
		  <span class="user-level ${nickColorClass}">[Lv.${msg.level}]</span>
		  <span class="timestamp">${msg.time}</span>
		</div>
      <div class="message-text">${msg.text}</div>
    `;
    messagesContainer.appendChild(div);
  });
}

function backToTopics() {
  document.getElementById('message-screen').style.display = 'none';
  document.getElementById('topic-screen').style.display = 'block';
}

// Initialize
window.onload = async () => {
  await loadData();
  document.getElementById('login-modal').style.display = 'flex';
};