const usersRouter = require('express').Router()
const bcrypt = require('bcryptjs')
const User = require('../models/users')


usersRouter.post('/', async (request, response) => {

  const parts = request.body

  if (parts.password.length < 3) {

    return response.status(400).json({ error: 'User validation failed: Password too short, min(3)' })
  }
  const username = parts.username
  const existingUser = await User.findOne({ username })
  if (existingUser) {
    return response.status(400).json({
      error: 'username must be unique'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(parts.password, saltRounds)

  const user = new User({
    username: parts.username,
    name: parts.name,
    passwordHash,
  })
  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({})
    .populate('blogs', { url: 1, title: 1, author: 1 })
  response.json(users)
})

module.exports = usersRouter