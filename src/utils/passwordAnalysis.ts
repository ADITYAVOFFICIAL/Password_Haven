
import zxcvbn from 'zxcvbn';

export type PasswordPattern = {
  type: string;
  token: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
}

export type PasswordAnalysisResult = {
  score: number; // 0-4
  guessesLog10: number;
  crackTimesSeconds: {
    onlineThrottling100PerHour: number;
    onlineNoThrottling10PerSecond: number;
    offlineSlowHashing1e4PerSecond: number;
    offlineFastHashing1e10PerSecond: number;
  };
  crackTimesDisplay: {
    onlineThrottling100PerHour: string;
    onlineNoThrottling10PerSecond: string;
    offlineSlowHashing1e4PerSecond: string;
    offlineFastHashing1e10PerSecond: string;
  };
  feedback: {
    warning: string | null;
    suggestions: string[];
  };
  calcTime: number;
  patterns: PasswordPattern[];
  timeEstimateBruteForce: string;
  timeEstimateSmartGuessing: string;
  hardwareEstimates: {
    cpu: string;
    normalGpu: string;
    highEndGpu: string;
  };
  hasCommonPattern: boolean;
  hasSequentialChars: boolean;
  hasKeyboardPattern: boolean;
  hasDictionaryWord: boolean;
  hasRepeatedChars: boolean;
}

/**
 * Formats time to crack to a human-readable form with exact time when possible
 */
export function formatTimeToExact(seconds: number): string {
  if (seconds === Infinity) return "Billions of years";
  
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30;
  const year = day * 365;
  
  if (seconds < minute) {
    return seconds < 1 ? "less than a second" : `${Math.round(seconds)} seconds`;
  } else if (seconds < hour) {
    const minutes = Math.round(seconds / minute);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  } else if (seconds < day) {
    const hours = Math.round(seconds / hour);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  } else if (seconds < month) {
    const days = Math.round(seconds / day);
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  } else if (seconds < year) {
    const months = Math.round(seconds / month);
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  } else {
    const years = Math.round(seconds / year);
    if (years > 1000) {
      return `${Math.round(years / 1000)} thousand years`;
    } else if (years > 1000000) {
      return `${Math.round(years / 1000000)} million years`;
    } else if (years > 1000000000) {
      return `${Math.round(years / 1000000000)} billion years`;
    }
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  }
}

/**
 * Calculate hardware-specific time estimates
 */
export function calculateHardwareEstimates(guesses: number): { cpu: string; normalGpu: string; highEndGpu: string } {
  // Hash rates (bcrypt with cost factor 12)
  const CPU_HASH_RATE = 50; // hashes per second
  const NORMAL_GPU_HASH_RATE = 2000; // hashes per second
  const HIGH_END_GPU_HASH_RATE = 8000; // hashes per second

  const cpuTimeSeconds = guesses / CPU_HASH_RATE;
  const normalGpuTimeSeconds = guesses / NORMAL_GPU_HASH_RATE;
  const highEndGpuTimeSeconds = guesses / HIGH_END_GPU_HASH_RATE;

  return {
    cpu: formatTimeToExact(cpuTimeSeconds),
    normalGpu: formatTimeToExact(normalGpuTimeSeconds),
    highEndGpu: formatTimeToExact(highEndGpuTimeSeconds),
  };
}

/**
 * Analyzes a password using zxcvbn library with additional metrics
 */
