import numpy as np
import scipy.io.wavfile
import numpy as np
import matplotlib.pyplot as plt
from sklearn.manifold import TSNE
import parse_records as pr
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import scipy as sc


def make_transform(source_matrix, target_matrix):
    product = np.matmul(source_matrix.transpose(), target_matrix)
    U, s, V = np.linalg.svd(product)
    trans = np.matmul(U, V)
    #target_matrix_new = np.matmul(target_matrix, trans)
    target_matrix_new = np.matmul(source_matrix, trans)
    return target_matrix_new


def plot_with_labels(matrix, labels, filename=""):
    x = matrix[:, 0].tolist()
    y = matrix[:, 1].tolist()
    #labels = mnist.test.labels[:100]
    plt.figure(figsize=(5, 5))  # in inches
    for i, label in enumerate(labels):
        plt.scatter(x, y)
        plt.annotate(label,
                     xy=(x[i], y[i]),
                     xytext=(5, 2),
                     textcoords='offset points',
                     ha='right',
                     va='bottom')
        if(len(filename) > 0):
            plt.savefig(filename)
