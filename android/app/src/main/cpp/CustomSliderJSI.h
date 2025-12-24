#pragma once

#include <jsi/jsi.h>
#include <ReactCommon/CallInvokerHolder.h>
#include <memory>

using namespace facebook;

class CustomSliderJSI : public jsi::HostObject {
public:
  CustomSliderJSI();
  ~CustomSliderJSI();

  static void install(jsi::Runtime &runtime);

  jsi::Value get(jsi::Runtime &runtime, const jsi::PropNameID &name) override;
  std::vector<jsi::PropNameID> getPropertyNames(jsi::Runtime &runtime) override;

private:
  static jsi::Value createSlider(jsi::Runtime &runtime, const jsi::Value *args, size_t count);
  static jsi::Value updateSlider(jsi::Runtime &runtime, const jsi::Value *args, size_t count);
};

