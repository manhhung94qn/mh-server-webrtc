// const io = require('socket.io')(process.env.port || 3000);
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.set('views' , './views');
app.set('view engine', 'ejs');
app.use('/static', express.static('public'));

server.listen(process.env.PORT || 3000);

app.get('/', function (req, res) {
    res.render('index');
});



let arrayUser = [];

io.on('connection', socket=>{
    console.log(socket.id);
    socket.on('NGUOI_DUNG_DANG_KI', userInfo=>{
        socket.peerId = userInfo.peerId;
        let checkUser = arrayUser.findIndex(x=>x.ten==userInfo.ten);
        if(checkUser>0){
            socket.emit('DANG_KI_THAT_BAI');
            return;
        }
        arrayUser.push(userInfo);
        socket.emit('DANH_SACH_ONLINE', arrayUser);
        // io.emit('CO_NGUOI_DUNG_MOI', arrayUser);
        socket.broadcast.emit('CO_NGUOI_DUNG_MOI', arrayUser);
    });

    socket.on('NGUOI_DUNG_NHAN_TIN' , messengeInfor=>{
        let messengeResult = {
            peerId : socket.peerId,
            messenge : messengeInfor.messenge,
            userName: messengeInfor.userName
        };
        io.emit('CO_NGUOI_NHAN_TIN', messengeResult);
    });

    socket.on('disconnect',()=>{
        let checkUser = arrayUser.findIndex(x=>x.peerId==socket.peerId); 
        console.log(checkUser) 
        if(checkUser>-1){
            arrayUser.splice(checkUser,1); 
            console.log(arrayUser);                   
            io.emit('CO_NGUOI_HUY_KET_NOI', arrayUser);
        }
        
    })
});

