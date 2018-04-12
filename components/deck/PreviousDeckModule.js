import React from 'react';
import PropTypes from 'prop-types';
import { concat, forEach, groupBy, keys, mapValues, uniqBy } from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as Actions from '../../actions';
import DeckDelta from './DeckDelta';

class PreviousDeckModule extends React.PureComponent {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    deck: PropTypes.object.isRequired,
    previousDeck: PropTypes.object,
    getDeck: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const {
      deck,
      previousDeck,
      getDeck,
    } = this.props;
    if (deck.previous_deck && !previousDeck) {
      getDeck(deck.previous_deck, true);
    }
  }

  render() {
    const {
      navigator,
      deck,
      previousDeck,
    } = this.props;

    if (!deck.previous_deck) {
      return null;
    }
    if (!previousDeck) {
      // loading
      return null;
    }
    // Actually compute the diffs.
    const exiledCards = deck.exile_string ? mapValues(
      groupBy(deck.exile_string.split(',')),
      items => items.length) : {};

    const changedCards = {};
    forEach(
      uniqBy(concat(keys(deck.slots), keys(previousDeck.slots))),
      code => {
        const exiledCount = exiledCards[code] || 0;
        const newCount = deck.slots[code] || 0;
        const oldCount = previousDeck.slots[code] || 0;
        const delta = (newCount + exiledCount) - oldCount;
        if (delta !== 0) {
          changedCards[code] = delta;
        }
      });

    return (
      <DeckDelta
        navigator={navigator}
        changedCards={changedCards}
        exiledCards={exiledCards}
      />
    );
  }
}

function mapStateToProps(state, props) {
  if (props.deck &&
    props.deck.previous_deck &&
    props.deck.previous_deck in state.decks.all) {
    return {
      previousDeck: state.decks.all[props.deck.previous_deck],
    };
  }
  return {
    previousDeck: null,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(PreviousDeckModule);
