const blogRouter = require('express').Router()
const Blog = require('../models/blogs')
const User = require('../models/users')
const jwt = require('jsonwebtoken')


blogRouter.get('/', async (request, response) => {
  const blogs = await Blog
  .find({})
  .populate('user', { username: 1, name: 1 })
  response.json(blogs.map(blog => blog.toJSON()))
})

blogRouter.get('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    if (blog) {
      response.json(blog)
    } else {
      response.status(404).end()
    }
})

blogRouter.delete('/:id', async (request, response) => {

  const token = request.token
  const decodedToken = jwt.verify(token, process.env.SECRET)

  if (!token || !decodedToken.id) {    
    return response.status(401).json({error: 'token missing or invalid' })  
  }

  const user = await User.findById(decodedToken.id)

  const blogDelete = await Blog.findById(request.params.id)

  if (user._id.toString() === blogDelete.user._id.toString()){
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } else {
    return response.status(401).json({error: 'invalid id' })
  }

})


blogRouter.put('/:id', (request, response, next) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    .then(updatedBlog => {
      response.json(updatedBlog)
    })
    .catch(error => next(error))
})

blogRouter.post('/', async  (request, response) => {
  const parts = request.body
  if (!parts.title  || !parts.url) {
    return response.status(400).end()
  }
  const token = request.token
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {    
    return response.status(401).json({error: 'token missing or invalid' })  
  }  
  const user = await User.findById(decodedToken.id)
  if (!parts.likes) {
    parts.likes = 0
  }
    const blog = new Blog({
      title: parts.title,
      author: parts.author,
      url: parts.url,
      likes: parts.likes,
      user: user._id
    })
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)  
    await user.save()
    response.status(201).json(savedBlog)
  })

module.exports = blogRouter