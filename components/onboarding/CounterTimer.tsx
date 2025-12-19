import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';

export interface CounterTimerProps {
  targetNumber: number;
  durationSec: number;
  onComplete?: () => void;
  format?: (value: number) => string;
  easing?: 'linear' | 'easeInOut' | 'easeOut';
}

type TimerState = 'idle' | 'running' | 'paused' | 'completed';

// Create animated text component
const AnimatedText = Animated.createAnimatedComponent(Text);

export const CounterTimer: React.FC<CounterTimerProps> = ({
  targetNumber,
  durationSec,
  onComplete,
  format = (val) => Math.round(val).toString(),
  easing = 'linear',
}) => {
  const [state, setState] = useState<TimerState>('idle');
  const progress = useSharedValue(0);
  const [displayValue, setDisplayValue] = useState('0');

  // Validate inputs
  const validTarget = Math.max(0, targetNumber || 0);
  const validDuration = Math.max(0.1, Math.min(3600, durationSec || 1)); // Min 0.1s, max 1 hour

  const easingFunctions = {
    linear: Easing.linear,
    easeInOut: Easing.inOut(Easing.ease),
    easeOut: Easing.out(Easing.ease),
  };

  useEffect(() => {
    // Update display value based on progress
    const interval = setInterval(() => {
      const currentValue = progress.value * validTarget;
      setDisplayValue(format(currentValue));
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [validTarget, format]);

  const handleStart = () => {
    if (state === 'idle' || state === 'completed') {
      setState('running');
      progress.value = 0;
      
      progress.value = withTiming(
        1,
        {
          duration: validDuration * 1000,
          easing: easingFunctions[easing],
        },
        (finished) => {
          'worklet';
          if (finished) {
            runOnJS(setState)('completed');
            if (onComplete) {
              runOnJS(onComplete)();
            }
          }
        }
      );
    } else if (state === 'paused') {
      setState('running');
      const remainingProgress = 1 - progress.value;
      const remainingDuration = validDuration * 1000 * remainingProgress;
      
      progress.value = withTiming(
        1,
        {
          duration: remainingDuration,
          easing: easingFunctions[easing],
        },
        (finished) => {
          'worklet';
          if (finished) {
            runOnJS(setState)('completed');
            if (onComplete) {
              runOnJS(onComplete)();
            }
          }
        }
      );
    }
  };

  const handleStop = () => {
    if (state === 'running') {
      setState('paused');
      cancelAnimation(progress);
    }
  };

  const handleReset = () => {
    setState('idle');
    cancelAnimation(progress);
    progress.value = 0;
    setDisplayValue('0');
  };

  const handleRestart = () => {
    cancelAnimation(progress);
    setState('running');
    progress.value = 0;
    
    progress.value = withTiming(
      1,
      {
        duration: validDuration * 1000,
        easing: easingFunctions[easing],
      },
      (finished) => {
        'worklet';
        if (finished) {
          runOnJS(setState)('completed');
          if (onComplete) {
            runOnJS(onComplete)();
          }
        }
      }
    );
  };

  const getStateColor = () => {
    switch (state) {
      case 'running':
        return '#4CAF50';
      case 'paused':
        return '#FF9800';
      case 'completed':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderLeftColor: getStateColor() }]}>
        <Text style={styles.title}>Counter Timer</Text>
        <Text style={styles.stateText}>{state.toUpperCase()}</Text>
      </View>

      <View style={styles.displayContainer}>
        <Text style={styles.displayValue}>{displayValue}</Text>
        <Text style={styles.targetText}>of {format(validTarget)}</Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { 
              width: `${(progress.value || 0) * 100}%`,
              backgroundColor: getStateColor()
            }
          ]} 
        />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, styles.startButton, state === 'running' && styles.disabledButton]}
          onPress={handleStart}
          disabled={state === 'running'}
          accessibilityLabel="Start timer"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>
            {state === 'paused' ? 'Resume' : 'Start'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.stopButton, state !== 'running' && styles.disabledButton]}
          onPress={handleStop}
          disabled={state !== 'running'}
          accessibilityLabel="Stop timer"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={handleReset}
          accessibilityLabel="Reset timer"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.restartButton]}
          onPress={handleRestart}
          accessibilityLabel="Restart timer"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Restart</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>
          Target: {validTarget} | Duration: {validDuration}s | Easing: {easing}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingLeft: 12,
    borderLeftWidth: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  stateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
  },
  displayContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  displayValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#212121',
  },
  targetText: {
    fontSize: 16,
    color: '#757575',
    marginTop: 4,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 16,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48, // Accessibility touch target
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  resetButton: {
    backgroundColor: '#9E9E9E',
  },
  restartButton: {
    backgroundColor: '#2196F3',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  info: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#616161',
    textAlign: 'center',
  },
});



