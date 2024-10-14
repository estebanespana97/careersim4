const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/careerSim4');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT = process.env.JWT || 'shhh';

const createTables = async()=> {
    const SQL = `
      DROP TABLE IF EXISTS comments;
      DROP TABLE IF EXISTS reviews;
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS items;
      CREATE TABLE users(
        id SERIAL PRIMARY KEY,
        username VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      );
      CREATE TABLE items(
        id SERIAL PRIMARY KEY,
        rating VARCHAR(20),
        name VARCHAR(255) NOT NULL
      );
      CREATE TABLE reviews(
        id SERIAL PRIMARY KEY,
        rating VARCHAR(20),
        review VARCHAR (255),
        user_id INTEGER REFERENCES users(id) NOT NULL,
        item_id INTEGER REFERENCES items(id) NOT NULL,
        CONSTRAINT unique_user_id_and_item_id UNIQUE (user_id, item_id)
      );
      CREATE TABLE comments(
        id SERIAL PRIMARY KEY,
        comment VARCHAR(255),
        user_id INTEGER REFERENCES users(id) NOT NULL,
        review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE NOT NULL
      );
    `;
    await client.query(SQL);
  };

  //authentication and login stuff

  const authenticate = async({ username, password })=> {
    const SQL = `
      SELECT id, username, password FROM users WHERE username=$1;
    `;
    //console.log(username);
    const response = await client.query(SQL, [username]);
    //console.log(response);
    if(!response.rows.length || (await bcrypt.compare(password, response.rows[0].password))=== false){
      const error = Error('not authorized');
      error.status = 401;
      throw error;
    }
    const token = await jwt.sign({ id: response.rows[0].id}, JWT);
    console.log('Here is my token: ' + token);
    return { token };
  };
  
  const findUserWithToken = async(token)=> {
    let id;
    try {
      console.log(token);
      const payload = await jwt.verify(token, JWT);
      id = payload.id;
    }
    catch(ex){
      const error = Error('not authorized');
      error.status = 401;
      throw error;
    }
    const SQL = `
      SELECT id, username FROM users WHERE id=$1;
    `;
    const response = await client.query(SQL, [id]);
    if(!response.rows.length){
      const error = Error('not authorized');
      error.status = 401;
      throw error;
    }
    return response.rows[0];
  };

  //data stuff

  const createUser = async({ username, password})=> {
    const SQL = `INSERT INTO users(username, password) VALUES($1, $2) RETURNING *`;
    const response = await client.query(SQL,[username, await bcrypt.hash(password, 5)]);
    return response.rows[0];
  };

  const fetchUsers = async()=> {
    const SQL = `
      SELECT id, username FROM users;
    `;
    const response = await client.query(SQL);
    return response.rows;
  };

  const createItem = async({name, rating})=> {
    const SQL = `INSERT INTO items(name,rating) VALUES($1,$2) RETURNING *`;
    const response = await client.query(SQL,[name,rating]);
    return response.rows[0];
  };

  const fetchItems = async()=> {
    const SQL = `SELECT * FROM items;`;
    const response = await client.query(SQL);
    return response.rows;
  };

  const fetchThisItem = async(item_id)=> {
    const SQL = `SELECT * FROM items where id = $1`;
    const response = await client.query(SQL,[item_id]);
    return response.rows;
  };

  const createReview = async({ user_id, item_id, review, rating})=> {
    const SQL = `INSERT INTO reviews(user_id, item_id, review, rating) VALUES($1,$2,$3,$4) RETURNING *`;
    const response = await client.query(SQL,[user_id,item_id, review, rating]);
    return response.rows[0];
  };

  const fetchReviews = async({user_id})=> {
    const SQL = `SELECT * FROM reviews where user_id = $1`;
    const response = await client.query(SQL, [user_id]);
    return response.rows;
  };

  const destroyReviews = async({ user_id })=> {
    console.log(user_id);
    const SQL = `DELETE FROM reviews WHERE user_id=$1`;
    await client.query(SQL, [user_id]);
  };

  const updateReviews = async({ review_id, rating, review })=> {
    const SQL = `UPDATE reviews SET rating=$1,review=$2 WHERE id=$3 RETURNING *`;
    await client.query(SQL, [rating, review, review_id]);
  }; 


  const createComment = async({ review_id, user_id,  comment})=> {
    const SQL = `INSERT INTO comments(review_id, comment, user_id) VALUES($1, $2, $3) RETURNING *`;
    const response = await client.query(SQL,[review_id, comment, user_id]);
    return response.rows[0];
  };

  const editComment = async({ id, comment})=> {
    const SQL = `UPDATE comments SET comment=$1 where id=$2 RETURNING *`;
    const response = await client.query(SQL,[comment, id]);
    return response.rows[0];
  };

  const deleteComment = async({ id})=> {
    const SQL = `DELETE from comments WHERE id=$1`;
    const response = await client.query(SQL,[id]);
    return response.rows[0];
  };

  const fetchComments = async({review_id})=> {
    const SQL = `SELECT * FROM comments where review_id = $1`;
    const response = await client.query(SQL, [review_id]);
    return response.rows;
  };

  const fetchMyComments = async({user_id})=> {
    const SQL = `SELECT * FROM comments where user_id = $1`;
    const response = await client.query(SQL, [user_id]);
    return response.rows;
  };

  const fetchAllComments = async()=> {
    const SQL = `SELECT * FROM comments`;
    const response = await client.query(SQL, []);
    return response.rows;
  };

  


  module.exports = { client, createTables, createUser, createItem, createReview, createComment, fetchUsers, fetchItems, fetchReviews, fetchComments, fetchThisItem, destroyReviews, updateReviews, fetchAllComments, fetchMyComments, editComment, deleteComment, authenticate, findUserWithToken};