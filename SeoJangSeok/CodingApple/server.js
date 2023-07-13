const express = require('express') // 설치한 express 라이브러리를 첨부해 주세요~
const app = express() // 첨부한 라이브러리로 객체를 만들어 주세요~
// socket.io 셋팅
const http = require('http').createServer(app)
const { Server } = require('socket.io')
const io = new Server(http)

const MongoClient = require('mongodb').MongoClient
const bodyParser = require('body-parser') // 2021년 이후 설치한 프로젝트들은 body-parser 라이브러리가 express에 기본 포함되어있다. 따로 npm 설치할 필요X
const { ObjectId } = require('mongodb')
const methodOverride = require('method-override')
app.use(methodOverride('_method'))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/public', express.static('public'))

var db
MongoClient.connect(
  'mongodb+srv://admin:1234@cluster0.0eg5qio.mongodb.net/?retryWrites=true&w=majority',
  { useUnifiedTopology: true },
  function (에러, client) {
    if (에러) return console.log(에러)
    db = client.db('todoapp') // todoapp이라는 DB에 접속하라는 명령.

    //서버띄우는 코드 여기로 옮기기
    http.listen(8080, function () {
      console.log('listening on 8080')
    }) // 8080 port로 웹 서버를 열고 잘 열리면 'listening on 8080'을 출력해주세요~
  }
)

app.get('/socket', function (요청, 응답) {
  응답.render('socket.ejs')
})

io.on('connection', function (socket) {
  console.log('유저접속됨')

  socket.on('room1-send', function (data) {
    io.to('room1').emit('broadcast', data)
  })

  socket.on('joinroom', function (data) {
    socket.join('room1')
  })

  socket.on('user-send', function (data) {
    // console.log(data)
    io.emit('broadcast', data)
  })
})

// 홈페이지
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})
// 할일 작성페이지
app.get('/write', function (req, res) {
  res.sendFile(__dirname + '/write.html') // .sendFile(보낼 파일 경로), __dirname : 현재 파일 경로를 뜻한다.
})
// /list GET 요청시,
app.get('/list', function (req, res) {
  db.collection('post')
    .find() // .find().toArray() : collection('post')에 있는 데이터를 Array로 가져온다.
    .toArray(function (error, result) {
      //console.log(result)
      res.render('list.ejs', { posts: result })
    })
})

app.get('/search', (요청, 응답) => {
  var 검색조건 = [
    {
      $search: {
        index: 'titleSearch',
        text: {
          query: 요청.query.value,
          path: '제목', // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
        },
      },
    },
    //  { $sort: { _id: 1 } },
    //  { $limit: 10 },
    // { $project: { 제목: 1, _id: 0, score: { $meta: 'searchScore' } } },
  ]
  console.log(요청.query.value)
  db.collection('post')
    .aggregate(검색조건)
    .toArray((에러, 결과) => {
      console.log(결과)
      응답.render('result.ejs', { posts: 결과 })
    })
})

app.get('/detail/:id', function (req, res) {
  db.collection('post').findOne(
    { _id: parseInt(req.params.id) },
    function (error, result) {
      console.log(result)
      res.render('detail.ejs', { data: result })
    }
  )
})

app.get('/edit/:id', function (요청, 응답) {
  db.collection('post').findOne(
    { _id: parseInt(요청.params.id) },
    function (에러, 결과) {
      console.log(결과)
      응답.render('edit.ejs', { post: 결과 })
    }
  )
})

app.put('/edit', function (요청, 응답) {
  // 폼에담긴 제목데이터, 날짜데이터를 가지고
  // db.collection 에다 업데이트함
  db.collection('post').updateOne(
    { _id: parseInt(요청.body.id) },
    { $set: { 제목: 요청.body.title, 날짜: 요청.body.date } },
    function (에러, 결과) {
      console.log('수정완료')
      응답.redirect('/list')
    }
  )
})

//Session 방식 로그인 기능 구현
const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const session = require('express-session')
// 미들웨어 (app.use) : 요청-응답 중간에 뭐가 실행되는 코드
app.use(session({ secret: '비밀코드', resave: true, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())

app.get('/login', function (요청, 응답) {
  응답.render('login.ejs')
})

app.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/fail',
  }),
  function (요청, 응답) {
    응답.redirect('/') // 회원 인증 성공하면 redirect
  }
)

app.get('/mypage', 로그인했니, function (요청, 응답) {
  console.log(요청.user)
  응답.render('mypage.ejs', { 사용자: 요청.user })
})
// 마이페이지 접속 전 실행할 미들웨어
function 로그인했니(요청, 응답, next) {
  if (요청.user) {
    next()
  } else {
    응답.send('로그인안하셨는데요?')
  }
}

app.post('/chatroom', 로그인했니, function (요청, 응답) {
  var 저장할거 = {
    title: '무슨무슨채팅방',
    member: [ObjectId(요청.body.당한사람id), 요청.user._id],
    date: new Date(),
  }

  db.collection('chatroom')
    .insertOne(저장할거)
    .then((결과) => {
      응답.send('성공')
    })
})

app.get('/chat', 로그인했니, function (요청, 응답) {
  db.collection('chatroom')
    .find({ member: 요청.user._id })
    .toArray()
    .then((결과) => {
      응답.render('chat.ejs', { data: 결과 })
    })
})

