import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Easing, Animated } from 'react-native';
import { colors } from "../utils/color";
export default function BallIndicator(props) {
  props = {
    color: props.color != null ? props.color :  props.valueschange ? colors.pink: colors.Blue,
    count: props.color != null ? props.count : 8,
    size: props.size != null ? props.size : 40,
    visible: props.visible != null ? props.visible : false,
    animationEasing: props.animationEasing != null ? props.animationEasing : Easing.linear,
    animationDuration: props.animationDuration != null ? props.animationDuration : 1200,
    hideAnimationDuration: props.hideAnimationDuration != null ? props.hideAnimationDuration : 200,
    animating: props.animating != null ? props.animating : true,
    interaction: props.interaction != null ? props.interaction : true,
    hidesWhenStopped: props.hidesWhenStopped != null ? props.hidesWhenStopped : true,
  };
  const renderComponent = ({ index, count, progress }) => {
    let { size, color: backgroundColor } = props;
    let angle = index * 360 / count;
    let layerStyle = {
      transform: [{
        rotate: angle + 'deg',
      }],
    };
    let inputRange = Array
      .from(new Array(count + 1), (item, index) => (
        index / count
      ));
    let outputRange = Array
      .from(new Array(count), (item, index) => (
        1.2 - 0.5 * index / (count - 1)
      ));
    for (let j = 0; j < index; j++) {
      outputRange.unshift(outputRange.pop());
    }
    outputRange.unshift(...outputRange.slice(-1));
    let ballStyle = {
      margin: size / 6,
      backgroundColor,
      width: size / 5,
      height: size / 5,
      borderRadius: size / 10,
      transform: [{
        scale: progress
          .interpolate({ inputRange, outputRange }),
      }],
    };
    return (
      <Animated.View style={[styles.layer, layerStyle]} {...{ key: index }}>
        <Animated.View style={ballStyle} />
      </Animated.View>
    );
  }
  let { style, size: width, size: height } = props;
  return (

    <View style={props.visible ? [styles.container, style] : null}>
      {props.visible ? <Indicator
        style={{ width, height }}
        renderComponent={renderComponent}
        {...props}
      />
        : null}
    </View>


  );
}
export function Indicator(props) {
  props = {
    animationEasing: props.animationEasing,
    animationDuration: props.animationDuration,
    hideAnimationDuration: props.hideAnimationDuration,
    animating: props.animating,
    interaction: props.interaction,
    hidesWhenStopped: props.hidesWhenStopped,
    renderComponent: props.renderComponent,
    count: props.count,
  };
  var animationState = 0;
  const savedValue = 0;
  let { animating } = props;
  const progresss = new Animated.Value(0)
  const hideAnimations = new Animated.Value(animating ? 1 : 0)
  const prevProps = useRef();
  useEffect(() => {
    let { animating } = props;
    if (animating) {
      startAnimation();
    }
    if (animating && !prevProps.animating) {
      resumeAnimation();
    }

    if (!animating && prevProps.animating) {
      stopAnimation();
    }
    if (animating ^ prevProps.animating) {
      let hideAnimation = hideAnimations;
      let { hideAnimationDuration: duration } = props;
      Animated
        .timing(hideAnimation, { toValue: animating ? 1 : 0, duration, useNativeDriver: true, })
        .start();

    }
  }, [progresss]);
  const startAnimation = () => {
    let progress = progresss;
    let { interaction, animationEasing, animationDuration } = props;
    if (0 !== animationState) {
      return;
    }
    let animation = Animated
      .timing(progress, {
        duration: animationDuration,
        easing: animationEasing,
        useNativeDriver: true,
        isInteraction: interaction,
        toValue: 1,
      });
    Animated
      .loop(animation)
      .start();
    animationState = 1;
  }
  const stopAnimation = () => {
    let progress = progresss;
    if (1 !== animationState) {
      return;
    }
    let listener = progress
      .addListener(({ value }) => {
        progress.removeListener(listener);
        progress.stopAnimation(() => saveAnimation(value));
      });
    animationState = -1;
  }
  const saveAnimation = (value) => {
    let { animating } = props;
    savedValue = value;
    animationState = 0;
    if (animating) {
      resumeAnimation();
    }
  }
  const resumeAnimation = () => {
    let progress = progresss;
    let { interaction, animationDuration } = props;
    if (0 !== animationState) {
      return;
    }
    Animated
      .timing(progress, {
        useNativeDriver: true,
        isInteraction: interaction,
        duration: (1 - savedValue) * animationDuration,
        toValue: 1,
      })
      .start(({ finished }) => {
        if (finished) {
          progress.setValue(0);

          animationState = 0;
          startAnimation();
        }
      });
    savedValue = 0;
    animationState = 1;
  }
  const renderComponent = (item, index) => {
    let progress = progresss;
    let { renderComponent, count } = props;
    if ('function' === typeof renderComponent) {
      return renderComponent({ index, count, progress });
    }
    return null;
  }
  let hideAnimation = hideAnimations;
  let { count, hidesWhenStopped } = props;
  if (hidesWhenStopped) {
    props.style = []
      .concat(props.style || [], { opacity: hideAnimation });
  }
  return (
    <Animated.View {...props}>
      {Array.from(new Array(count), renderComponent)}
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
});
