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

**Patch File**: `patches/react-native-theme-switch-animation+0.8.0.patch`

# diff --git a/node_modules/react-native/sdks/hermes-engine/version.properties b/node_modules/react-native/sdks/hermes-engine/version.properties
# new file mode 100644
# index 0000000..e0fc671
# --- /dev/null
# +++ b/node_modules/react-native/sdks/hermes-engine/version.properties
# @@ -0,0 +1,2 @@
# +HERMES_VERSION_NAME=0.81.4
# +HERMES_V1_VERSION_NAME=0.81.4