app.post('/message', 로그인했니, function (요청, 응답) {
  var 저장할거 = {
    parent: 요청.body.parent,
    content: 요청.body.content,
    userid: 요청.user._id,
    date: new Date(),
  }
  db.collection('message')
    .insertOne(저장할거)
    .then(() => {
      console.log('DB저장성공')
      응답.send('DB저장성공')
    })
})
// 서버와 유저간 실시간 소통채널 열기
app.get('/message/:id', 로그인했니, function (요청, 응답) {
  // Header를 이렇게 수정해주세요~
  응답.writeHead(200, {
    Connection: 'keep-alive',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
  })
  db.collection('message')
    .find({ parent: 요청.params.id })
    .toArray()
    .then((결과) => {
      // test 이름으로 데이터를 전송할게요~라는 뜻 \n == enter키
      응답.write('event: test\n') //event: 보낼데이터이름\n
      응답.write('data: ' + JSON.stringify(결과) + '\n\n')
      // 응답.write('data: 안녕하세요\n\n') //data: 보낼데이터\n\n(\n 두개 정도 쓰는게 안정적이다.)
    })
  // Change Stream 설정법
  const pipeline = [{ $match: { 'fullDocument.parent': 요청.params.id } }]
  const collection = db.collection('message')
  const changeStream = collection.watch(pipeline) // .watch() 붙이면 실시간 감시해준다.
  // 해당 컬렉션에 변동생기면 여기 코드 실행
  changeStream.on('change', (result) => {
    // console.log(result.fullDocument)
    응답.write('event: test\n')
    응답.write('data: ' + JSON.stringify([result.fullDocument]) + '\n\n')
  })
})

passport.use(
  new localStrategy(
    {
      usernameField: 'id',
      passwordField: 'pw',
      session: true,
      passReqToCallback: false,
    },
    function (입력한아이디, 입력한비번, done) {
      //console.log(입력한아이디, 입력한비번);
      db.collection('login').findOne(
        { id: 입력한아이디 },
        function (에러, 결과) {
          if (에러) return done(에러)

          if (!결과)
            return done(null, false, { message: '존재하지않는 아이디요' }) // done(서버에러, 성공시사용자DB데이터, 에러메세지)
          if (입력한비번 == 결과.pw) {
            return done(null, 결과)
          } else {
            return done(null, false, { message: '비번틀렸어요' })
          }
        }
      )
    }
  )
)

// id를 이용해서 세션을 저장시키는 코드(로그인 성공시 발동)
passport.serializeUser(function (user, done) {
  done(null, user.id)
})
// 마이페이지 접속시 발동
passport.deserializeUser(function (아이디, done) {
  // db에서 위에있는 user.id로 유저를 찾은 뒤에 유저 정보를 {}안에 넣음
  db.collection('login').findOne({ id: 아이디 }, function (에러, 결과) {
    done(null, 결과)
  })
})

app.post('/add', function (req, res) {
  res.send('전송 완료!')
  db.collection('counter').findOne(
    { name: '게시물갯수' },
    function (error, result) {
      console.log(result.totalPost)
      var 총게시물갯수 = result.totalPost
      var 저장할거 = {
        _id: 총게시물갯수 + 1,
        작성자: req.user._id,
        제목: req.body.title,
        날짜: req.body.date,
      }
      db.collection('post').insertOne(저장할거, function (error, result) {
        console.log('saved!')
        // counter라는 콜렉션에 있는 totalPost 라는 항목도 1증가시켜야함 (수정);
        db.collection('counter').updateOne(
          { name: '게시물갯수' },
          { $inc: { totalPost: 1 } },
          function (error, result) {
            if (error) {
              return console.log(error)
            }
          }
        )
      })
    }
  )
})

app.delete('/delete', function (req, res) {
  console.log('삭제요청들어옴')
  console.log(req.body)
  req.body._id = parseInt(req.body._id)

  var 삭제할데이터 = { _id: req.body._id, 작성자: req.user._id }

  // 요청.body에 담겨온 게시물번호를 가진 글을 db에서 찾아서 삭제해주세요.
  db.collection('post').deleteOne(req.body, function (error, result) {
    console.log('삭제완료')
  })
  if (결과) {
    console.log(결과)
  }
  res.status(200).send({ message: '성공했습니다' })
})

app.post('/register', function (요청, 응답) {
  db.collection('login').insertOne(
    { id: 요청.body.id, pw: 요청.body.pw },
    function (에러, 결과) {
      응답.redirect('/')
    }
  )
})

app.use('/board/sub', require('./routes/board.js')) // 숙제
app.use('/shop', require('./routes/shop.js')) // / 경로로 요청했을 때 이런 미들웨어를 적용해주세요~
// app.get('/shop/shirts', function (요청, 응답) {
//   응답.send('셔츠 파는 페이지입니다.')
// })
// app.get('/shop/pants', function (요청, 응답) {
//   응답.send('바지 파는 페이지입니다')
// })

let multer = require('multer')
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/image')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname)
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
      return callback(new Error('PNG, JPG만 업로드하세요'))
    }
    callback(null, true)
  },
  limits: {
    fileSize: 1024 * 1024,
  },
})

var upload = multer({ storage: storage })

app.get('/upload', function (요청, 응답) {
  응답.render('upload.ejs')
})

app.post('/upload', upload.single('profile'), function (요청, 응답) {
  응답.send('업로드완료')
})

app.get('/image/:imageName', function (요청, 응답) {
  응답.sendFile(__dirname + '/public/image' + 요청.params.imageName)
})
