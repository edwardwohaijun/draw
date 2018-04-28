let async = require('async');

let mongoose = require('mongoose');
let mongoSchema = require('../config/mongoSchema');
let ObjectId = require('mongodb').ObjectID;
let canvasShape = mongoSchema.canvasShape;
let canvasChat = mongoSchema.canvasChat;

let randomNumber = require('./common').randomNumber;
let randomString = require('./common').randomString;
let customShapes = require('../svg/customShapes/index');

let greeting = {
  msgID: randomString(20),
  fromNickname: '沃海峻',
  fromID: '-Oops-',
  content: `复制当前页面的link给你的伙伴们, 从而实现多人实时编辑, 并在这个聊天框内进行文字交流. <br/>输入<span style="color: #0b93f6; font-weight: bold"> /help </span>可以获取一些基本操作法. Have fun. <img class="emoji-img" src="//cdn.jsdelivr.net/emojione/assets/3.0/png/32/1f61a.png">`,
};

let helpMsg = {
  msgID: randomString(20),
  fromNick: '沃海峻',
  fromID: '-Oops-',
  content: `
<ul style="padding-left: 16px">
  <li>所有的图形选中后都支持平移, 旋转, 缩放操作.</li>
  <li>选中图形后, 按删除键在Safari浏览器中会失效, 此时只能点击右键选择context menu中的删除.</li>
  <li>基础图形(左侧面板上半部分按钮生成)可以通过页面右上角的 "Attribute window" 编辑他们的填充色, 边框宽度等属性, 但复杂图形(面板下半部分的按钮)不能编辑这些属性.</li>
  <li>复杂图形是在服务端生成再返回, 因此点击后不会瞬间显示, 且每次点击是在当前类别中随机生成一个图形.</li>
  <li>选择图形后, 点击<svg xmlns="http://www.w3.org/2000/svg" width="30" height="13"><path fill="#d1e6ff" d="M15 0L0 13.2h30L15 0z"/></svg>箭头往外拖拉鼠标, 可以画一条折线, 鼠标拖拉时 hover 到其它图形上, 则在当前和对方图形之间画一条折线.</li>
  <li>双击图形, 可以在图形内插入文本(暂时不支持文本的 formatting 和 styling).</li>
  <li>聊天框内输入<span style="color: #0b93f6; font-weight: bold"> /rename my-new-name </span>可以修改你的昵称.</li>
</ul>`,
  sysMsg: true,
};

let contactInfo = `你好, 我是网站作者沃海峻. 该网站只是本人一次学习经历的总结, 从实用角度而言, 网站目前没有任何实际价值, 最多只能算是个prototype.<br/>
如果你对网站背后的所用技术, 实现原理和将来的发展方向感兴趣, 可以阅读我的一篇<a href="https://worksphere.cn/blog/how-drawapp-is-designed-and-implemented/" target="_blank">博客</a>.<br/>
本网站已<a href="https://github.com/edwardwohaijun/draw" target="_blank">开源</a>, 且我的下个项目是"人工智能私人助理", 如果你有兴趣共同参与开发或其他形式的合作, 请通过以下方式和我取得联系:
<ul>
  <li>QQ: 1399405937</li>
  <li>Blog: <a href="http://worksphere.cn/blog" target="_blank">Just a coder</a> </li>
  <li>Facebook: <a href="https://www.facebook.com/edward.wo.507" target="_blank">edward.wo.507</a></li>
  <li>Twitter: <a href="https://twitter.com/edwardwo" target="_blank">edwardwo</a></li>
  <li>Github: <a href="https://github.com/edwardwohaijun" target="_blank">edwardwohaijun</a></li>
</ul>
(请务必附上加我的理由)
`;

let getCustomShapeData = shapeClass => { // custom shape data are too big, unstructured, thus not saved in mongo. In /canvas/init, we need to grab them from external module
  if (!shapeClass) return;

  let shape = shapeClass.split('-'); // better to check whether shape[0], shape[1] exist
  if(!customShapes[shape[0]] || !customShapes[shape[0]][shape[1]]) return;

  return customShapes[shape[0]][shape[1]].components;
};

