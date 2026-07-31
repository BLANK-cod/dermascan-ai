import os

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

import tensorflow as tf

print("TensorFlow:", tf.__version__)

model = tf.keras.models.load_model("models/unet.keras", compile=False)

print("✅ U-Net loaded successfully")
print(model.summary())