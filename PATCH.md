# Project Patches

This file documents manual changes made to files in `node_modules`. These changes should ideally be persisted using `patch-package`.

## `react-native-theme-switch-animation`

### Delaying Unfreeze
- **File**: `node_modules/react-native-theme-switch-animation/src/index.tsx`
- **Change**: Replaced `setImmediate` with `setTimeout` in the `unfreezeWrapper` function to ensure the screen unfreezes correctly after the theme transition is captured.

```diff
-  setImmediate(() => {
+  setTimeout(() => {
     if (
       localAnimationConfig.type === 'circular' ||
       localAnimationConfig.type === 'inverted-circular'
```
