import { assets as AssetManager } from './assetManager.js';
import style from '../css/game.css';

const privateMethods = {
  calculateOpenPosition: Symbol.for('calculateOpenPosition'),
  checkIfSkierHitObstacle: Symbol.for('checkIfSkierHitObstacle'),
  drawObstacles: Symbol.for('drawObstacles'),
  drawSkier: Symbol.for('drawSkier'),
  gameLoop: Symbol.for('gameLoop'),
  intersectRect: Symbol.for('intersectRect'),
  moveSkier: Symbol.for('moveSkier'),
  placeInitialObstacles: Symbol.for('placeInitialObstacles'),
  placeNewObstacle: Symbol.for('placeNewObstacle'),
  placeRandomObstacle: Symbol.for('placeRandomObstacle'),
  random: Symbol.for('random'),
  setupKeyhandler: Symbol.for('setupKeyhandler'),
};

const initialState = {
  obstacles: [],
  skierDirection: 5,
  skierMapX: 0,
  skierMapY: 0,
  skierSpeed: 8,
  gameWidth: null,
  gameHeight: null
};

class GameMaster {
  constructor() {
    const { innerWidth, innerHeight, devicePixelRatio } = window;
    this.state = Object.assign({}, JSON.parse(JSON.stringify(initialState)), {
      gameWidth: innerWidth,
      gameHeight: innerHeight,
    });

    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', innerWidth * devicePixelRatio)
    canvas.setAttribute('height', innerHeight * devicePixelRatio)
    canvas.setAttribute('style', `width: {innerWidth}px, height: {innerHeight}px`);
    document.body.appendChild(canvas);

    this.ctx = canvas.getContext('2d');
  }

  initGame = () => {
    AssetManager.load.call(this).then(() => {
      this[privateMethods.placeInitialObstacles]();
      window.addEventListener('keydown', this[privateMethods.setupKeyhandler].bind(this));
      window.requestAnimationFrame(this[privateMethods.gameLoop].bind(this));
    });
  }

  [privateMethods.gameLoop]() {
    const { ctx } = this;

    ctx.save();
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio); // Retina support
    this[privateMethods.clearCanvas]();

    this[privateMethods.moveSkier]();
    this[privateMethods.checkIfSkierHitObstacle]();

    this[privateMethods.drawSkier]();
    this[privateMethods.drawObstacles]();

