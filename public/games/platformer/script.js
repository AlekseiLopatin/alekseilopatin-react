const startBtn = document.getElementById("start-btn");
const canvas = document.getElementById("canvas");
const startScreen = document.querySelector(".start-screen");
const checkpointScreen = document.querySelector(".checkpoint-screen");
const checkpointMessage = document.querySelector(".checkpoint-screen > p");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;
const gravity = 0.5;
let isCheckpointCollisionDetectionActive = true;

// Theme management
const themes = ['theme-desert', 'theme-ocean', 'theme-forest', 'theme-sunset', 'theme-midnight', 'theme-victory'];
let currentThemeIndex = 0;

// Helper function to get CSS variable values
const getCSSVariable = (variable) => {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
};

// Function to change theme
const changeTheme = (themeIndex) => {
  // Remove all existing theme classes
  document.body.className = document.body.className.replace(/theme-\w+/g, '');
  
  // Add new theme class
  if (themeIndex < themes.length) {
    document.body.classList.add(themes[themeIndex]);
    currentThemeIndex = themeIndex;
    console.log(`Theme changed to: ${themes[themeIndex]}`);
  }
};

const proportionalSize = (size) => {
  return innerHeight < 500 ? Math.ceil((size / 500) * innerHeight) : size;
}

class Player {
  constructor() {
    this.position = { x: proportionalSize(10), y: proportionalSize(400) };
    this.velocity = { x: 0, y: 0 };
    this.width = proportionalSize(50);
    this.height = proportionalSize(70);

    this.image = new Image();
    this.image.src = "../../media/player_idle.png"; 
  }
  draw() {
    // Fallback to colored rectangle if image fails to load
    if (this.image.complete && this.image.naturalWidth > 0) {
      ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    } else {
      ctx.fillStyle = getCSSVariable('--player-color');
      ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.y + this.height + this.velocity.y <= canvas.height) {
      if (this.position.y < 0) {
        this.position.y = 0;
        this.velocity.y = gravity;
      }
      this.velocity.y += gravity;
      } else {
        this.velocity.y = 0;
    }
  }
}

