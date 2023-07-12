const express = require('express');
const { v4: uuidv4} = require('uuid');
const app = express();
const server = require('http').Server(app)
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const { name } = require('ejs');
//data base connections
const DB = "mongodb+srv://ghazanfar:<password>e@info.fz4drym.mongodb.net/?retryWrites=true&w=majority";
const mongoose = require('mongoose');
const user = require('./models/user');
mongoose.connect(DB).then(()=>{
    console.log('connection successful');
}).catch((e)=>{
    console.log(e);
})

//-----------------------------------

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))
//app.use('/peerjs',peerServer);

app.get('/', (req,res)=>{
   res.redirect(`/${uuidv4()}`);
})

app.get('/thanks', (req,res)=>{

    res.render("thanks")
})

app.get('/create', (req,res)=>{
    res.render("createRoom")
})

//const users ={};
let t;
app.post('/create', async(req,res)=>{
  let firstName = req.body.firstName;
  const lastName = req.body.lastName;
  if(lastName.length>0)firstName = firstName + ' ' + lastName;
  t = firstName;
  let User = new user({
    name: firstName,
    connectionId:0
  })
  //console.log(User);
 User = await User.save();
 
   res.redirect(`/${uuidv4()}?name=${firstName}`)
})

app.get('/joinRoom', (req, res) => {
   res.render('join')
})

app.post('/joinRoom', async(req, res) => {
    const room_id = req.body.room_id;
    let name = req.body.firstName;
    if(req.body.lastName.length >0 ) name += ' ' + req.body.lastName;
    //saving user to db
    t = name;
    let User = new user({
        name: name,
        connectionId:0
      })
      //console.log(User);
     User = await User.save();
    //res.send(room_id + " " + name);
    res.redirect(`/${room_id}?name=${name}`)
})

app.get('/:room', (req,res)=>{
    
    res.render('room', {roomId: req.params.room,name:req.query.name});
})


const update = async(id)=>{
    await user.findOneAndUpdate({name:t},{$set:{connectionId:id}})
}


 function getUserName(id){
 return new Promise((resolve,reject)=>{
    resolve(user.findOne({connectionId:id},{name:1}))
})
 }
io.on('connection', (socket)=>{ 
    socket.on('join-room', (roomId,userId) =>{
        socket.join(roomId);
        socket.to(roomId).emit('user-connected',userId);
        //db
        console.log(t);     
        update(userId);
       
       

        socket.on('message', message =>{
        
          getUserName(userId).then(ans =>{
                //console.log(ans)
            io.to(roomId).emit('createMessage',message,userId,ans.name);
          })
            
        })

        socket.on('disconnect', () =>{
            socket.to(roomId).emit('user-disconnected',userId);
        })

        socket.on('leave-room', () =>{
            socket.to(roomId).emit('user-disconnected',userId);
        })
    })

    
})
server.listen(3030);
