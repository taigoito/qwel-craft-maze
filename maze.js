/**
 * Maze
 * Author: Taigo Ito (https://qwel.design/)
 * Location: Fukui, Japan
 */



var SIZE = 8, WIDTH = 91 * SIZE, HEIGHT = 121 * SIZE;

class Maze {
  constructor(level)  {
    this.chaoticMaze (3, 4, 3, 3, level, level, SIZE);
  }

  chaoticMaze (w1, h1, w2, h2, w3, h3, lineWidth) {
    var maze = {},
      upperLayerMaze = {},
      upperLayerMazes = {},
      lowerLayerMaze = [],
      lowerLayerMazes = [],
      lowerLayerMass = [];

    // 階層迷路群を生成
    for (var y = 0; y < h1; y++) {
      lowerLayerMaze[y] = [];
      lowerLayerMazes[y] = [];
      lowerLayerMass[y] = [];
      for (var x = 0; x < w1; x++) {
        lowerLayerMaze[y][x] = this.createMazeObj(w2, h2);
        lowerLayerMazes[y][x] = this.createMazesObj(w2, h2, w3, h3);
        lowerLayerMass[y][x] = this.createHierarchicalMaze(lowerLayerMaze[y][x], lowerLayerMazes[y][x]);
      }
    }

    // 階層迷路群からさらに階層迷路を生成
    upperLayerMaze = this.createMazeObj(w1, h1);
    upperLayerMazes = {
      sizeX: lowerLayerMass[0][0].sizeX,
      sizeY: lowerLayerMass[0][0].sizeY,
      width: lowerLayerMass[0][0].width,
      height: lowerLayerMass[0][0].height,
      maps: []
    }
    for (var y = 0; y < h1; y++) {
      upperLayerMazes.maps[y] = [];
      for (var x = 0; x < w1; x++) {
        upperLayerMazes.maps[y][x] = lowerLayerMass[y][x].map;
      }
    }
    maze = this.createHierarchicalMaze(upperLayerMaze, upperLayerMazes);

    // ラップして描画
    maze = this.wrapMaze(maze.map);
    this.draw(maze, lineWidth);
  }

  // 迷路オブジェクトと迷路群オブジェクトから、階層迷路の迷路オブジェクトを生成
  createHierarchicalMaze (upperLayerMaze, lowerLayerMazes) {
    var sizeX1 = upperLayerMaze.sizeX,
      sizeY1 = upperLayerMaze.sizeY,
      width1 = upperLayerMaze.width,
      height1 = upperLayerMaze.height,
      maze = upperLayerMaze.map,
      sizeX2 = lowerLayerMazes.sizeX,
      sizeY2 = lowerLayerMazes.sizeY,
      width2 = lowerLayerMazes.width,
      height2 = lowerLayerMazes.height,
      mazes = lowerLayerMazes.maps,
      width = sizeX1 * (width2 + 1) - 1,
      height = sizeY1 * (height2 + 1) - 1,
      hierarchicalMaze = [];

    // 階層迷路の白地図生成、1マス余分に生成しておく
    for (var y = 0; y <= height; y++) {
      hierarchicalMaze[y] = [];
      for (var x = 0; x <= width; x++) {
        hierarchicalMaze[y][x] = 0;
      }
    }

    // 迷路生成ループ
    for (var y1 = 0; y1 < sizeY1; y1++) {
      for (var x1 = 0; x1 < sizeX1; x1++) {
        // 親迷路のX軸生成
        if (y1 !== 0) {
          for (var x2 = 0; x2 <= width2; x2++) {
            hierarchicalMaze[y1 * (height2 + 1) - 1][x1 * (width2 + 1) + x2] = 1;
          }
          if (maze[y1 * 2 - 1][x1 * 2] === 0) {
            var xr = Math.floor(Math.random() * (sizeX2 - 1)) * 2;
            hierarchicalMaze[y1 * (height2 + 1) - 1][x1 * (width2 + 1) + xr] = 0;
          }
        }
        
        // 親迷路のY軸生成
        if (x1 !== 0) {
          for (var y2 = 0; y2 <= height2; y2++) {
            hierarchicalMaze[y1 * (height2 + 1) + y2][x1 * (width2 + 1) - 1] = 1;
          }
          if (maze[y1 * 2][x1 * 2 - 1] === 0) {
            var yr = Math.floor(Math.random() * (sizeY2 - 1)) * 2;
            hierarchicalMaze[y1 * (height2 + 1) + yr][x1 * (width2 + 1) - 1] = 0;
          }
        }

        // 子迷路を生成
        for (var y2 = 0; y2 < height2; y2++) {
          for (var x2 = 0; x2 < width2; x2++) {
            hierarchicalMaze[y1 * (height2 + 1) + y2][x1 * (width2 + 1) + x2] = mazes[y1][x1][y2][x2];
          }
        }
      }
    }

    return {
      sizeX: (width + 1) / 2,
      sizeY: (height + 1) / 2,
      width: width,
      height: height,
      map: hierarchicalMaze
    };
  }

