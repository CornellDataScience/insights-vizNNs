import numpy as np
import scipy.io.wavfile
import numpy as np
import matplotlib.pyplot as plt
from sklearn.manifold import TSNE
import parse_records as pr
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import scipy as sc

import tensorflow as tf
tf.logging.set_verbosity(tf.logging.ERROR)
mnist = tf.contrib.learn.datasets.load_dataset("mnist")


def plot_with_labels(lowDWeights, labels, filename='tsne.png'):
    assert lowDWeights.shape[0] >= len(labels), "More labels than weights"
    plt.figure(figsize=(10, 10))  # in inches
    for i, label in enumerate(labels):
        x, y = lowDWeights[i, :]
        plt.scatter(x, y)
        plt.annotate(label,
                     xy=(x, y),
                     xytext=(5, 2),
                     textcoords='offset points',
                     ha='right',
                     va='bottom'
                     )

    plt.savefig(filename)
