#include "CustomSliderJSI.h"
#include <jsi/jsi.h>
#include <ReactCommon/CallInvokerHolder.h>
#include <android/log.h>

#define LOG_TAG "CustomSliderJSI"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)

using namespace facebook;

CustomSliderJSI::CustomSliderJSI() {
  LOGI("CustomSliderJSI constructor");
}

CustomSliderJSI::~CustomSliderJSI() {
  LOGI("CustomSliderJSI destructor");
}

void CustomSliderJSI::install(jsi::Runtime &runtime) {
  auto customSliderModule = std::make_shared<CustomSliderJSI>();
  auto object = jsi::Object::createFromHostObject(runtime, customSliderModule);
  runtime.global().setProperty(runtime, "CustomSliderJSI", std::move(object));
  LOGI("CustomSliderJSI installed");
}

jsi::Value CustomSliderJSI::get(jsi::Runtime &runtime, const jsi::PropNameID &name) {
  auto propName = name.utf8(runtime);
  
  if (propName == "createSlider") {
    return jsi::Function::createFromHostFunction(
      runtime,
      jsi::PropNameID::forAscii(runtime, "createSlider"),
      0,
      [](jsi::Runtime &rt, const jsi::Value *args, size_t count) -> jsi::Value {
        return createSlider(rt, args, count);
      }
    );
  }
  
  if (propName == "updateSlider") {
    return jsi::Function::createFromHostFunction(
      runtime,
      jsi::PropNameID::forAscii(runtime, "updateSlider"),
      0,
      [](jsi::Runtime &rt, const jsi::Value *args, size_t count) -> jsi::Value {
        return updateSlider(rt, args, count);
      }
    );
  }
  
  return jsi::Value::undefined();
}

std::vector<jsi::PropNameID> CustomSliderJSI::getPropertyNames(jsi::Runtime &runtime) {
  std::vector<jsi::PropNameID> result;
  result.push_back(jsi::PropNameID::forAscii(runtime, "createSlider"));
  result.push_back(jsi::PropNameID::forAscii(runtime, "updateSlider"));
  return result;
}

jsi::Value CustomSliderJSI::createSlider(jsi::Runtime &runtime, const jsi::Value *args, size_t count) {
  LOGI("createSlider called");
  // This is a placeholder - actual implementation will be in the ViewManager
  return jsi::Value::undefined();
}

jsi::Value CustomSliderJSI::updateSlider(jsi::Runtime &runtime, const jsi::Value *args, size_t count) {
  LOGI("updateSlider called");
  // This is a placeholder - actual implementation will be in the ViewManager
  return jsi::Value::undefined();
}

