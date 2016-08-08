var ReactDom = require('react-dom');
var objectAssign = require('object-assign');

var reserved = Object.getOwnPropertyNames(function () {});

function installPlugins(plugins, pluginInstances) {
	for (var i = 0, len = plugins.length; i < len; i += 1) {
		var Plugin = plugins[i];
		var plugName = Plugin.plugName || Plugin.name;
		if (pluginInstances[plugName]) { continue; }

		pluginInstances[plugName] = new Plugin(this);

		var dependencies = Plugin.dependencies;
		if (dependencies) {
			installPlugins.call(this, dependencies, pluginInstances);
		}
	}
}

function plug(plugins, reactComponentClass) {
	if (reactComponentClass.reactComponentClass) {
		plugins = reactComponentClass.plugins.concat(plugins);
		reactComponentClass = reactComponentClass.reactComponentClass;
	}

	function Plug(props, context) {
		reactComponentClass.call(this, props, context);

		var pluginInstances = {};
		installPlugins.call(this, plugins, pluginInstances);
		this.plugins = pluginInstances;

		if (this.pluginsLoaded) {
			this.pluginsLoaded();
		}
	};
	Plug.reactComponentClass = reactComponentClass;
	Plug.plugins = plugins;

	Plug.prototype = Object.create(reactComponentClass.prototype, {
		constructor: {
			value: reactComponentClass,
			enumerable: false,
			writable: true,
			configurable: true
		}
	});

	Plug.prototype.componentWillMount = function () {
		if (reactComponentClass.prototype.componentWillMount) {
			reactComponentClass.prototype.componentWillMount.call(this);
		}

		for (var pluginId in this.plugins) {
			var plugin = this.plugins[pluginId];
			if (plugin.componentWillMount) { plugin.componentWillMount(); }
		}
	};

	Plug.prototype.componentDidMount = function () {
		var DOMNode = ReactDom.findDOMNode(this);

		if (reactComponentClass.prototype.componentDidMount) {
			reactComponentClass.prototype.componentDidMount.call(this, DOMNode);
		}

		for (var pluginId in this.plugins) {
			var plugin = this.plugins[pluginId];
			if (plugin.componentDidMount) { plugin.componentDidMount(DOMNode); }
		}
	};

	Plug.prototype.componentWillReceiveProps = function (nextProps) {
		if (reactComponentClass.prototype.componentWillReceiveProps) {
			reactComponentClass.prototype.componentWillReceiveProps.call(this, nextProps);
		}

		for (var pluginId in this.plugins) {
			var plugin = this.plugins[pluginId];
			if (plugin.componentWillReceiveProps) { plugin.componentWillReceiveProps(nextProps); }
		}
	};

	Plug.prototype.componentWillUpdate = function (nextProps, nextState) {
		if (reactComponentClass.prototype.componentWillUpdate) {
			reactComponentClass.prototype.componentWillUpdate.call(this, nextProps, nextState);
		}

		for (var pluginId in this.plugins) {
			var plugin = this.plugins[pluginId];
			if (plugin.componentWillUpdate) { plugin.componentWillUpdate(nextProps, nextState); }
		}
	};

	Plug.prototype.componentDidUpdate = function () {
		if (reactComponentClass.prototype.componentDidUpdate) {
			reactComponentClass.prototype.componentDidUpdate.call(this);
		}

		for (var pluginId in this.plugins) {
			var plugin = this.plugins[pluginId];
			if (plugin.componentDidUpdate) { plugin.componentDidUpdate(); }
		}
	};

	Plug.prototype.componentWillUnmount = function () {
		if (reactComponentClass.prototype.componentWillUnmount) {
			reactComponentClass.prototype.componentWillUnmount.call(this);
		}

		for (var pluginId in this.plugins) {
			var plugin = this.plugins[pluginId];
			if (plugin.componentWillUnmount) { plugin.componentWillUnmount(); }
		}
	};

	Object.getOwnPropertyNames(reactComponentClass).forEach(function (name) {
		if (reserved.indexOf(name) === -1 && typeof reactComponentClass[name] === 'function') {
			Plug[name] = reactComponentClass[name];
		}
	})

	Object.keys(reactComponentClass).forEach(function (name) {
		Plug[name] = reactComponentClass[name];
	})

	return Plug;
}

module.exports = plug;
