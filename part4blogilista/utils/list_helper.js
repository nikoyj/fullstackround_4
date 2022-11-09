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
        let counts = blogs.reduce((count, blog) => {
            count[blog.author] = (count[blog.author] || 0) + 1
            return count
        }, {})
        let max = Math.max(...Object.values(counts))
        let mostFrequent = Object.keys(counts).filter(author => counts[author] === max)
        return {
            author: mostFrequent[0],
            blogs: max
        }
    }
}
const mostLikes = (blogs) => {
    if (blogs.length === 0) {
        return {}
    } else {
        let counts = blogs.reduce((count, blog) => {
            count[blog.author] = (count[blog.author] || 0) + blog.likes
            return count
        }, {})
        let max = Math.max(...Object.values(counts))
        let mostFrequent = Object.keys(counts).filter(author => counts[author] === max)
        return {
            author: mostFrequent[0],
            likes: max
        }
    }
}
  
  module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
  }