import React, {
  ActivityIndicatorIOS,
  ListView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';


var API_URL = 'http://api.nutrio.com/api/v5/search/recipes_by_keywords';
var API_KEY = ['01e4db4b-f6f3-43f5-91d1-e3818fc9d3e9'];

var SearchBar = require('./SearchBar');

var SearchScreen = React.createClass({

  getInitialState: function() {
    return {
      isLoading: false,
      isLoadingTail: false,
      filter: '',
      queryNumber: 0,
    };
  },

  render: function() {
    return (
      <View style={styles.container}>
        <SearchBar
          isLoading={this.state.isLoading}
          onFocus={() =>
            this.refs.listview && this.refs.listview.getScrollResponder().scrollTo({ x: 0, y: 0 })}
        />
        <View style={styles.separator} />
          <NoRecipes
            filter={this.state.filter}
            isLoading={this.state.isLoading}
          />
      </View>
    );
  },
});

var NoRecipes = React.createClass({

  render: function() {
    console.log("NoRecipes render");
    var text = '';
    if (this.props.filter) {
      text = `No results for "${this.props.filter}"`;
    } else if (!this.props.isLoading) {
      text = 'No recipes found';
    }

    return (
      <View style={[styles.container, styles.centerText]}>
        <Text style={styles.NoRecipesText}>{text}</Text>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  centerText: {
    alignItems: 'center',
  },
  NoRecipesText: {
    marginTop: 80,
    color: '#888888',
  },
  separator: {
    height: 1,
    backgroundColor: '#eeeeee',
  },
  scrollSpinner: {
    marginVertical: 20,
  },
  rowSeparator: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    height: 1,
    marginLeft: 4,
  },
  rowSeparatorHide: {
    opacity: 0.0,
  },
});

module.exports = SearchScreen;