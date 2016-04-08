import React, {
  ActivityIndicatorIOS,
  ListView,
  Image,
  Platform,
  StyleSheet,
  TouchableHighlight,
  Text,
  View,
} from 'react-native';


var API_URL = 'http://api.nutrio.com/api';
var API_KEY = '01e4db4b-f6f3-43f5-91d1-e3818fc9d3e9';

var SearchBar = require('./SearchBar');
var RecipeCell = require('./RecipeCell');
var RecipeScreen = require('./RecipeScreen');

var LOADING = {};

var SearchScreen = React.createClass({

  timeoutID: (null: any),

  getInitialState: function() {
    return {
      isLoading: false,
      isLoadingTail: false,
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      featuredDataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      term: '',
      queryNumber: 0,
      pageNumber: 1,
      pageSize: 20,
      totalRecords: 0
    };
  },

  onSearchChange: function(event: Object) {
    var filter = event.nativeEvent.text.toLowerCase();
    clearTimeout(this.timeoutID);
    this.timeoutID = setTimeout(() => this.searchRecipesByKeyword(filter), 100);
  },

  _urlForQueryAndPage: function(query: string, pageNumber: number): string {

    if (query) {
      return (
        API_URL + '/v5/search/recipes_by_keywords'
      );
    }
  },

  _authentication: function():string {
    return 'Basic '+btoa('not_needed:'+API_KEY);
  },

  getDataSource: function(recipes: Array<any>): ListView.DataSource {
    return this.state.dataSource.cloneWithRows(recipes);
  },

  selectRecipe: function(recipe: Object) {
    this.props.navigator.push({
      title: recipe.name,
      component: RecipeScreen,
      passProps: {recipe},
    });
  },

  searchRecipesByKeyword: function(query: string) {
    this.timeoutID = null;

    this.setState({filter: query});

    LOADING[query] = true;

    this.setState({
      isLoading: true,
      queryNumber: this.state.queryNumber + 1,
      isLoadingTail: false,
      term: query
    });
    
    var endpoint = this._urlForQueryAndPage(query, 1)

    console.log("fetching: "+query+" page:"+this.state.pageNumber);

    fetch('https://api.nutrio.com/api/v5/search/recipes_by_keywords',{
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('not_needed:01e4db4b-f6f3-43f5-91d1-e3818fc9d3e9'),
      },
      body: JSON.stringify({
        term: query,
        page_size: this.state.pageSize,
        page_number: this.state.pageNumber,
      })
    })
      .then((response) => response.json())
      .catch((error) => {
        console.warn('error: '+error);
        LOADING[query] = false;

        this.setState({
          dataSource: this.getDataSource([]),
          isLoading: false,
        });
      })
      .then((responseData) => {
        console.log('response:'+responseData.meals)
        LOADING[query] = false;

        if (this.state.filter !== query) {
          // do not update state if the query is stale
          return;
        }

        this.setState({
          isLoading: false,
          dataSource: this.getDataSource(responseData.meals),
          pageSize: responseData.page_size,
          pageNumber: responseData.page_number,
          totalRecords: responseData.total_records,
          term: responseData.term,
        });
      })
      .done();
  },

  hasMore: function(): boolean {
    return this.state.totalRecords > (this.state.pageNumber * this.state.pageSize)
  },

  onEndReached: function() {
    console.log("onEndReached");
    var query = this.state.term;
    if (!this.hasMore() || this.state.isLoadingTail) {
      // We're already fetching or have all the elements so noop
      return;
    }

    if (LOADING[query]) {
      return;
    }

    LOADING[query] = true;
    this.setState({
      queryNumber: this.state.queryNumber + 1,
      isLoadingTail: true,
      pageNumber: this.state.pageNumber  + 1
    });

    console.log("onEndReached fetching"+this.state.pageNumber);

    fetch('https://api.nutrio.com/api/v5/search/recipes_by_keywords',{
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('not_needed:01e4db4b-f6f3-43f5-91d1-e3818fc9d3e9'),
      },
      body: JSON.stringify({
        term: query,
        page_size: this.state.pageSize,
        page_number: this.state.pageNumber,
      })
    })
      .then((response) => response.json())
      .catch((error) => {
        console.error(error);
        LOADING[query] = false;
        this.setState({
          isLoadingTail: false,
        });
      })
      .then((responseData) => {
        console.log('onEndReached response:'+responseData.meals)
        LOADING[query] = false;

        if (this.state.filter !== query) {
          // do not update state if the query is stale
          return;
        }

        this.setState({
          isLoading: false,
          dataSource: this.getDataSource(responseData.meals),
          pageSize: responseData.page_size,
          pageNumber: responseData.page_number,
          totalRecords: responseData.total_records,
          term: responseData.term,
        });
      })
      .done();
  },

  renderSeparator: function(
    sectionID: number | string,
    rowID: number | string,
    adjacentRowHighlighted: boolean
  ) {
    var style = styles.rowSeparator;
    if (adjacentRowHighlighted) {
        style = [style, styles.rowSeparatorHide];
    }
    return (
      <View key={'SEP_' + sectionID + '_' + rowID}  style={style}/>
    );
  },

  renderRow: function(
    recipe: Object,
    sectionID: number | string,
    rowID: number | string,
    highlightRowFunc: (sectionID: ?number | string, rowID: ?number | string) => void,
  ) {
    return (
      <RecipeCell
        key={recipe.id}
        onSelect={() => this.selectRecipe(recipe)}
        onHighlight={() => highlightRowFunc(sectionID, rowID)}
        onUnhighlight={() => highlightRowFunc(null, null)}
        recipe={recipe}
      />
    );
  },

  render: function() {
    var content = this.state.dataSource.getRowCount() === 0 ?
      <NoRecipes
        filter={this.state.filter}
        isLoading={this.state.isLoading}
      /> :
      <ListView
        ref="listview"
        renderSeparator={this.renderSeparator}
        dataSource={this.state.dataSource}
        renderRow={this.renderRow}
        //onEndReached={this.onEndReached}
        automaticallyAdjustContentInsets={false}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps={true}
        showsVerticalScrollIndicator={false}
      />;

    return (
      <View style={styles.container}>
        <SearchBar
          isLoading={this.state.isLoading}
          onSearchChange={this.onSearchChange}
          onFocus={() =>
            this.refs.listview && this.refs.listview.getScrollResponder().scrollTo({ x: 0, y: 0 })}
        />
        <View style={styles.separator} />
          {content}
        <View style={styles.separator} />
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
  detailsImage: {
    height: 90,
    backgroundColor: '#eaeaea',
    marginRight: 10,
  },
  headline: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0)', 
    color: 'white'  
  }
});

module.exports = SearchScreen;