    ctx.restore();
    window.requestAnimationFrame(this[privateMethods.gameLoop].bind(this));
  }

  [privateMethods.calculateOpenPosition](minX, maxX, minY, maxY) {
    const x = this[privateMethods.random](minX, maxX);
    const y = this[privateMethods.random](minY, maxY);
    const foundCollision = this.state.obstacles.find(({ x: obX, y: obY }) => x > (obX - 50) && x < (obX + 50) && y > (obY - 50) && y < (obY + 50));

    return foundCollision ? this[privateMethods.calculateOpenPosition](minX, maxX, minY, maxY) : { x, y };
  }

  [privateMethods.checkIfSkierHitObstacle]() {
    const { skierDirection, obstacles, gameWidth, gameHeight, skierMapX, skierMapY } = this.state;
    const { width, height } = AssetManager.fromSkier(skierDirection);
    const skierRect = {
      left: skierMapX + gameWidth / 2,
      right: skierMapX + width + gameWidth / 2,
      top: skierMapY + height - 5 + gameHeight / 2,
      bottom: skierMapY + height + gameHeight / 2
    };

    const collision = obstacles.find(({ type, x, y }) => {
      const { width, height } = AssetManager.fromObstacle(type);
      const obstacleRect = {
        left: x,
        right: x + width,
        top: y + height - 5,
        bottom: y + height
      };
      return this[privateMethods.intersectRect](skierRect, obstacleRect);
    });

    if(collision)
      this.state.skierDirection = 0;
  }

  [privateMethods.clearCanvas]() {
    const { gameWidth, gameHeight } = this.state;
    this.ctx.clearRect(0, 0, gameWidth, gameHeight);
  }

  [privateMethods.drawObstacles]() {
    const { obstacles, skierMapX, skierMapY, gameWidth, gameHeight } = this.state;

    obstacles.forEach(({ type, x, y }) => {
      const obstacleImage = AssetManager.fromObstacle(type);
      const xBound = x - skierMapX - obstacleImage.width / 2;
      const yBound = y - skierMapY - obstacleImage.height / 2;
      const offScreen = xBound < -100 || xBound > gameWidth + 50 || yBound < -100 || yBound > gameHeight + 50;

      if(!offScreen)
        this.ctx.drawImage(obstacleImage, xBound, yBound, obstacleImage.width, obstacleImage.height);
    });
  }

  [privateMethods.drawSkier]() {
    const { skierDirection, gameWidth, gameHeight } = this.state;
    const skierImage = AssetManager.fromSkier(skierDirection);
    const x = (gameWidth - skierImage.width) / 2;
    const y = (gameHeight - skierImage.height) / 2;

    this.ctx.drawImage(skierImage, x, y, skierImage.width, skierImage.height);
  }

  [privateMethods.intersectRect](r1, r2) {
    return !(r2.left > r1.right || r2.right < r1.left ||
             r2.top > r1.bottom || r2.bottom < r1.top);
  }

  [privateMethods.moveSkier]() {
    const { skierDirection } = this.state;
    let { skierMapX, skierMapY, skierSpeed } = this.state;

    switch(skierDirection) {
      case 0:
        skierSpeed = initialState.skierSpeed;
        break;

      case 2:
        skierSpeed += .02;
        skierMapX -= Math.round(skierSpeed / 1.4142);
        skierMapY += Math.round(skierSpeed / 1.4142);
        this[privateMethods.placeNewObstacle](skierDirection);
        break;

      case 3:
        skierSpeed += .02;
        skierMapY += skierSpeed;
        this[privateMethods.placeNewObstacle](skierDirection);
        break;

      case 4:
        skierSpeed += .02;
        skierMapX += skierSpeed / 1.4142;
        skierMapY += skierSpeed / 1.4142;
        this[privateMethods.placeNewObstacle](skierDirection);
        break;
    }

    Object.assign(this.state, { skierMapX, skierMapY, skierSpeed });
  }

  [privateMethods.placeInitialObstacles]() {
    const { obstacles, gameHeight, gameWidth } = this.state;
    const numberObstacles = Math.ceil(this[privateMethods.random](5, 7) * (gameWidth / 800) * (gameHeight / 500));

    const minX = -50;
    const maxX = gameWidth + 50;
    const minY = gameHeight / 2 + 100;
    const maxY = gameHeight + 50;

    for(let i = 0; i < numberObstacles; i++) {
      this[privateMethods.placeRandomObstacle](minX, maxX, minY, maxY);
    }

    obstacles.sort((o1, o2) => {
      const { height: o1H } = AssetManager.fromObstacle(o1.type);
      const { height: o2H } = AssetManager.fromObstacle(o2.type);
      return (o1.y + o1H) - (o2.y + o2H);
    });
  }

  [privateMethods.placeNewObstacle](direction) {
    const shouldPlaceObstacle = this[privateMethods.random](1, 8);
    if(shouldPlaceObstacle !== 8)
      return;

    const { gameHeight, gameWidth, skierMapX, skierMapY } = this.state;
    const leftEdge = skierMapX;
    const rightEdge = skierMapX + gameWidth;
    const topEdge = skierMapY;
    const bottomEdge = skierMapY + gameHeight;

    switch(direction) {
      case 1: // left
        this[privateMethods.placeRandomObstacle](leftEdge - 50, leftEdge, topEdge, bottomEdge);
        break;

      case 2: // left down
        this[privateMethods.placeRandomObstacle](leftEdge - 50, leftEdge, topEdge, bottomEdge);
        this[privateMethods.placeRandomObstacle](leftEdge, rightEdge, bottomEdge, bottomEdge + 50);
        break;

      case 3: // down
        this[privateMethods.placeRandomObstacle](leftEdge, rightEdge, bottomEdge, bottomEdge + 50);
        break;

      case 4: // right down
        this[privateMethods.placeRandomObstacle](rightEdge, rightEdge + 50, topEdge, bottomEdge);
        this[privateMethods.placeRandomObstacle](leftEdge, rightEdge, bottomEdge, bottomEdge + 50);
        break;

      case 5: // right
        this[privateMethods.placeRandomObstacle](rightEdge, rightEdge + 50, topEdge, bottomEdge);
        break;

      case 6: // up
        this[privateMethods.placeRandomObstacle](leftEdge, rightEdge, topEdge - 50, topEdge);
        break;
    }
  }

  [privateMethods.placeRandomObstacle](minX, maxX, minY, maxY) {
    const obstacleIndex = this[privateMethods.random](0, AssetManager.obstacleTypes.length - 1);
    const { x, y } = this[privateMethods.calculateOpenPosition](minX, maxX, minY, maxY);

    this.state.obstacles.push({type : AssetManager.obstacleTypes[obstacleIndex], x, y })
  }

  [privateMethods.random](min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  [privateMethods.setupKeyhandler](e) {
    let { skierDirection, skierMapX, skierSpeed } = this.state;

    switch(e.which) {
      case 37: // left
        if(skierDirection === 1) {
          skierMapX -= skierSpeed;
          this[privateMethods.placeNewObstacle](skierDirection);
        }
        else if (skierDirection-- === 0)
          skierDirection = 1
        break;

      case 39: // right
        if(skierDirection === 5) {
          skierMapX += skierSpeed;
          this[privateMethods.placeNewObstacle](skierDirection);
        }
        else if (skierDirection++ === 0)
          skierDirection = 5;
        break;

      case 38: // up
        if(skierDirection === 1 || skierDirection === 5) {
          skierMapY -= skierSpeed;
          this[privateMethods.placeNewObstacle](6);
        }
        break;

      case 40: // down
        skierDirection = 3;
        break;
    }

    Object.assign(this.state, { skierDirection, skierMapX, skierSpeed });
    e.preventDefault();
  }
}

new GameMaster().initGame();
