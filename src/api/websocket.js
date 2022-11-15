export default class SocketService {
  connectStarted = true
  ws = null;
  callBackMapping = {};
  connected = false;
  sendRetryCount = 0;
  connectRetryCount = 0;

  constructor(wsUrl, token) {
    this.wsUrl = wsUrl
    this.token = token
  }

  //
  wsUrl = '';
  token = '';

  connect(token) {
    if (token) {
      this.token = token;
    }

    this.innerConnect()
  }

  finishConnect() {
    this.connectStarted = false

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  startConnect() {
    this.connectStarted = true
    this.innerConnect()
  }

  innerConnect() {
    if (!window.WebSocket) {
      return console.log('您的浏览器不支持WebSocket');
    }

    if (this.ws) {
      return
    }

    if (!this.connectStarted) {
      return
    }

    this.ws = new WebSocket(this.wsUrl); // https://stackoverflow.com/questions/58417479/sec-websocket-protocol-issues
    this.ws.binaryType = "arraybuffer";

    console.log('开始连接服务端');
    this.ws.onopen = () => {
      console.log('连接服务端成功了');
      this.connected = true;
      // 重置重新连接的次数
      this.connectRetryCount = 0;
      const autoInfo = JSON.stringify({
        'token': this.token,
      });
      console.log("ws auth:", autoInfo)
      this.send(autoInfo)

      const cb =  this.callBackMapping['open'];
      if (cb !== undefined) {
        cb()
      }
    };

    this.ws.onclose = (e) => {
      const ws = this.ws
      if (!ws) {
        return
      }

      const cb =  this.callBackMapping['close'];
      if (cb !== undefined) {
        cb(e)
      }

      console.log('连接服务端失败了[Close]', e);
      this.connected = false;
      this.connectRetryCount++;

      if (ws.readyState === WebSocket.CLOSED) {
        ws.close();
        this.ws = null;
      }

      setTimeout(() => {
        this.innerConnect();
      }, 2000 * this.connectRetryCount);
    };

    this.ws.onerror = (e) => {
      console.log('连接服务端失败了:', e);
    }
    // 得到服务端发送过来的数据
    this.ws.onmessage = msg => {
      const cb =  this.callBackMapping[msg.type];
      if (cb !== undefined) {
        cb(msg)
      }
      console.log(msg.data, '从服务端获取到了数据');
    };
  }
  // 回调函数的注册
  registerCallBack(socketType, callBack) {
    this.callBackMapping[socketType] = callBack;
  }
  // 取消某一个回调函数
  unRegisterCallBack(socketType) {
    this.callBackMapping[socketType] = null;
  }
  // 发送数据的方法
  send(data) {
    // 判断此时此刻有没有连接成功
    if (this.connected) {
      this.sendRetryCount = 0;
      try {
        this.ws.send(data);
        console.log('send socket data:', data)
      } catch (e) {
        console.log('send socket error:', e)
      }
    }
  }
}
