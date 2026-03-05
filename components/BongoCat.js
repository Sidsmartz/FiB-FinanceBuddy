import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Path, Circle, Ellipse, Rect, G, Line, Polygon, Polyline } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);

export default function BongoCat({ size = 200 }) {
  const leftPawUpAnim = useRef(new Animated.Value(1)).current;
  const leftPawDownAnim = useRef(new Animated.Value(0)).current;
  const rightPawUpAnim = useRef(new Animated.Value(0)).current;
  const rightPawDownAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Left paw animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(leftPawUpAnim, {
          toValue: 0,
          duration: 10,
          useNativeDriver: true,
        }),
        Animated.timing(leftPawDownAnim, {
          toValue: 1,
          duration: 10,
          useNativeDriver: true,
        }),
        Animated.delay(190),
        Animated.timing(leftPawDownAnim, {
          toValue: 0,
          duration: 10,
          useNativeDriver: true,
        }),
        Animated.timing(leftPawUpAnim, {
          toValue: 1,
          duration: 10,
          useNativeDriver: true,
        }),
        Animated.delay(190),
      ])
    ).start();

    // Right paw animation (offset)
    Animated.loop(
      Animated.sequence([
        Animated.timing(rightPawDownAnim, {
          toValue: 0,
          duration: 10,
          useNativeDriver: true,
        }),
        Animated.timing(rightPawUpAnim, {
          toValue: 1,
          duration: 10,
          useNativeDriver: true,
        }),
        Animated.delay(190),
        Animated.timing(rightPawUpAnim, {
          toValue: 0,
          duration: 10,
          useNativeDriver: true,
        }),
        Animated.timing(rightPawDownAnim, {
          toValue: 1,
          duration: 10,
          useNativeDriver: true,
        }),
        Animated.delay(190),
      ])
    ).start();
  }, []);

  return (
    <Svg width={size} height={size * 0.9} viewBox="0 0 783.55 354.91">
      <G id="bongo-cat">
        {/* Table */}
        <G className="table">
          <Polygon
            points="25.3 158.5 783.2 293 513 354.9 25.3 158.5"
            fill="#0a0a0a"
            stroke="#4a9eff"
            strokeWidth="2"
          />
          <Line
            x1="25.3"
            y1="158.5"
            x2="783.2"
            y2="293"
            stroke="#4a9eff"
            strokeWidth="2"
          />
        </G>

        {/* Laptop Base */}
        <Polygon
          points="103.2 263.6 258.9 219.3 636.5 294.4 452.1 339 103.2 263.6"
          fill="#0a0a0a"
          stroke="#7eb8ff"
          strokeWidth="2"
        />

        {/* Laptop Cover */}
        <Polygon
          points="103.2 263.6 452.1 339 360.8 12.4 2 2 103.2 263.6"
          fill="#0a0a0a"
          stroke="#7eb8ff"
          strokeWidth="2"
        />

        {/* Terminal Frame */}
        <Polygon
          points="93.8 63.3 284.1 73 335.9 230.5 146.2 197.6 93.8 63.3"
          fill="none"
          stroke="#a8d0ff"
          strokeWidth="2"
        />

        {/* Head */}
        <G className="head">
          <Path
            d="M280.4,221l383.8,62.6a171.4,171.4,0,0,0-9.2-40.5,174,174,0,0,0-28.7-50.5,163.3,163.3,0,0,0,3.2-73.8c-11.6-1.9-42,14.2-44.5,17.5-19.6-24-88.5-52.7-153.7-48.1A78.8,78.8,0,0,0,398,67.1c-9.8,2.9-19,29.7-19.4,33.7a320,320,0,0,0-31.7,23.6c-14,11.8-28.9,24.4-42.5,44.3A173,173,0,0,0,280.4,221Z"
            fill="#ffffff"
            stroke="#e0e0e0"
            strokeWidth="2"
          />
          
          {/* Eyes */}
          <Path
            d="M396.6,178.6c.4.9,2.7,6.5,8.5,8.4s13.4-1.2,17.2-7.9c-.9,7.5,3.8,14.3,10.4,16a14.4,14.4,0,0,0,15-5.7"
            fill="none"
            stroke="#000000"
            strokeWidth="2"
          />
          <Path
            d="M474,179.2a6.6,6.6,0,0,0-4.9,3.6,6,6,0,0,0,1.5,7.3,6,6,0,0,0,7.9-1c2.3-2.6,2-7,.2-8s-5.9,1.6-5.7,3.5,1.9,2.8,3.2,2.3,1.1-2.2,1.1-2.3"
            fill="none"
            stroke="#000000"
            strokeWidth="2"
          />
          <Path
            d="M365.4,168.9c0,.3-.8,3.6,1.5,6a5.9,5.9,0,0,0,7.2,1.4,6.1,6.1,0,0,0,2.2-7.7c-1.5-3.1-5.7-4.5-7.3-3.2s-.8,6,1,6.6,3.3-.7,3.3-2.1-1.5-1.8-1.6-1.9"
            fill="none"
            stroke="#000000"
            strokeWidth="2"
          />
        </G>

        {/* Right Paw */}
        <G className="paw-right">
          <AnimatedG style={{ opacity: rightPawUpAnim }}>
            <Path
              d="M586.6,208.8c-.6-2.3-4.2-15.6-17.2-22.2-2.7-1.3-12.8-6.4-23.6-1.8s-14.6,16.5-14.8,18.4c-1.2,9-.7,18.4,2.4,26.1,2.4,6,7.5,17.2,9.7,20.2"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="2"
            />
            <Path d="M561.4,194.9a2.7,2.7,0,0,1,3,.5c.4,1-1.4,2.4-2.6,2.2a1.5,1.5,0,0,1-1.1-1.3A1.2,1.2,0,0,1,561.4,194.9Z" fill="#7eb8ff" stroke="#7eb8ff" strokeWidth="1" />
            <Path d="M550.7,200.4c.4-.5,1.1-1.1,1.7-.8a2,2,0,0,1,.8,2.2c-.3,1.2-1.8,2-2.5,1.5S550.1,201.3,550.7,200.4Z" fill="#7eb8ff" stroke="#7eb8ff" strokeWidth="1" />
            <Path d="M541.1,211.1c.5-.4,2.7-.4,3.2.5s-.6,1.8-1.5,1.9S540.4,211.6,541.1,211.1Z" fill="#7eb8ff" stroke="#7eb8ff" strokeWidth="1" />
            <Path d="M560.6,209.2c2.3-.9,6.4,6.3,7.6,9s-5.3,4.5-7.4,6-5.1-6-5.9-8.3S557.9,210.4,560.6,209.2Z" fill="#7eb8ff" stroke="#7eb8ff" strokeWidth="1" />
          </AnimatedG>
          <AnimatedG style={{ opacity: rightPawDownAnim }}>
            <Path
              d="M534.1,231.4c-19.7,6-32.9,18.4-34.2,29.1a30.1,30.1,0,0,0,1.7,14.1,24.8,24.8,0,0,0,6.1,8.8c6,5.1,16.8,4,38-3.9a288.7,288.7,0,0,0,46.5-22.1"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="2"
            />
          </AnimatedG>
        </G>

        {/* Left Paw */}
        <G className="paw-left">
          <AnimatedG style={{ opacity: leftPawDownAnim }}>
            <Path
              d="M289.1,181.7c-12.1,9.8-20.6,20.7-20.7,32.1-.2,9,3.8,20.4,13.3,25.2s20.1.6,29.6-3.4c13.4-5.7,23.9-14.6,29.4-21.5"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="2"
            />
          </AnimatedG>
          <AnimatedG style={{ opacity: leftPawUpAnim }}>
            <Path
              d="M327.3,170c-.4-1.4-6.3-18.8-23.5-23.5-.8-.2-18.6-4.7-28.9,6.3-8.4,9.1-6,22.5-4.6,30.2a54.3,54.3,0,0,0,8.1,19.9"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="2"
            />
            <Path d="M297.2,154.8c1-.5,2.7-.1,3,.6s-1.4,2.4-2.6,2.1a1.6,1.6,0,0,1-1.1-1.2A1.6,1.6,0,0,1,297.2,154.8Z" fill="#7eb8ff" stroke="#7eb8ff" strokeWidth="1" />
            <Path d="M285.8,159.4c.3-.4,1-1.1,1.7-.8s.9,1.4.8,2.2-1.8,2.1-2.5,1.5S285.2,160.4,285.8,159.4Z" fill="#7eb8ff" stroke="#7eb8ff" strokeWidth="1" />
            <Path d="M276.9,171c.5-.4,2.7-.3,3.2.6s-.6,1.8-1.4,1.8S276.2,171.6,276.9,171Z" fill="#7eb8ff" stroke="#7eb8ff" strokeWidth="1" />
            <Path d="M296.4,168.6c2.3-.9,6.4,6.3,7.6,9s-5.2,4.5-7.4,6-5.1-6.1-5.9-8.3S293.7,169.8,296.4,168.6Z" fill="#7eb8ff" stroke="#7eb8ff" strokeWidth="1" />
          </AnimatedG>
        </G>
      </G>
    </Svg>
  );
}