export function analyzePasswordAdvanced(password: string, userInputs: string[] = []): PasswordAnalysisResult {
  // Default values for empty password
  if (!password) {
    return {
      score: 0,
      guessesLog10: 0,
      crackTimesSeconds: {
        onlineThrottling100PerHour: 0,
        onlineNoThrottling10PerSecond: 0,
        offlineSlowHashing1e4PerSecond: 0,
        offlineFastHashing1e10PerSecond: 0
      },
      crackTimesDisplay: {
        onlineThrottling100PerHour: "less than a second",
        onlineNoThrottling10PerSecond: "less than a second",
        offlineSlowHashing1e4PerSecond: "less than a second",
        offlineFastHashing1e10PerSecond: "less than a second"
      },
      feedback: {
        warning: null,
        suggestions: ["Enter a password to see analysis"]
      },
      calcTime: 0,
      patterns: [],
      timeEstimateBruteForce: "less than a second",
      timeEstimateSmartGuessing: "less than a second",
      hardwareEstimates: {
        cpu: "less than a second",
        normalGpu: "less than a second",
        highEndGpu: "less than a second"
      },
      hasCommonPattern: false,
      hasSequentialChars: false,
      hasKeyboardPattern: false,
      hasDictionaryWord: false,
      hasRepeatedChars: false
    };
  }

  // Run zxcvbn analysis
  const result = zxcvbn(password, userInputs);
  
  // Extract patterns and detect specific weaknesses
  const patterns: PasswordPattern[] = [];
  let hasCommonPattern = false;
  let hasSequentialChars = false;
  let hasKeyboardPattern = false;
  let hasDictionaryWord = false;
  let hasRepeatedChars = false;
  
  // Process sequence matches from zxcvbn
  result.sequence.forEach((match: any) => {
    let patternType = match.pattern || 'unknown';
    let severity: 'critical' | 'warning' | 'info' = 'info';
    let description = '';
    
    switch (patternType) {
      case 'dictionary':
        hasDictionaryWord = true;
        severity = match.rank < 10000 ? 'critical' : 'warning';
        description = `Common ${match.dictionary_name} word`;
        break;
      case 'sequence':
        hasSequentialChars = true;
        severity = 'warning';
        description = 'Sequential characters';
        break;
      case 'repeat':
        hasRepeatedChars = true;
        severity = 'warning';
        description = 'Repeated characters';
        break;
      case 'spatial':
        hasKeyboardPattern = true;
        severity = 'warning';
        description = 'Keyboard pattern';
        break;
      case 'date':
        severity = 'warning';
        description = 'Date pattern';
        break;
      case 'bruteforce':
        severity = 'info';
        description = 'Complex section';
        break;
    }
    
    if (['dictionary', 'sequence', 'repeat', 'spatial', 'date'].includes(patternType)) {
      hasCommonPattern = true;
    }
    
    patterns.push({
      type: patternType,
      token: match.token || '',
      description,
      severity
    });
  });
  
  // Enhanced time estimates
  const bruteForceSeconds = result.crack_times_seconds.offline_slow_hashing_1e4_per_second;
  const smartGuessingSeconds = result.crack_times_seconds.offline_fast_hashing_1e10_per_second;
  
  // Calculate hardware-specific estimates
  const hardwareEstimates = calculateHardwareEstimates(result.guesses);
  
  return {
    score: result.score,
    guessesLog10: result.guesses_log10,
    crackTimesSeconds: {
      onlineThrottling100PerHour: result.crack_times_seconds.online_throttling_100_per_hour,
      onlineNoThrottling10PerSecond: result.crack_times_seconds.online_no_throttling_10_per_second,
      offlineSlowHashing1e4PerSecond: result.crack_times_seconds.offline_slow_hashing_1e4_per_second,
      offlineFastHashing1e10PerSecond: result.crack_times_seconds.offline_fast_hashing_1e10_per_second
    },
    crackTimesDisplay: {
      onlineThrottling100PerHour: result.crack_times_display.online_throttling_100_per_hour,
      onlineNoThrottling10PerSecond: result.crack_times_display.online_no_throttling_10_per_second,
      offlineSlowHashing1e4PerSecond: result.crack_times_display.offline_slow_hashing_1e4_per_second,
      offlineFastHashing1e10PerSecond: result.crack_times_display.offline_fast_hashing_1e10_per_second
    },
    feedback: {
      warning: result.feedback.warning || null,
      suggestions: result.feedback.suggestions || []
    },
    calcTime: result.calc_time,
    patterns,
    timeEstimateBruteForce: formatTimeToExact(bruteForceSeconds),
    timeEstimateSmartGuessing: formatTimeToExact(smartGuessingSeconds),
    hardwareEstimates,
    hasCommonPattern,
    hasSequentialChars,
    hasKeyboardPattern,
    hasDictionaryWord,
    hasRepeatedChars
  };
}
