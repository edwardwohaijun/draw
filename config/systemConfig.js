let dev = {
  mongoDB:{
    url: 'mongodb://127.0.0.1/draw'
  },
  hostname: '192.168.0.199',
  port: '3001',
};

let production = {
  mongoDB:{
    url: 'mongodb://127.0.0.1/draw'
  },
  hostname: 'worksphere.cn',
  port: '80',
};

module.exports = function(){
  switch(process.env.NODE_ENV){
    case 'development':
      return dev;
    case 'production':
      return production;
    default:
      return dev;
  }
};
