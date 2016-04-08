/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */

import React, {
  AppRegistry,
  NavigatorIOS,
  Component,
  StyleSheet,
  Text,
  View
} from 'react-native';

var SearchScreen = require('./SearchScreen');

var nutrio = React.createClass({
  render: function() {
    return (
      <NavigatorIOS
        style={styles.container}
        initialRoute={{
          title: 'Recipes',
          component: SearchScreen,
        }}
      />
    );
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
});

AppRegistry.registerComponent('nutrio', () => nutrio);


module.exports = nutrio;
