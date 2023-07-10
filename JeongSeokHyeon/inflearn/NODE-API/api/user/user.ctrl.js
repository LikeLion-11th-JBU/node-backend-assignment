// api 로직
const models = require('../../models')

const index = function (req, res) {
  req.query.limit = req.query.limit || 10
  const limit = parseInt(req.query.limit, 10) //"2"라는 문자열로 들어온다 => parseInt(인자값,진수)를 사용해 정수로 변환
  if (Number.isNaN(limit)) {
    return res.status(400).end()
  }

  models.User.findAll({ limit: limit }).then((users) => {
    res.json(users)
  })
}

const show = function (req, res) {
  const id = parseInt(req.params.id, 10)
  if (Number.isNaN(id)) return res.status(400).end()
  models.User.findOne({
    where: {
      id: id,
    },
  }).then((user) => {
    if (!user) return res.status(404).end()
    res.json(user)
  })
}

const destroy = function (req, res) {
  const id = parseInt(req.params.id, 10)
  if (Number.isNaN(id)) return res.status(400).end()
  users = users.filter((user) => user.id !== id)
  res.status(204).end()
}

const create = function (req, res) {
  const name = req.body.name
  if (!name) return res.status(400).end()
  const isConflic = users.filter((user) => user.name === name).length
  if (isConflic) return res.status(409).end()
  const id = Date.now()
  const user = { id, name }
  users.push(user)
  res.status(201).json(user)
}

const update = function (req, res) {
  const id = parseInt(req.params.id, 10)
  if (Number.isNaN(id)) return res.status(400).end()
  const name = req.body.name
  if (!name) return res.status(400).end()
  const isConflict = users.filter((user) => user.name === name).length
  if (isConflict) return res.status(409).end()
  const user = users.filter((user) => user.id === id)[0]
  if (!user) return res.status(404).end()
  user.name = name
  res.json(user)
}

module.exports = {
  index,
  show,
  destroy,
  create,
  update,
}
