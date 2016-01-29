var ReactDom = require('react-dom');

function plug(plugins, reactComponentClass) {

  function Plug(props, context) {
    reactComponentClass.call(this, props, context);
    var pluginInstances = {};

    for (var pluginId in plugins) {
      pluginInstances[pluginId] = new plugins[pluginId](this);
    }

    this.plugins = pluginInstances;

    if (this.pluginsLoaded) {
      this.pluginsLoaded();
    }
  };

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
    if (reactComponentClass.prototype.componentDidMount) {
      reactComponentClass.prototype.componentDidMount.call(this);
    }

    var DOMNode = ReactDom.findDOMNode(this);
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

  for (var staticPropertyKey in reactComponentClass) {
    if (reactComponentClass.hasOwnProperty(staticPropertyKey)) {
      Plug[staticPropertyKey] = reactComponentClass[staticPropertyKey];
    }
  }

  return Plug;
}

module.exports = plug;
