const React = require('react');
const { View } = require('react-native');

function identity() {
  return this;
}

function createGestureProxy() {
  const proxyTarget = {};
  return new Proxy(proxyTarget, {
    get(target, prop) {
      if (prop === 'then') return undefined;
      if (prop in target) {
        return target[prop];
      }
      if (typeof prop === 'string' && prop.startsWith('on')) {
        return identity;
      }
      return () => createGestureProxy();
    },
  });
}

const Gesture = new Proxy({}, {
  get(target, prop) {
    if (prop === 'Pan' || prop === 'Tap' || prop === 'LongPress' || prop === 'Fling' || prop === 'ForceTouch' || prop === 'Native' || prop === 'Manual' || prop === 'Pinch' || prop === 'Rotation') {
      return () => createGestureProxy();
    }
    return target[prop];
  },
});

function noopComponent(props) {
  return React.createElement(View, props, props?.children);
}

const exported = {
  GestureHandlerRootView: noopComponent,
  GestureDetector: noopComponent,
  Gesture,
  State: {},
  Directions: {},
  PointerType: {},
  PanGestureHandler: noopComponent,
  TapGestureHandler: noopComponent,
  LongPressGestureHandler: noopComponent,
  FlingGestureHandler: noopComponent,
  ForceTouchGestureHandler: noopComponent,
  NativeViewGestureHandler: noopComponent,
  RectButton: noopComponent,
  BorderlessButton: noopComponent,
  DrawerLayout: noopComponent,
  Swipeable: noopComponent,
  createNativeWrapper: (Component) => Component,
  gestureHandlerRootHOC: (Component) => Component,
};

module.exports = exported;
module.exports.default = exported;
