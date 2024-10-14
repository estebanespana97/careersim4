const {
    client,
    createUser,
    createItem,
    createReview,
    createComment,
    createTables,
    fetchUsers,
    fetchItems,
    fetchReviews,
    fetchComments,
    fetchThisItem,
    destroyReviews,
    updateReviews,
    fetchAllComments, 
    fetchMyComments,
    editComment,
    deleteComment,
    authenticate,
    findUserWithToken
  } = require('./db');

const express = require('express');
const app = express();
app.use(express.json());

//login stuff
const isLoggedIn = async(req, res, next)=> {
  try {
    console.log('am i arriving to isLoggedIn');
    req.user = await findUserWithToken(req.headers.authorization);
    next();
  }
  catch(ex){
    next(ex);
  }
};

app.post('/api/auth/login', async(req, res, next)=> {
  try {
    res.send(await authenticate(req.body));
  }
  catch(ex){
    next(ex);
  }
});

// app.get('/api/auth/me', isLoggedIn, async(req, res, next)=> {
//   try {
//     res.send(req.user);
//   }
//   catch(ex){
//     next(ex);
//   }
// });

//backend stuff

//fetchThisItem
app.get('/api/items/:id', async(req, res, next)=> {
  try {
    res.send(await fetchThisItem(req.params.id));
  }
  catch(ex){
    next(ex);
  }
});

//fetchAllItems
app.get('/api/items', async(req, res, next)=> {
  try {
    res.send(await fetchItems());
  }
  catch(ex){
    next(ex);
  }
});

//createReview
app.post('/api/users/:id/reviews', isLoggedIn, async(req, res, next)=> {
  try {
    if(req.params.id !== req.user.id.toString()){
      const error = Error('not authorized');
      error.status = 401;
      throw error;
    }
    res.status(201).send(await createReview({ user_id: req.params.id, item_id: req.body.item_id, review: req.body.review, rating: req.body.rating}));
  }
  catch(ex){
    next(ex);
  }
});

//allReviewsThisUserHasWritten
app.get('/api/users/:id/reviews', isLoggedIn, async(req, res, next)=> {
  try {
    if(req.params.id !== req.user.id.toString()){
      const error = Error('not authorized');
      error.status = 401;
      throw error;
    }
    res.send(await fetchReviews({user_id: req.params.id}));
  }
  catch(ex){
    next(ex);
  }
});

//deleteThisUsersReviews
app.delete('/api/users/:id/reviews', isLoggedIn, async(req, res, next)=> {
  try {
    console.log('req.params.id: ' + req.params.id);
    console.log(typeof req.params.id);
    console.log('req.user.id: ' + req.user.id);
    console.log(typeof req.user.id);
    if(req.params.id !== req.user.id.toString()){
      const error = Error('not authorized');
      error.status = 401;
      throw error;
    }
    await destroyReviews({user_id: req.params.id});
    res.sendStatus(204);
  }
  catch(ex){
    next(ex);
  }
});

//editThisReview
app.put('/api/users/:id/reviews/:review_id', isLoggedIn, async(req, res, next)=> {
  try {
    if(req.params.user_id !== req.user.id.toString()){
      const error = Error('not authorized');
      error.status = 401;
      throw error;
    }
    await updateReviews({user_id: req.params.id, review_id: req.params.review_id, rating: req.body.rating, review: req.body.review});
    res.sendStatus(204);
  }
  catch(ex){
    next(ex);
  }
});

//createComment
app.post('/api/users/:user_id/reviews/:review_id/comments', isLoggedIn, async(req, res, next)=> {
  try {
    if(req.params.id !== req.user.id.toString()){
      const error = Error('not authorized');
      error.status = 401;
      throw error;
    }
    console.log('User Id: ' +  req.params.id);
    console.log('Review Id: ' +  req.params.review_id);
    console.log('comment: ' +  req.params.comment);
    res.status(201).send(await createComment({ review_id: req.params.review_id, comment: req.body.comment}));
  }
  catch(ex){
    next(ex);
  }
});

//geMyUsersCOmments
app.get('/api/users/:user_id/comments', isLoggedIn,async(req, res, next)=> {
  try {
    if(req.params.id !== req.user.id.toString()){
      const error = Error('not authorized');
      error.status = 401;
      throw error;
    }
    res.status(201).send(await fetchMyComments({ user_id: req.params.user_id}));
  }
  catch(ex){
    next(ex);
  }
});

//updateComment
app.put('/api/users/:user_id/comments/:id', isLoggedIn, async(req, res, next)=> {
  try {
    if(req.params.id !== req.user.id.toString()){
      const error = Error('not authorized');
      error.status = 401;
      throw error;
    }
    res.status(201).send(await editComment({ id: req.params.id, comment: req.body.comment}));
  }
  catch(ex){
    next(ex);
  }
});

//deleteComment
app.delete('/api/users/:user_id/comments/:id', isLoggedIn, async(req, res, next)=> {
  try {
    if(req.params.id !== req.user.id.toString()){
      const error = Error('not authorized');
      error.status = 401;
      throw error;
    }
    res.status(201).send(await deleteComment({ id: req.params.id}));
  }
  catch(ex){
    next(ex);
  }
});

//getAllComments
app.get('/api/comments', async(req, res, next)=> {
  try {
    res.status(201).send(await fetchAllComments());
  }
  catch(ex){
    next(ex);
  }
});

const init = async()=> {
    const port = process.env.PORT || 3000;
    await client.connect();
    console.log('connected to database');
  
    await createTables();
    console.log('tables created');
  
    const [moe, lucy, quq, foo] = await Promise.all([
      createUser({ username: 'moe', password: 'm_pw'}),
      createUser({ username: 'lucy', password: 'l_pw'}),
      createUser({ username: 'ethyl', password: 'e_pw'}),
      createUser({ username: 'curly', password: 'c_pw'}),
      createItem({ name: 'foo', rating: 0 }),
      createItem({ name: 'bar', rating: 0 }),
      createItem({ name: 'bazz',rating: 0 }),
      createItem({ name: 'quq', rating: 0 }),
      createItem({ name: 'fip', rating: 0 })
    ]);
  
    console.log(await fetchUsers());
    console.log(await fetchItems());
  
    const review = await createReview({ user_id: moe.id, item_id: foo.id, review: "this was awesome", rating: "4"});
    console.log(await fetchReviews({user_id: moe.id}));

    const comment = await createComment({ user_id: moe.id, review_id: review.id, comment: "your review is mid"});
    console.log(await fetchComments({review_id: review.id}));
    app.listen(port, ()=> console.log(`listening on port ${port}`));
  };
  
  init();