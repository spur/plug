import ReactDom from 'react-dom';

function plug(plugins, reactComponentClass) {
  
  function Plug(props, context) {
    reactComponentClass.call(this, props, context);
    let pluginInstances = {};

    for (let pluginId in plugins) {
      pluginInstances[pluginId] = new plugins[pluginId](this);
    }

    this.plugins = pluginInstances;
  };

  Plug.prototype = Object.create(reactComponentClass.prototype, {
    constructor: {
      value: reactComponentClass.name + 'Plug',
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  Plug.prototype.componentDidMount = function () {
    if (reactComponentClass.prototype.componentDidMount) {
      reactComponentClass.prototype.componentDidMount.call(this);
    }

    let DOMNode = ReactDom.findDOMNode(this);
    for (let pluginId in this.plugins) {
      let plugin = this.plugins[pluginId];
      if (plugin.componentDidMount) { plugin.componentDidMount(DOMNode); }
    }
  };

  Plug.prototype.componentWillMount = function () {
    if (reactComponentClass.prototype.componentWillMount) {
      reactComponentClass.prototype.componentWillMount.call(this);
    }

    for (let pluginId in this.plugins) {
      let plugin = this.plugins[pluginId];
      if (plugin.componentWillMount) { plugin.componentWillMount(); }
    }
  };

  Plug.prototype.componentWillUnmount = function () {
    if (reactComponentClass.prototype.componentWillUnmount) {
      reactComponentClass.prototype.componentWillUnmount.call(this);
    }

    for (let pluginId in this.plugins) {
      let plugin = this.plugins[pluginId];
      if (plugin.componentWillUnmount) { plugin.componentWillUnmount(); }
    }
  };

  for (var staticPropertyKey in reactComponentClass) {
    Plug[staticPropertyKey] = reactComponentClass[staticPropertyKey];
  }

  return Plug;
}

export default plug;