class Platform {
  constructor(x, y) {
    this.position = {
      x,
      y,
    };
    this.width = 200;
    this.height = proportionalSize(40);
  }
  draw() {
    ctx.fillStyle = getCSSVariable('--platform-color');
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

class CheckPoint {
  constructor(x, y, z) {
    this.position = {
      x,
      y,
    };
    this.width = proportionalSize(40);
    this.height = proportionalSize(70);
    this.claimed = false;
  };

  draw() {
    ctx.fillStyle = getCSSVariable('--checkpoint-color');
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  claim() {
    this.width = 0;
    this.height = 0;
    this.position.y = Infinity;
    this.claimed = true;
  }
};

const player = new Player();

const platformPositions = [
  { x: 500, y: proportionalSize(450) },
  { x: 700, y: proportionalSize(400) },
  { x: 850, y: proportionalSize(350) },
  { x: 900, y: proportionalSize(350) },
  { x: 1050, y: proportionalSize(150) },
  { x: 2500, y: proportionalSize(450) },
  { x: 2900, y: proportionalSize(400) },
  { x: 3150, y: proportionalSize(350) },
  { x: 3900, y: proportionalSize(450) },
  { x: 4200, y: proportionalSize(400) },
  { x: 4400, y: proportionalSize(200) },
  { x: 4700, y: proportionalSize(150) },
];

const platforms = platformPositions.map(
  (platform) => new Platform(platform.x, platform.y)
);

const checkpointPositions = [
  { x: 1170, y: proportionalSize(80), z: 1 },
  { x: 2900, y: proportionalSize(330), z: 2 },
  { x: 3250, y: proportionalSize(280), z: 3 },
  { x: 4300, y: proportionalSize(280), z: 4 },
  { x: 4500, y: proportionalSize(280), z: 5 },
  { x: 4800, y: proportionalSize(80), z: 6 },
];

const checkpoints = checkpointPositions.map(
  (checkpoint) => new CheckPoint(checkpoint.x, checkpoint.y, checkpoint.z)
);

const animate = () => {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  platforms.forEach((platform) => {
    platform.draw();
  });

  checkpoints.forEach(checkpoint => {
    checkpoint.draw();
  });

  player.update();

  if (keys.rightKey.pressed && player.position.x < proportionalSize(400)) {
    player.velocity.x = 5;
  } else if (keys.leftKey.pressed && player.position.x > proportionalSize(100)) {
    player.velocity.x = -5;
  } else {
    player.velocity.x = 0;

    if (keys.rightKey.pressed && isCheckpointCollisionDetectionActive) {
      platforms.forEach((platform) => {
        platform.position.x -= 5;
      });

      checkpoints.forEach((checkpoint) => {
        checkpoint.position.x -= 5;
      });
    
    } else if (keys.leftKey.pressed && isCheckpointCollisionDetectionActive) {
      platforms.forEach((platform) => {
        platform.position.x += 5;
      });

      checkpoints.forEach((checkpoint) => {
        checkpoint.position.x += 5;
      });
    }
  }

  platforms.forEach((platform) => {
    const collisionDetectionRules = [
      player.position.y + player.height <= platform.position.y,
      player.position.y + player.height + player.velocity.y >= platform.position.y,
      player.position.x >= platform.position.x - player.width / 2,
      player.position.x <=
        platform.position.x + platform.width - player.width / 3,
    ];

    if (collisionDetectionRules.every((rule) => rule)) {
      player.velocity.y = 0;
      return;
    }

    const platformDetectionRules = [
      player.position.x >= platform.position.x - player.width / 2,
      player.position.x <=
        platform.position.x + platform.width - player.width / 3,
      player.position.y + player.height >= platform.position.y,
      player.position.y <= platform.position.y + platform.height,
    ];

    if (platformDetectionRules.every(rule => rule)) {
      player.position.y = platform.position.y + player.height;
      player.velocity.y = gravity;
    };
  });

  checkpoints.forEach((checkpoint, index, checkpoints) => {
    // Skip if checkpoint already claimed
    if (checkpoint.claimed) return;
    
    // Standard bounding box collision detection
    const isColliding = 
      player.position.x < checkpoint.position.x + checkpoint.width &&
      player.position.x + player.width > checkpoint.position.x &&
      player.position.y < checkpoint.position.y + checkpoint.height &&
      player.position.y + player.height > checkpoint.position.y;
    
    // Check if collision is active and checkpoint can be claimed (in order)
    const canClaim = 
      isCheckpointCollisionDetectionActive &&
      (index === 0 || checkpoints[index - 1].claimed === true);

    if (isColliding && canClaim) {
      console.log(`Checkpoint ${index + 1} claimed!`);
      checkpoint.claim();
      
      // Change theme based on checkpoint index
      changeTheme(index);

      if (index === checkpoints.length - 1) {
        // Final checkpoint reached - use victory theme
        console.log("Final checkpoint reached! Game complete!");
        isCheckpointCollisionDetectionActive = false;
        showCheckpointScreen("🎉 Victory! You completed Block Warrior! 🎉");
        movePlayer("ArrowRight", 0, false);
      } else {
        // Regular checkpoint reached
        
        showCheckpointScreen(`Checkpoint reached!`);
      }
    }
    
    // Debug info (remove this later if you want)
    if (isColliding && !canClaim) {
      console.log(`Collision with checkpoint ${index + 1}, but can't claim yet. Previous claimed: ${index === 0 ? 'N/A' : checkpoints[index - 1].claimed}`);
    }
  });
}


const keys = {
  rightKey: {
    pressed: false
  },
  leftKey: {
    pressed: false
  }
};

const movePlayer = (key, xVelocity, isPressed) => {
  if (!isCheckpointCollisionDetectionActive) {
    player.velocity.x = 0;
    player.velocity.y = 0;
    return;
  }

  switch (key) {
    case "ArrowLeft":
      keys.leftKey.pressed = isPressed;
      if (xVelocity === 0) {
        player.velocity.x = xVelocity;
      }
      player.velocity.x -= xVelocity;
      break;
    case "ArrowUp":
    case " ":
    case "Spacebar":
      player.velocity.y -= 8;
      break;
    case "ArrowRight":
      keys.rightKey.pressed = isPressed;
      if (xVelocity === 0) {
        player.velocity.x = xVelocity;
      }
      player.velocity.x += xVelocity;
  }
}

const startGame = () => {
  canvas.style.display = "block";
  startScreen.style.display = "none";
  
  // Initialize with desert theme
  changeTheme(0);
  
  animate();
}

const showCheckpointScreen = (msg) => {
  checkpointScreen.style.display = "block";
  checkpointMessage.textContent = msg;
  if (isCheckpointCollisionDetectionActive) {
    setTimeout(() => (checkpointScreen.style.display = "none"), 2000);
  }
};

startBtn.addEventListener("click", startGame);

window.addEventListener("keydown", ({ key }) => {
  movePlayer(key, 8, true);
});

window.addEventListener("keyup", ({ key }) => {
  movePlayer(key, 0, false);
});
