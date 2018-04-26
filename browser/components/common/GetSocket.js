import io from 'socket.io-client';

let MySocket = (function(){
  let socket;
  function createSocket(){
    socket = io(window.location.protocol + '//' + window.location.host, {
      path: '/draw/socket.io',
      query: "canvasID=" + window.location.pathname.split('/')[2],
      reconnection: true,
      reconnectionDelay: 2000, // 一旦断开, 2s后尝试连接, 失败, 则: 等4s, 失败则等6s, 直到"等60s", 此时一直: 隔60s尝试连接
      reconnectionDelayMax : 60000,
      reconnectionAttempts: Infinity,
      transports: ['websocket']
    });
    socket.on('connect', () => {console.log('socket connected')});
    return socket;
  }

  return {
    getSocket: function(){
      if (!socket) {socket = createSocket();}
      return socket;
    }
  };
})();

export default MySocket;
