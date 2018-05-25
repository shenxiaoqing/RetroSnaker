//snake.js
var app = getApp();
Page({
  data: {
    score: 0,//比分
    maxscore: 0,//最高分
    startx: 0,
    starty: 0,
    endx: 0,
    endy: 0,//以上四个做方向判断来用
    ground: [],//存储操场每个方块
    rows: 28,
    cols: 22,//操场大小
    snake: [],//存蛇
    food: [],//存食物
    direction: '',//方向
    modalHidden: true,//是否显示弹框
    timer: ''
  },
  onLoad: function () {
    //获取历史数据
    var maxscore = wx.getStorageSync('maxscore');
    
    // 如果maxscore不存在，把maxscore设为0
    if (!maxscore) maxscore = 0
    this.setData({
      maxscore: maxscore
    });
    this.initGround(this.data.rows, this.data.cols);//初始化操场
    this.initSnake(3);//初始化蛇 长度为3
    this.creatFood();//初始化食物
    this.move();//蛇移动
  },
  //计分器
  storeScore: function () {
    // 判断最高分 当前分数大于最高分时设置当前分数为最高分
    if (this.data.maxscore < this.data.score) {
      this.setData({
        maxscore: this.data.score
      })
      // 数据同步到logs日志上
      wx.setStorageSync('maxscore', this.data.maxscore)
    }
  },
  //操场
  initGround: function (rows, cols) {
    // for循环嵌套分割操场为二维数组
    for (var i = 0; i < rows; i++) {
      var arr = [];
      this.data.ground.push(arr);
      for (var j = 0; j < cols; j++) {
        // 每一项为0
        this.data.ground[i].push(0);
      }
    }
  },
  //蛇
  initSnake: function (len) {
    for (var i = 0; i < len; i++) {
      // 初始化蛇的位置在左上角，长度为len，改变蛇所在位置的每一项为1
      this.data.ground[0][i] = 1;
      // 蛇的数组二维数组
      this.data.snake.push([0, i]);
    }
  },
  //移动函数
  move: function () {
    var that = this;
    // 设置定时器
    this.data.timer = setInterval(function () {
      // changeDirection 改变方向
      that.changeDirection(that.data.direction);
      that.setData({
        ground: that.data.ground
      });
    }, 600);
  },
  //按下
  tapStart: function (event) {
    this.setData({
      startx: event.touches[0].pageX,
      starty: event.touches[0].pageY
    })
  },
  //手指移动
  tapMove: function (event) {
    this.setData({
      endx: event.touches[0].pageX,
      endy: event.touches[0].pageY
    })
  },
  //手指离开
  tapEnd: function (event) {
    //判断横向
    var heng = (this.data.endx) ? (this.data.endx - this.data.startx) : 0;
    //判断竖向
    var shu = (this.data.endy) ? (this.data.endy - this.data.starty) : 0;
    //移动距离是否大于5
    if (Math.abs(heng) > 5 || Math.abs(shu) > 5) {
      // 移动的横向距离大还是竖向距离大
      var direction = (Math.abs(heng) > Math.abs(shu)) ? this.computeDir(1, heng) : this.computeDir(0, shu);
      //如果方向为反向则不可以更改
      switch (direction) {
        case 'left':
          if (this.data.direction == 'right') return;
          break;
        case 'right':
          if (this.data.direction == 'left') return;
          break;
        case 'top':
          if (this.data.direction == 'bottom') return;
          break;
        case 'bottom':
          if (this.data.direction == 'top') return;
          break;
        default:
      }
      //重新赋值开始结束位置为0，改变方向
      this.setData({
        startx: 0,
        starty: 0,
        endx: 0,
        endy: 0,
        direction: direction
      })
    }
  },
  //计算方向
  computeDir: function (heng, num) {
    // 判断横竖及上下左右
    if (heng) return (num > 0) ? 'right' : 'left';
    return (num > 0) ? 'bottom' : 'top';
  },
  //创建食物
  creatFood: function () {
    //随机食物位置
    var x = Math.floor(Math.random() * this.data.rows);
    var y = Math.floor(Math.random() * this.data.cols);
    var ground = this.data.ground;
    // 改变食物位置的项为2
    ground[x][y] = 2;
    this.setData({
      ground: ground,
      food: [x, y]
    });
  },
  changeDirection: function (dir) {
    // 根据方向改变方向函数
    switch (dir) {
      case 'left':
        return this.changeLeft();
        break;
      case 'right':
        return this.changeRight();
        break;
      case 'top':
        return this.changeTop();
        break;
      case 'bottom':
        return this.changeBottom();
        break;
      default:
    }
  },
  changeRight: function () {
    // 蛇的数组
    var arr = this.data.snake;
    // 蛇的长度
    var len = this.data.snake.length;
    // 舌头的位置
    var snakeHEAD = arr[len - 1][1];
    // 蛇尾的位置
    var snakeTAIL = arr[0];
    var ground = this.data.ground;
    //蛇尾离开的的位置为0
    ground[snakeTAIL[0]][snakeTAIL[1]] = 0;
    // 蛇向前移动
    for (var i = 0; i < len - 1; i++) {
      arr[i] = arr[i + 1];
    };
    var x = arr[len - 1][0];
    var y = arr[len - 1][1] + 1;
    arr[len - 1] = [x, y];
    // 移动函数传参蛇尾位置
    this.checkGame(snakeTAIL);
    // 蛇经过的位置值为1
    for (var i = 1; i < len; i++) {
      ground[arr[i][0]][arr[i][1]] = 1;
    }
    this.setData({
      ground: ground,
      snake: arr
    });
    return true;
  },
  changeLeft: function () {
    // 向左移动
    var arr = this.data.snake;
    var len = this.data.snake.length;
    var snakeHEAD = arr[len - 1][1];
    var snakeTAIL = arr[0];
    var ground = this.data.ground;
    ground[snakeTAIL[0]][snakeTAIL[1]] = 0;
    for (var i = 0; i < len - 1; i++) {
      arr[i] = arr[i + 1];
    };
    var x = arr[len - 1][0];
    var y = arr[len - 1][1] - 1;
    arr[len - 1] = [x, y];
    this.checkGame(snakeTAIL);
    for (var i = 1; i < len; i++) {
      ground[arr[i][0]][arr[i][1]] = 1;
    }
    this.setData({
      ground: ground,
      snake: arr
    });
    return true;
  },
  changeTop: function () {
    var arr = this.data.snake;
    var len = this.data.snake.length;
    var snakeHEAD = arr[len - 1][1];
    var snakeTAIL = arr[0];
    var ground = this.data.ground;
    ground[snakeTAIL[0]][snakeTAIL[1]] = 0;
    for (var i = 0; i < len - 1; i++) {
      arr[i] = arr[i + 1];
    };
    var x = arr[len - 1][0] - 1;
    var y = arr[len - 1][1];
    arr[len - 1] = [x, y];
    this.checkGame(snakeTAIL);
    for (var i = 1; i < len; i++) {
      ground[arr[i][0]][arr[i][1]] = 1;
    }
    this.setData({
      ground: ground,
      snake: arr
    });
    return true;
  },
  changeBottom: function () {
    var arr = this.data.snake;
    var len = this.data.snake.length;
    var snakeHEAD = arr[len - 1];
    var snakeTAIL = arr[0];
    var ground = this.data.ground;

    ground[snakeTAIL[0]][snakeTAIL[1]] = 0;
    for (var i = 0; i < len - 1; i++) {
      arr[i] = arr[i + 1];
    };
    var x = arr[len - 1][0] + 1;
    var y = arr[len - 1][1];
    arr[len - 1] = [x, y];
    this.checkGame(snakeTAIL);
    for (var i = 1; i < len; i++) {
      ground[arr[i][0]][arr[i][1]] = 1;
    }
    this.setData({
      ground: ground,
      snake: arr
    });
    return true;
  },
  // 移动函数
  checkGame: function (snakeTAIL) {
    var arr = this.data.snake;
    var len = this.data.snake.length;
    //蛇头
    var snakeHEAD = arr[len - 1];
    //判断蛇头是否撞墙
    if (snakeHEAD[0] < 0 || snakeHEAD[0] >= this.data.rows || snakeHEAD[1] >= this.data.cols || snakeHEAD[1] < 0) {
      // 撞墙清除计时器
      clearInterval(this.data.timer);
      // 改变是否显示弹窗
      this.setData({
        modalHidden: false,
      })
    }
    // 判断蛇头是否撞到蛇的身体
    for (var i = 0; i < len - 1; i++) {
      if (arr[i][0] == snakeHEAD[0] && arr[i][1] == snakeHEAD[1]) {
        // 撞墙清除计时器
        clearInterval(this.data.timer);
        // 改变是否显示弹窗
        this.setData({
          modalHidden: false,
        })
      }
    }
    // 判断蛇头与食物的位置是否一样
    if (snakeHEAD[0] == this.data.food[0] && snakeHEAD[1] == this.data.food[1]) {
      //向蛇的数组中添加一个二维数组
      arr.unshift(snakeTAIL);
      // 分数加10
      this.setData({
        score: this.data.score + 10
      });
      // 重新调用计分器
      this.storeScore();
      //重新创造食物
      this.creatFood();
    }
  },
  //重新开始
  modalChange: function () {
    // 初始化数据
    this.setData({
      score: 0,
      ground: [],
      snake: [],
      food: [],
      modalHidden: true,
      direction: ''
    })
    // 重新加载页面
    this.onLoad();
  },
  //分享函数
  onShareAppMessage: function (res) {
    return {
      title: '贪吃蛇',
      path: '/index',
      imageUrl:'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=4223805235,3990162476&fm=27&gp=0.jpg'
    }
  }
});