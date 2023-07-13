var router = require('express').Router() // 라우터 파일 필수

router.get('/sports', function (요청, 응답) {
  응답.send('스포츠 게시판')
})
router.get('/game', function (요청, 응답) {
  응답.send('게임 게시판')
})

module.exports = router // module.exports = 내보낼 변수명
