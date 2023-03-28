const Blog = require('../models/blogs')

const initialBlogs = [
  {
    title: "Kuumaa",
    author: "Vili viiperi",
    url: "title.com",
    likes: 5,
  },
  {
    title: "Shii",
    author: "Bili viiperi",
    url: "sii.com",
    likes: 2,
  }
]

const nonExistingId = async () => {
  const blog = new Blog({ title: 'willremovethissoon', author: "Vili viiperi", url: "title.com", likes: 2 })
  await blog.save()
  await blog.remove()
  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const User = require('../models/users')


const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  nonExistingId,
  usersInDb,
  initialBlogs,
  nonExistingId,
  blogsInDb
}