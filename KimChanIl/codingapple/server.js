const express = require('express'); //라이브 러리 참고
const app = express(); // 라이브러리를 이용한 객체 생성
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
require('dotenv').config();
app.use(methodOverride('_method'));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended : true}));
//npm install mongodb할 때 강의 버전으로 해야돼..
var db;
MongoClient.connect('mongodb+srv://Kchan:1234@codingapple.zlnpnec.mongodb.net/?retryWrites=true&w=majority', function(에러, client){
    if (에러) return console.log(에러)
    //서버띄우는 코드 여기로 옮기기
    db = client.db('todoapp');

    app.listen('8080', function(){
      console.log('listening on 8080')
    });
  })

app.get('/pet',function(req,res){
    res.send('펫용품 쇼핑 사이트 입니다.');
});

app.get('/beauty',function(req,res){
    res.send('뷰티 용품 쇼핑 사이트 입니다.');
});

app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html');
});
app.get('/write',function(req,res){
    res.sendFile(__dirname + '/write.html');
});

app.post('/add',function(req,res){
    res.send('전송 완료!');
    db.collection('counter').findOne({name : '게시물 갯수'},function(error,result){
        console.log(result.totalPost);
        var 총개시물개수 = result.totalPost;
        db.collection('post').insertOne({_id: 총개시물개수 +1 ,이름:req.body.date, 나이:req.body.title},function(error,result){
            console.log('saved!');});
            db.collection('counter').updateOne({name : '게시물 갯수'},{ $inc: {totalPost : 1}},function(error,result){
                if(error){return console.log(error)}
            })
    });
    
});

app.get('/list',function(req,res){
    db.collection('post').find().toArray(function(error,result){
        console.log(result);
        res.render('list.ejs',{posts : result});
    });
});

app.delete('/delete', function(req,res){
    console.log(req.body)
    req.body._id = parseInt(req.body._id);
    db.collection('post').deleteOne(req.body,function(error,result){
        console.log('del complete!');
        res.status(200).send({message:'success'});
    })
})
app.get('/detail/:id',function(req,res){
    db.collection('post').findOne({_id:parseInt(req.params.id)},function(error,result){
        console.log(result);
        res.render('detail.ejs',{ DATA: result });

    })
})
app.get('/edit/:id',function(req,res){
    db.collection('post').findOne({_id:parseInt(req.params.id)},function(error,result){
        res.render('edit.ejs',{post: result});
        
    })
})

app.put('/edit',function(req,res){
    db.collection('post').updateOne({_id:parseInt(req.body.id)},{$set : {이름 : req.body.title,나이: parseInt(req.body.date)}},function(error,result){
        console.log('updated!');
        res.redirect('/list');
    })
})

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret : '비밀코드',resave : true,saveUninitialized:false}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login',function(req,res){
    res.render('login.ejs')
});
app.post('/login',passport.authenticate('local',{
    failureRedirect:'/fail'
}),function(req,res){
    res.redirect('/')
});
app.get('/mypage',iflogin,function(req,res){
    console.log(req.user)
    res.render('mypage.ejs',{사용자 : req.user})
});

function iflogin(req,res,next){
    if (req.user){
        next()
    } else {
        res.send('로그인 하셔야 합니다.')
    }
}

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
  }, function (입력한아이디, 입력한비번, done) {
    //console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
      if (에러) return done(에러)
  
      if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
      if (입력한비번 == 결과.pw) {
        return done(null, 결과)
      } else {
        return done(null, false, { message: '비번틀렸어요' })
      }
    })
  }));

  passport.serializeUser(function (user, done) {
    done(null, user.id)
  });
  
  passport.deserializeUser(function (아이디, done) {
    db.collection('login').findOne({id:아이디},function(error,result){
        done(null, result)
    })
  }); 