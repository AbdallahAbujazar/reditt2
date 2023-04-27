# Reddit-like Web Application
> This web application is designed to provide a platform similar to Reddit, where users can create posts, comment on them, and vote on them.


---

# [Live Demo](https://hej-6abv.onrender.com/)
https://hej-6abv.onrender.com/


---

# Features

* User registration and authentication system using JWT tokens
* User profile with the ability to edit their information and profile image
* Create, edit, and delete posts
* Ability to comment on posts and edit/delete comments
* Ability to upvote/downvote posts and sort them based on popularity
* Pagination for posts and comments
* Search functionality for posts


---

# Technologies Used
* Node.js
* Express.js
* PostgreSQL
* EJS
* Multer
* Bcrypt
* JWT



---

# Getting Started
To run this application, follow these steps:

**1. Clone the repository to your local machine using the command:**
```
git clone https://github.com/AbdallahAbujazar/reditt2.git
```

**2. Install the dependencies using the command:**

```
npm install
```
**3. Set up the database by running the queries.**

```
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  profile_image VARCHAR(255)
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  post_image VARCHAR(255),
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  post_id INTEGER REFERENCES posts(id) NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  vote VARCHAR(10) NOT NULL
);
```

**4. Create a .env file and set the following environment variables:**
```
JWT_SECRET=secretkey
DATABASE_URL=postgres://username:password@localhost:5432/redditclone

```

**5.Start the server using the command:**
```
npm start
```

**6. Open your web browser and navigate to `http://localhost:3000 `to access the web application.**

---

# Acknowledgements
This project was inspired by the Reddit platform and built as a learning exercise for Node.js and web development in general. Special thanks to the following resources for their help:

* My teachers at Code Academy in Gaza Sky Geeks
* The Net Ninja's Node.js and Express Tutorial Series on YouTube
* The EJS Template Engine Documentation
* The PostgreSQL Documentation
* The Multer Documentation
* The Bcrypt Documentation
* The JWT Documentation



