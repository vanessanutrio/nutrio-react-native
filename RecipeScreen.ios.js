import React, {
  Image,
  ListView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';


var API_URL = 'http://api.nutrio.com/api';
var API_KEY = '01e4db4b-f6f3-43f5-91d1-e3818fc9d3e9';

var LOADING = {};

var RecipeScreen = React.createClass({

  timeoutID: (null: any),

  getInitialState: function() {

    return {
      isLoading: false,
      isLoadingTail: false,
      recipe: this.props.recipe,
      ingredientsDataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      prepNotesDataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      nutrientsDataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
    };
  },

  searchRecipe: function() {
    this.timeoutID = null;

    LOADING[this.props.recipe.guid] = true;

    this.setState({
      isLoading: true,
      isLoadingTail: false,
    });

    console.log("fetching: "+this.props.recipe.guid);

    fetch('https://api.nutrio.com/api/v3/meals?guid='+this.props.recipe.guid,{
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('not_needed:01e4db4b-f6f3-43f5-91d1-e3818fc9d3e9'),
      }
    })
      .then((response) => response.json())
      .catch((error) => {
        console.warn('error: '+error);
        LOADING[this.props.recipe.guid] = false;

        this.setState({
          recipe: this.props.recipe,
          isLoading: false,
        });
      })
      .then((responseData) => {
        LOADING[this.props.recipe.guid] = false;

        this.setState({
          isLoading: false,
          recipe: responseData,
          ingredientsDataSource: this.state.ingredientsDataSource.cloneWithRows(responseData[0].recipes[0].recipe_foods),
          prepNotesDataSource: this.state.prepNotesDataSource.cloneWithRows(responseData[0].recipes[0].prep_notes),
          nutrientsDataSource: this.state.nutrientsDataSource.cloneWithRows(responseData[0].meal.meal_nutrients),

        });
      })
      .done();
  },


  componentDidMount: function(){
    this.searchRecipe()
  },


  render: function() {
    
    return (
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.mainSection}>
          {/* $FlowIssue #7363964 - There's a bug in Flow where you cannot
            * omit a property or set it to undefined if it's inside a shape,
            * even if it isn't required */}
          <View style={styles.rightPane}>
            <Text style={styles.recipeName}>{this.props.recipe.name}</Text>
            <Text>Serves: {this.props.recipe.number_of_servings}</Text>
            <View>
              <Text>
                Prep Time: {this.props.recipe.prep_time_in_minutes}
              </Text>
              <Text>
                Total Time: {this.props.recipe.total_time_in_minutes}
              </Text>
              <View style={styles.separator} />
              <Text style={styles.recipeDetails}>Ingredients:</Text>
              <ListView
                dataSource={this.state.ingredientsDataSource}
                renderRow={(rowData) => <Text>{rowData.amount} {rowData.food.name}</Text>}
                automaticallyAdjustContentInsets={false}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps={true}
                showsVerticalScrollIndicator={false}
              />
              <View style={styles.separator} />
              <Text style={styles.recipeDetails}>Preparation Notes:</Text>
              <ListView
                dataSource={this.state.prepNotesDataSource}
                renderRow={(rowData) => <Text>{rowData.action}</Text>}
                automaticallyAdjustContentInsets={false}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps={true}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </View>
        <View style={styles.separator} />
      </ScrollView>
    );
  },
});


var styles = StyleSheet.create({
  contentContainer: {
    padding: 10,
  },
  rightPane: {
    justifyContent: 'space-between',
    flex: 1,
  },
  recipeName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  recipeDetails: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  rating: {
    marginTop: 10,
  },
  ratingTitle: {
    fontSize: 14,
  },
  ratingValue: {
    fontSize: 28,
    fontWeight: '500',
  },
  mpaaWrapper: {
    alignSelf: 'flex-start',
    borderColor: 'black',
    borderWidth: 1,
    paddingHorizontal: 3,
    marginVertical: 5,
  },
  mpaaText: {
    fontFamily: 'Palatino',
    fontSize: 13,
    fontWeight: '500',
  },
  mainSection: {
    flexDirection: 'row',
  },
  detailsImage: {
    width: 134,
    height: 200,
    backgroundColor: '#eaeaea',
    marginRight: 10,
  },
  separator: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    height: StyleSheet.hairlineWidth,
    marginVertical: 10,
  },
  castTitle: {
    fontWeight: '500',
    marginBottom: 3,
  },
  castActor: {
    marginLeft: 2,
  },
});

module.exports = RecipeScreen;