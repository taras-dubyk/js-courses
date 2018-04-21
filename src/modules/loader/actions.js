import { questionTypes } from './';

const setLoader = (value, name) => ({
  type: questionTypes.SET_LOADER,
  value,
  name
  // TODO: HOMEWORK 9: complete this action
});

// THIS IS ASYNC ACTION
const createQuestion = (db, document, history) => dispatch => {
  // TODO: HOMEWORK 9: set loader to start loading (true), loader name is questionTypes.CREATE_QUESTION
  dispatch(setLoader(true, questionTypes.CREATE_QUESTION));
  setTimeout(() => {
    // emulating server work
    db.questions.insert(document);
    dispatch(setLoader(false, questionTypes.CREATE_QUESTION));    
    history.push('/');
  }, 1000);
  // TODO: HOMEWORK 9: set loader to end loading (false)
};

export default { setLoader, createQuestion }