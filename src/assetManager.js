const obstacleTypes = ['tree', 'treeCluster', 'rock1', 'rock2'];
const skierAssets = ['skierCrash', 'skierLeft', 'skierLeftDown', 'skierDown', 'skierRightDown', 'skierRight'];
const assetPaths = {
  'skierCrash': 'img/skier_crash.png',
  'skierLeft': 'img/skier_left.png',
  'skierLeftDown': 'img/skier_left_down.png',
  'skierDown': 'img/skier_down.png',
  'skierRightDown': 'img/skier_right_down.png',
  'skierRight': 'img/skier_right.png',
  'tree': 'img/tree_1.png',
  'treeCluster': 'img/tree_cluster.png',
  'rock1': 'img/rock_1.png',
  'rock2': 'img/rock_2.png',
};

class AssetManager {
  constructor() {
    this.assets = [];
    this.obstacleTypes = obstacleTypes;
  }

  fromSkier = index => this.assets[skierAssets[index]]

  fromObstacle = type => this.assets[type]

  load = async () => {
    const assetPromises = Object.getOwnPropertyNames(assetPaths).map(assetName => new Promise((resolve, reject) => {
      const assetImage = new Image();
      assetImage.onerror = reject;

      assetImage.src = assetPaths[assetName];
      assetImage.onload = function() {
        assetImage.width /= 2;
        assetImage.height /= 2;

        resolve([assetName, assetImage]);
      };
    }));

    return await Promise.all(assetPromises).then(resolvedAssets => resolvedAssets.forEach(assetInfo => this.assets[assetInfo[0]] = assetInfo[1]));
  }
}

export const assets = new AssetManager();
