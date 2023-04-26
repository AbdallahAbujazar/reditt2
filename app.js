require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');

const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const homeRouter = require('./routes/home');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const path = require('path');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const registerRoutes = require('./routes/registerRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');
const authController = require('./controllers/authController');
const postController = require('./controllers/postController');
const { getTopUsers } = require('./middleware/topUsersMiddleware');






app.use(cookieParser());

app.use(express.json());
app.use('/', homeRouter);

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/users', userRoutes);
app.use('/register', registerRoutes);
app.use(errorMiddleware);
app.use(express.static('public'));
app.use(express.static(__dirname + '/public/css'));



app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'views/auth')]);
app.set('view engine', 'ejs');


app.get('/logout', function(req, res) {
  res.clearCookie('jwt');

  res.redirect('/');
});


app.get('/post', function(req, res) {
  res.render('post', { title: 'post' });
});


app.get('/login', function(req, res) {
  res.render('auth/login', { title: 'Login', user: null, message: null,user2: null }); 
});

app.get('/register', function(req, res) {
  res.render('auth/register', { title: 'Register', errors: [], user: null,user2: null }); 
});


app.get('/profile', function(req, res) {
  res.render('profile', { title: 'profile' });
});
app.post('/register', authController.register);
app.post('/register',  authController.register) 

app.post('/login', authController.login);
app.post('/posts',  postController.createPost);
app.get('/post/:id',  postController.getPopularPosts, postController.getPostById, getTopUsers,postController.createComment, postController.deleteComment, postController.upvotePost, postController.downvotePost);
app.post('/comments',  postController.createComment);
app.delete("/comments/:id", postController.deleteComment);
app.put("/posts/:id/upvote", postController.upvotePost);
app.put("/posts/:id/downvote", postController.downvotePost);

/*app.post('/comments', async (req, res) => {
  const { postId, body } = req.body;

  try {
    const comment = await Comment.create({
      post_id: postId,
      body
    });

    res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});
*/

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

