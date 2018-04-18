import { compose, withStateHandlers, withHandlers, withProps, lifecycle, branch, renderComponent } from 'recompose';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { db } from '../../utils';

import AppLoader from '../Loaders/AppLoader';
import Component from './Component';

const mapStateToProps = state => ({
  user: state.user,
  sortBy: state.answerSort,
});

const prepareAnswers = ({answers, votes, sortBy}) => {
  let sortedAnswers = answers.slice();
  switch (sortBy) {
    case 'best': {
      sortByVotes(sortedAnswers, votes, true);
      break;
    }
    case 'worst': {
      sortByVotes(sortedAnswers, votes, false);
      break;
    }
    case 'createdAt': {
      sortByDate(sortedAnswers);
      break; 
    }
  }
  return sortedAnswers;    
};

const sortByVotes = (answers, votes, isPositive) =>
  answers.sort((a, b) =>
    getVotesCount(b, votes, isPositive) - getVotesCount(a, votes, isPositive)
  );

const sortByDate = (answers) =>
  answers.sort((a, b) =>
    new Date(a.createdAt) - new Date(b.createdAt)
  );

const getVotesCount = (answer, votes, isPositive) =>
  votes.reduce((sum, vote) => 
    vote.answerId === answer._id && vote.isPositive === isPositive ? sum + 1 : sum,
  0);

const enhance = compose(
  connect(mapStateToProps),
  withStateHandlers({ answers: [], users: [], votes: [], isFetching: true }),

  withRouter,

  lifecycle({
    componentWillMount() {
      this.interval = db.pooling(async () => {
        const questionId = this.props.match.params.questionId;

        let answers = await db.answers.find();
        answers = answers.filter(answer => answer.questionId === questionId);

        let votes = await db.votes.find();
        const answerIds = answers.map(a => a._id);
        votes = votes.filter(vote => answerIds.includes(vote.answerId));

        const users = await db.users.find();

        this.setState({ answers, votes, users, isFetching: false });
      });
    },
    componentWillUnmount() {
      clearInterval(this.interval);
    }
  }),

  branch(
    ({ isFetching }) => isFetching,
    renderComponent(AppLoader)
  ),

  withHandlers({
    onVote: ({ user }) => (answerId, isPositive) => {
      if (user) {
        db.votes.insert({
          answerId,
          isPositive,
          createdAt: new Date(),
          createdById: user._id,
        });
      }
    }
  }),
  withProps(props => ({ answers: prepareAnswers(props) })),
);


export default enhance(Component);
