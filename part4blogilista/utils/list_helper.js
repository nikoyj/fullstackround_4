const dummy = (blogs) => {
    return 1
  }
  
  const totalLikes = (blogs) => {
    return blogs.length === 0
    ? 0
    : blogs.reduce((sum, blog) => sum + blog.likes, 0)
  }
  const favoriteBlog = (blogs) => {
    return blogs.length === 0
    ? {}
    : blogs.reduce((maxLikes, blog) => blog.likes > maxLikes ? blog.likes : maxLikes, blogs[0].likes)
}
const mostBlogs = (blogs) => {
    if (blogs.length === 0) {
        return {}
    } else {
        const counts = blogs.reduce((author, blog) => {
            author[blog.author] = (author[blog.author] || 0) + 1
            return author
        }, {})

        return Object.entries(counts).map(([author, blogs]) => ({ author, blogs })).sort((a, b) => b.blogs - a.blogs)[0]
    }
}
const mostLikes = (blogs) => {
    if (blogs.length === 0) {
        return {}
    } else {
        const counts = blogs.reduce((author, blog) => {
            author[blog.author] = (author[blog.author] || 0) + blog.likes
            return author
        }, {})

        return Object.entries(counts).map(([author, likes]) => ({ author, likes })).sort((a, b) => b.likes - a.likes)[0]
    }

}
  
  module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
  }