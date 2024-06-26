const mongoose = require('mongoose')

const blogSchema = mongoose.Schema({
    title: {
      type: String,
      required: true,
      unique: true,
      minlength: 2
    },
    author: {
      type: String,
      required: true,
      minlength: 5
    },
    url: {
      type: String,
      required: true,
      minlength: 5
    },
    user: {    
      type: mongoose.Schema.Types.ObjectId,    
      ref: 'User'  },
    likes: {
        type: Number
      },
      comments: [{
        type: String
    }]
  })

  blogSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })

  module.exports = mongoose.model('Blog', blogSchema)