const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Blog = require('../models/blogs')

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(helper.initialBlogs.length)})

test('a specific blog is within the returned blogs', async () => {
  const response = await api.get('/api/blogs')

  const contents = response.body.map(r => r.title)
  expect(contents).toContain(
    'Kuumaa'
  )
})
describe("adding deleting or editing blogs", () => {
  let token = null
  beforeAll(async () => {
    await User.deleteMany({})
    await Blog.deleteMany({})
    const passwordHash = await bcrypt.hash("password", 10)
    const user = await new User({ username: "user", passwordHash, name: "user" }).save()
    const userForToken = { username: user.username, id: user.id }
    return (token = jwt.sign(userForToken, process.env.SECRET))
  })
  test('a valid blog can be added ', async () => {
  const newBlog = {
    title: 'New great blog',
    author: "Vili viiperi",
    url: 'NGB.com',
    likes: 4
  }
  await api
    .post('/api/blogs')
    .set("Authorization", `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)


  const blogsAtEnd = await helper.blogsInDb()  
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
  const contents = blogsAtEnd.map(n => n.title)  
  expect(contents).toContain(
    'New great blog'
  )
})

test('blog without content is not added', async () => {
  const newBlog = {
    likes: 3
  }

  await api
    .post('/api/blogs')
    .set("Authorization", `Bearer ${token}`)
    .send(newBlog)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)})


test('The identifier of a blog should be id', async () => {
    const blogs = await Blog.find({})
    expect(blogs[0].id).toBeDefined()
})
test('Valid blogs should be added without an error', async() => {
    const toBeAdded = {
        title:"Epäonnistumisen eepos",
        author: "Osaispa jotain",
        url: "epäonnistus.com",
        likes: 4
    }

    await api
    .post('/api/blogs')
    .set("Authorization", `Bearer ${token}`)
    .send(toBeAdded)
    .expect(201)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
})
test('Adding a blog without defining likes, will add it with 0 likes', async () => {
    const toBeAdded = {
        title:"Testinnimissä epäonnistunut",
        author: "Osaispa jotain",
        url: "epäonnistus.com"
    }

    await api
    .post('/api/blogs')
    .set("Authorization", `Bearer ${token}`)
    .send(toBeAdded)
    .expect(201)

    const blogsAtEnd = await helper.blogsInDb()
    const added = await blogsAtEnd.find(blog => blog.title ===toBeAdded.title)
    expect(added.likes).toBe(0)
})
test('Adding a blog without title and url results statuscode error 400', async () => {
    const toBeAdded = {
        author: "Osaispa jotain",
        likes: 2
    }

    await api
    .post('/api/blogs')
    .set("Authorization", `Bearer ${token}`)
    .send(toBeAdded)
    .expect(400)
})
test('Adding a blog without token, causes error 401', async () => {
  const toBeAdded = {
    title:"Testinnimissä epäonnistunut",
    author: "Osaispa jotain",
    url: "epäonnistus.com",
    likes: 4
}
  await api
  .post('/api/blogs')
  .set("Authorization", `Bearer eiollu`)
  .send(toBeAdded)
  .expect(401)
})

test('Removing a blog needs authorized login', async () => {
    const toBeAdded = {
        title:"Testinnimissä epäonnistunut",
        author: "Osaispa jotain",
        url: "epäonnistus.com"
    }
    await api
    .post('/api/blogs')
    .set("Authorization", `Bearer ${token}`)
    .send(toBeAdded)
    .expect(201)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length +1)
    const added = await blogsAtEnd.find(blog => blog.title === toBeAdded.title)
    tokeni = null
    await api
      .delete(`/api/blogs/${added.id}`)
      .set("Authorization", `Bearer ${tokeni}`)
      .expect(401)
    const blogsAtEnd1 = await helper.blogsInDb()
    expect(blogsAtEnd1).toHaveLength(helper.initialBlogs.length+1)
  })
  test('Removing a blog works correctly', async () => {
    const toBeAdded = {
        title:"Onnistuminen tutuksi",
        author: "Onnistuispa",
        url: "epäepäonnistus.com"
    }
    await api
    .post('/api/blogs')
    .set("Authorization", `Bearer ${token}`)
    .send(toBeAdded)
    .expect(201)
    .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length +1)
    const added = await blogsAtEnd.find(blog => blog.title === toBeAdded.title)
    await api
      .delete(`/api/blogs/${added.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204)
    const blogsAtEnd1 = await helper.blogsInDb()
    expect(blogsAtEnd1).toHaveLength(helper.initialBlogs.length)
  })
  test('Editing a blog works', async () => {
    const toBeAdded = {
        title:"Testinnimissä epäonnistunut",
        author: "Osaispa jotain",
        url: "epäonnistus.com",
        likes: 5
    }
    await api
    .post('/api/blogs')
    .set("Authorization", `Bearer ${token}`)
    .send(toBeAdded)
    .expect(201)

    const blogsAtEnd = await helper.blogsInDb()
    const added = await blogsAtEnd.find(blog => blog.title === toBeAdded.title)
    const edited = {
        ...added,
        likes: added.likes + 1
      }

    await api
      .put(`/api/blogs/${added.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(edited)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    
    const blogsAtEnd1 = await helper.blogsInDb()
    expect(blogsAtEnd1).toHaveLength(helper.initialBlogs.length+1)
    const theBlog = blogsAtEnd1.find(blog => blog.title === toBeAdded.title)
    expect(theBlog.likes).toBe(6)
  })
})

const User = require('../models/users')
const { config } = require('dotenv')


describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })
  test('creation fails with used username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
  })
  test('creation fails with invalid password', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'sa',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})  



afterAll(() => {
  mongoose.connection.close()
}) 