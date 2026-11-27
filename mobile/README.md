# Zelthia mobile (`coming soon`)

Native mobile clients for Android (Kotlin and Jetpack Compose) and iOS (Swift and SwiftUI), paired with the on-device "Hey Darling" wake-word and care companion, are in active development and previewed at `/coming-soon` on the web app.

## Platforms

- Android ([`mobile/kotlin/`](./kotlin)) uses application ID `com.zelthia.app`, Kotlin, Jetpack Compose, Material 3, and AndroidX Navigation 3 (`minSdk = 24`, `compileSdk = 37`, Java 17 toolchain):
  ```bash
  cd mobile/kotlin
  ./gradlew assembleDebug testDebugUnitTest
  ```
- iOS ([`mobile/swift/`](./swift)) holds the directory reserved for the native Swift and SwiftUI client.

## On-device wake-word and audio models (`mobile/assets/`)

All trained audio preprocessing and wake-word model files live under [`mobile/assets/`](./assets):

| Asset                                                                                 | Format           | Purpose                                        |
| ------------------------------------------------------------------------------------- | ---------------- | ---------------------------------------------- |
| [`embedding_model.onnx`](./assets/embedding_model.onnx)                               | ONNX             | Speech embedding encoder                       |
| [`embedding_model.tflite`](./assets/embedding_model.tflite)                           | TFLite           | Speech embedding encoder (mobile)              |
| [`melspectrogram.onnx`](./assets/melspectrogram.onnx)                                 | ONNX             | Audio mel-spectrogram preprocessor             |
| [`melspectrogram.tflite`](./assets/melspectrogram.tflite)                             | TFLite           | Audio mel-spectrogram preprocessor (mobile)    |
| [`hey_darling.onnx`](./assets/hey_darling.onnx)                                       | ONNX             | `"Hey Darling"` wake-word classifier           |
| [`hey_darling.onnx.data`](./assets/hey_darling.onnx.data)                             | ONNX weights     | External weights for `hey_darling.onnx`        |
| [`hey_darling.tflite`](./assets/hey_darling.tflite)                                   | TFLite           | Default mobile `"Hey Darling"` wake-word model |
| [`hey_darling_float16.tflite`](./assets/hey_darling_float16.tflite)                   | TFLite FP16      | Quantized float16 `"Hey Darling"` model        |
| [`hey_darling_float32.tflite`](./assets/hey_darling_float32.tflite)                   | TFLite FP32      | Full-precision float32 `"Hey Darling"` model   |
| [`automatic_model_training(1).ipynb`](./assets/automatic_model_training%281%29.ipynb) | Jupyter Notebook | Wake-word training notebook                    |