  // 迷路オブジェクト生成
  createMazeObj (sizeX, sizeY) {
    var width = sizeX * 2 -1,
      height = sizeY * 2 -1;
    return {
      sizeX: sizeX,
      sizeY: sizeY,
      width: width,
      height: height,
      map: this.createMaze(width, height)
    }
  }

  // 迷路群オブジェクト生成
  createMazesObj (sizeX1, sizeY1, sizeX2, sizeY2) {
    var mazes = [],
      width1 = sizeX1 * 2 - 1,
      height1 = sizeY1 * 2 - 1,
      width2 = sizeX2 * 2 - 1,
      height2 = sizeY2 * 2 - 1;
    for (var y = 0; y < height1; y++) {
      mazes[y] = [];
      for (var x = 0; x < width1; x++) {
        mazes[y][x] = this.createMaze(width2, height2);
      }
    }
    return {
      sizeX: sizeX2,
      sizeY: sizeY2,
      width: width2,
      height: height2,
      maps: mazes
    }
  }

  // 棒倒し法で迷路作成
  createMaze (w, h) {
    var maze = [];

    // 白地図生成
    for (var y = 0; y < h; y++) {
      maze[y] = [];
      for (var x = 0; x < w; x++) {
        maze[y][x] = 0;
      }
    }

    // 柱を4方向のいずれかにランダムに倒す
    for (var y = 1; y < h - 1; y += 2) {
      for (var x = 1; x < w - 1; x += 2) {
        maze[y][x] = 1 // 1マス間隔に柱
        var isLoop = true;
        while (isLoop) { 
          var px = x, py = y,
            dir = Math.floor(Math.random() * 4);
          switch (dir) {
            case 0: py++; break; // 下方向へ倒す
            case 1: px--; break; // 左方向へ倒す
            case 2: py--; break; // 上方向へ倒す
            case 3: px++; break; // 右方向へ倒す 
          }
          if (maze[py][px] === 0) {
            maze[py][px] = 1;
            isLoop = false;
          }
        }
      }
    }

    return maze;
  }

  // 迷路を壁で囲う
  wrapMaze (maze) {
    var wrapped = [],
      height = maze.length + 1,
      width = maze[0].length + 1;
    // 壁で囲う
    for (var y = 0; y < height; y++) {
      wrapped[y] = [];
      for (var x = 0; x < width; x++) {
        if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
          wrapped[y][x] = 1;
        } else {
          wrapped[y][x] = maze[y - 1][x - 1];
        }
      }
    }
    // 始点、終点
    wrapped[0][1] = 0;
    wrapped[height - 1][width - 2] = 0;
    return wrapped;
  }

  // 描画
  draw (maze, lineWidth) {
    var ctx = document.getElementById('maze').getContext('2d'),
      h = maze.length,
      w = maze[0].length;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.save();
    ctx.translate((WIDTH - w * lineWidth) / 2, 0);
    ctx.fillStyle = "#999";
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        if (maze[y][x] === 1) {
          ctx.fillRect(x * lineWidth, y * lineWidth, lineWidth, lineWidth);
        }
      }
    }
    ctx.restore();
  }
}

const btns = document.querySelectorAll('[data-level]');
btns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const level = btn.dataset.level;
    new Maze(level);
  })
});

new Maze(2);