const setAttribute = (socket, evt, data) => { // events: '/canvas/set-attribute' and '/canvas/set-attribute-style' are handled by different component in browser for design reason...
// ... but they are handled in the same way on server side.
  canvasShape.update({id: data.id}, {$set: {[data.attributeName]: data.value}}, {upsert: false}, (err, result) => {
    if (err){
      console.log('err setting attribute: ', err);
      return
    }
    socket.broadcast.to(socket.canvasID).emit(evt, data)
  });
};

exports.socketEvents = function f(io){
  io.sockets.on('connection', socket => {

    let canvasID = socket.handshake.query.canvasID;
    socket.join(canvasID);
    socket.canvasID = canvasID;
    socket.nickname = (Math.random() + 1).toString(36).substring(19);

    // get all members in current canvas
    let members = {};
    let sockList = io.sockets.adapter.rooms[canvasID].sockets;
    for (const sock in sockList){ // sockList is of form: {sockID1: true, sockID2: true, sockID3: false}
      if (sockList.hasOwnProperty(sock) && sockList[sock]) {
        members[sock] = {nickname: io.sockets.connected[sock].nickname}
      }
    }

    async.parallel({
          canvasChat: cb => {
            canvasChat.find({canvasID: canvasID}).lean().limit(50).sort({sentAt: 'ascending'}).exec((err, data) => {
              if (err) {
                console.log('err retrieving canvas chat: ', err);
                return cb(err)
              }
              if (data.length === 0){
                greeting.sentAt = new Date();
                data.push(greeting)
              }
              cb(null, data)
            });
          },

          canvasShape: cb => {
            canvasShape.find({canvasID: canvasID}).lean().exec((err, data) => { // don't forget the lean(), or do: data = data.toObject() in cb. waste 1 hour for this.
            // otherwise, you can't modify the return data. https://stackoverflow.com/questions/14504385/why-cant-you-modify-the-data-returned-by-a-mongoose-query-ex-findbyid
              if (err){
                console.log('err retrieving canvas shapes: ', err);
                return cb(err)
              }

              data.forEach(d => {
                if (d.customClassName){
                  d.components = getCustomShapeData(d.customClassName);
                }
              });
              cb(null, data)
            });
          }},

        (err, result) => {
          if (err){
            console.log('err initializing: ', err); // better to notify users of this error
            return
          }

          socket.emit('/canvas/init', result.canvasShape);
          socket.emit('/chat/init', {
            msg: result.canvasChat,
            members: members,
            profile: {id: socket.id, nickname: socket.nickname},
            contactInfo: contactInfo
          });
          socket.broadcast.to(canvasID).emit('/chat/new-member', {nickname: socket.nickname, id: socket.id});
        });

    socket.on('disconnect', () => { // check chat and shape collection, whether to delete them all if room is empty
      socket.broadcast.to(canvasID).emit('/chat/member-leave', socket.id);
      let sockList = io.sockets.adapter.rooms[canvasID];
      if (sockList){ // still people on this canvas
        return
      }

      async.parallel([
          cb => {
            canvasChat.remove({canvasID: canvasID}).exec((err, data) => {
              if (err) {
                console.log('err removing canvas chat: ', err);
                return cb(err)
              }
              cb(null)
            });
          },

          cb => {
            canvasShape.remove({canvasID: canvasID}).exec((err, data) => {
              if (err){
                console.log('err removing canvas shapes: ', err);
                return cb(err)
              }
              cb(null)
            });
          }],

          (err, result) => {
            if (err){
              console.log('err clearing canvas data: ', err);
            }
        });
    });

    socket.on('/chat/new-msg', msg => {
      delete msg.sentAt; // let mongoose set the date, only sender still use local date.
      msg.canvasID = canvasID;
      let newMsg = new canvasChat(msg);
      newMsg.save((err, savedMsg) => {
        if (err){
          console.log('err saving new msg: ', err);
          return
        }
        socket.broadcast.to(canvasID).emit('/chat/new-msg', savedMsg);
      });
    });

    socket.on('/chat/rename', name => {
      socket.nickname = name;
      socket.broadcast.to(canvasID).emit('/chat/rename', {id: socket.id, name: name});
    });

    socket.on('/help', () => {
      helpMsg.sentAt = new Date();
      socket.emit('/chat/new-msg', helpMsg)
    });


    // canvas related events
    // events: '/canvas/set-attribute' and '/canvas/set-attribute-style' are handled by different component in browser for design reason...
    // ... but are handled in the same way on server-side
    socket.on('/canvas/set-attribute', data => setAttribute(socket, '/canvas/set-attribute', data));
    socket.on('/canvas/set-attribute-style', data => setAttribute(socket, '/canvas/set-attribute-style', data));

    socket.on('/canvas/delete-shape', data => {
      canvasShape.remove({id: data.id}, (err, removedShape) => {
        if (err){
          return console.log('err removing shape with ID: ', data.id)
        }
        socket.broadcast.to(canvasID).emit('/canvas/delete-shape', data);
      });
    });

    socket.on('/canvas/new-shape', data => {
      data.canvasID = canvasID; // todo: 本地也需要有canvasID啊????????????????????
      let shape = new canvasShape(data);
      shape.save((err, savedShape) => {
        if (err){
          return console.log('err saving new shape: ', err); // todo: send err msg back to this socket, notifying him/her the error. Better use a '/error/create' event
        }
        socket.broadcast.to(canvasID).emit('/canvas/new-shape', savedShape);
      });
    });

    socket.on('/canvas/clone-shape', shapeID => {
      canvasShape.findOne({id: shapeID}).lean().exec((err, shape) => {
        if (err) {
          return console.log('err(in clone-shape) finding shapeID: ', shapeID)
        }
        shape._id = new ObjectId();
        shape.id = randomString(12);
        let m = shape.transform.slice(7, -1).split(' ').map(parseFloat);
        m[4] += randomNumber(60, 100);
        m[5] += randomNumber(60, 100);
        shape.transform = `matrix(${m.join(' ')})`;
        if (shape.customClassName){ // it's a custom shape
          shape.components = getCustomShapeData(shape.customClassName);
          if (!shape.components) {
            return;
          }
        }

        mongoose.connection.collection('canvasshapes').insert(shape, (err, result) => {
          if (err) {
            return console.log('err in saving cloned shape: ', err)
          }
          io.in(canvasID).emit('/canvas/new-shape', shape)
        })
      })
    });

    socket.on('/canvas/broadcast-new-shape', shapeType => { // fired only when user want to create custom shape.
      // suppose user want to create a emoji, there are many in this set, so I randomly choose one.
      if (!shapeType || !customShapes[shapeType]) {
        console.log('non-existing shape? ', shapeType);
        return
      }

      let shapeKeys = Object.keys(customShapes[shapeType]);
      let randamIdx = Math.floor( Math.random() * shapeKeys.length );
      let shapeData = customShapes[shapeType][ shapeKeys[randamIdx] ];

      let commonProp = {
        transform: `matrix(1 0 0 1 ${randomNumber()} ${randomNumber()})`,
        canvasID,
        id: randomString(12),
      };

      if (shapeData.customClassName === 'weather-sunRain'){ // this shape's original size is too small
        commonProp.transform =  `matrix(3 0 0 3 ${randomNumber()} ${randomNumber()})`;
      }

      let shapeForSend, shapeForSave;
      shapeForSave = Object.assign({}, shapeData, commonProp);
      shapeForSend = Object.assign({}, shapeData, commonProp);
      delete shapeForSave.components;

      let shapeForSaving = new canvasShape(shapeForSave);
      shapeForSaving.save((err, result) => {
        if (err){
          return console.log('err saving custom shape: ', err)
        }
        io.in(canvasID).emit('/canvas/new-shape', shapeForSend); // should I append _id prop returned from mongo?
      });
    });

    socket.on('/canvas/set-text', data => {
      socket.broadcast.to(canvasID).emit('/canvas/set-text', data);
    })

  });
};

