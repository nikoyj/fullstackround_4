const blogRouter = require('express').Router()
const Blog = require('../models/blogs')


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
  const user = request.user
  const blogDelete = await Blog.findById(request.params.id)
  if (user.id.toString() === blogDelete.user.toString()){
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } else {
    return response.status(401).json({error: 'invalid id' })
  }
})


blogRouter.put('/:id', async (request, response, next) => {
  const body = request.body
  const user = request.user

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
    await user.save()
})

blogRouter.post('/', async  (request, response) => {
  const parts = request.body
  if (!parts.title  || !parts.url) {
    return response.status(400).end()
  }
  const user = request.user
  if (!parts.likes) {
    parts.likes = 0
  }
    const blog = new Blog({
      title: parts.title,
      author: parts.author,
      url: parts.url,
      likes: parts.likes,
      user: user
    })
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog.id)  
    await user.save()
    response.status(201).json(savedBlog)
  })

module.exports = blogRouter