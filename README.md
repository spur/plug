# plug
Plugin system for React components.

It allows you to add plugins to React components the same way as mixins do.


## API
### plug
`plug(plugins, reactComponentClass)`
Plug some plugins to the specified react class

**Arguments**
- `plugins` (*array*): An of the plugin classes you wish to use.
- `reactComponentClass` (*function*): A React class.

**Returns**
A new react class which will hook the lifecycle events to the plugins and the original class.

**Usage**
```javascript
var MyPlugin = require('my-plugin');

var MyReactClass = React.createClass({ ... });

module.exports = plug([MyPlugin], MyReactClass);
```

```javascript
import MyPlugin from 'my-plugin';

class MyReactClass extends React.Component { ... }

export default plug([MyPlugin], MyReactClass);
```



### plugins
A plugin is just a simple javascript class. You are not required to provide any particular methods. If you want to access one of the
React component lifecycle hook, you just need to create the appropriate method on your class prototype:
```javascript
function MyPlugin() {}
Myplugin.prototype.componentWillMount = function () { ... };

class MyPlugin {
	componentWillMount () { ... }
}
```


You will get an instance of the plugin for each instance of the React class it is plugged to. The instance of the React class is
passed to your plugin constructor.
```javascript
function MyPlugin(component) { ... }

class MyPlugin {
	constructor(component) { ... }
}
```


As this system was first written for UI purposes, the DOM node of the instantiated React class is given to the `componentDidMount` hook.
```javascript
MyPlugin.prototype.componentDidMount = function (DOMNode) { ... }

class MyPlugin {
	componentDidMount(DOMNode) { ... }
}
```


Example of plugins can be find on the Spur organisation repositories:
- https://github.com/spur/style-plugin
- https://github.com/spur/button-plugin
- https://github.com/spur/transform-plugin
- ...


### The 'plugged' React class
The plugins are accessible in your class through the `plugins` property. They are mapped to the static property `plugName` defined by each plugin.
```javascript
function MyPlugin() { ... }
MyPlugin.plugName = 'my';

var MyReactClass = React.createClass({
	componentWillMount: function () {
		this.plugins.my.doSomething();
	}
});
plug([MyPlugin], MyReactClass);
```

```javascript
class MyPlugin { ... }
MyPlugin.plugName = 'my'; // or class MyPlugin { static plugName = 'my'; }

class MyReactClass extends React.Component {
	componentWillMount() {
		this.plugins.myPluginKey.doSomething();
	}
}
plug([MyPlugin], MyReactClass);
```

The `plugins` property is not accessible in the React class constructor. There is a special hook you can use to access it right after the class instantiation: `pluginsLoaded`
```javascript
var MyReactClass = React.createClass({
	pluginsLoaded: function () {
		this.plugins.myPluginName.doSomething();
	}
});


class MyReactClass extends React.Component {
	pluginsLoaded() {
		this.plugins.myPluginName.doSomething();
	}
}
```
The `plugins` property is available in every lifecycle hooks.


As a bonus, the React lifecycle 'componentDidMount' hook also get the component instance DOM node as parameter.
```javascript
class MyReactClass extends React.Component {
	componentDidMount(DOMNode) { ... }
}
```


## Plugins dependency
A plugin can define static property `dependencies` to request another plugin to be plugged to the base class.

```javascript
function MyOtherPlugin { ... }

function MyPlugin { ... }
MyPlugin.dependencies = [MyOtherPlugin];
```

```javascript
class MyOtherPlugin { ... }

class MyPlugin { ... }
MyPlugin.dependencies = [MyOtherPlugin];
```


## Full Example
### ES5
```javascript
var plug = require('spur-plug');
var React = require('react');

function MyPlugin(component) {
	// component here is the instance of 'MyReactClass' that this pluging is plugged to.
	this.component = component;
}

MyPlugin.plugName = 'my';

MyPlugin.prototype.doSomething = function () {
	this.component.setState({ didSomething: true });
};

MyPlugin.prototype.componentDidMount = function (DOMNode) {
	// here is the DOMNode of my component, yay
};


var MyReactClass = React.createClass({
	pluginsLoaded: function () {
		// this.plugins is accessible
	},

	componentDidMount: function (DOMNode) {
		this.plugins.my.doSomething();
	}
});

module.exports = plug([MyPlugin], MyReactClass);
```


### ES6
```javascript
import plug from 'spur-plug';
import React from 'react';

class MyPlugin {
	constructor(component) {
		// component here is the instance of 'MyReactClass' that this pluging is plugged to.
		this.component = component;
	}

	doSomething() {
		this.component.setState({ didSomething: true });
	}

	componentDidMount(DOMNode) {
		// here is the DOMNode of my component, yay
	}
}

MyPlugin.plugName = 'my';


class MyReactClass extends React.Component {
	constructor(props, context) {
		super(props, context);
		// 'this.plugins' is not yet created at this moment. Use the 'pluginsLoaded' hook instead.
	}

	pluginsLoaded () {
		// this.plugins is created
	}

	componentDidMount (DOMNode) {
		this.plugins.my.doSomething();
	}
}

export default plug([MyPlugin], MyReactClass);
```