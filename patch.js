const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'node_modules', 'react-native-css-interop', 'babel.js');

try {
  if (fs.existsSync(targetPath)) {
    let content = fs.readFileSync(targetPath, 'utf8');
    // Remove the hardcoded worklets plugin which crashes RN 0.76+
    content = content.replace(/"react-native-worklets\/plugin",?/g, '');
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log('Successfully patched react-native-css-interop/babel.js');
  } else {
    console.log('Target babel.js not found, skipping patch.');
  }
} catch (e) {
  console.error('Failed to patch react-native-css-interop:', e);
}
