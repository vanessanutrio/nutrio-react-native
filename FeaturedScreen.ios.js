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

var LOADING = {};

var SearchScreen = require('./SearchScreen');
var RecipeScreen = require('./RecipeScreen');

var FeaturedScreen = React.createClass({

  timeoutID: (null: any),

  getInitialState: function() {
    return {
      isLoading: false,
      isLoadingTail: false,
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      })
    };
  },

  selectRecipe: function(recipe: Object) {
    this.props.navigator.push({
      title: recipe.name,
      component: RecipeScreen,
      passProps: {recipe},
    });
  },

  browseRecipes: function() {
    this.props.navigator.push({
      title: "Search",
      component: SearchScreen,
      passProps: {},
    });
  },

  searchFeaturedRecipes: function(query: string) {
    this.timeoutID = null;

    this.setState({filter: query});

    LOADING[query] = true;

    this.setState({
      isLoading: true,
      queryNumber: this.state.queryNumber + 1,
      isLoadingTail: false,
      term: query
    });

    fetch('https://api.nutrio.com/api/v2/search/featured_recipes',{
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('not_needed:01e4db4b-f6f3-43f5-91d1-e3818fc9d3e9'),
      },
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
        console.log('response:'+responseData.hits)
        LOADING[query] = false;

        if (this.state.filter !== query) {
          // do not update state if the query is stale
          return;
        }

        this.setState({
          isLoading: false,
          dataSource: this.getDataSource(responseData.hits),
        });
      })
      .done();
  },

  getDataSource: function(recipes: Array<any>): ListView.DataSource {
    return this.state.dataSource.cloneWithRows(recipes);
  },

  componentDidMount: function(){
    this.searchFeaturedRecipes()
  },


  render: function() {

    return (
      <View style={styles.container}>
        <ListView
          dataSource={this.state.dataSource}
          renderSeparator={this.renderSeparator}
          renderRow={(rowData) => <View>
              <TouchableHighlight
                onPress={() => this.selectRecipe(rowData)}>
                <Image style={styles.detailsImage} source={{uri: 'http://demo.nutrio.com'+rowData.images[0].url}}>
                  <View>
                    <Text style={styles.headline}>{rowData.name}</Text>
                  </View>
                </Image>
              </TouchableHighlight>
            </View>
          }
          //onEndReached={this.onEndReached}
          automaticallyAdjustContentInsets={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps={true}
          showsVerticalScrollIndicator={false}
        />
        <TouchableHighlight 
          style={styles.button}
          onPress={() => this.browseRecipes()}>
          <View>
            <Text style={styles.buttonText}>Search</Text>
          </View>
        </TouchableHighlight>
      </View>
    );
  },
});


var styles = StyleSheet.create({
  container: {
    marginTop: 60,
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
    height: 3,
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
    height: 100,
    backgroundColor: '#eaeaea',
    marginRight: 0,
    borderRadius: 8,
  },
  button: {
    height: 42,
    backgroundColor: '#e98f00',
    borderColor: '#e97c00',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 5,
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: '#fff',
    alignSelf: 'center'
  },
  headline: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: '#75b843', 
    color: '#fff',
    paddingTop: 5,
    paddingBottom: 5,
  }
});

module.exports = FeaturedScreen;