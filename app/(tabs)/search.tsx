// export { default } from './search.web';

// app/(tabs)/search.tsx
// 기본 엔트리, 각 플랫폼별 파일을 불러옵니다
import { Platform } from 'react-native';

let Search: React.ComponentType<any>;

if (Platform.OS === 'web') {
  Search = require('./search.web').default;
} else {
  Search = require('./search.native').default;
}

export default Search;
