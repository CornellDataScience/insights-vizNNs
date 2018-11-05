import numpy as np
import scipy.io.wavfile
import numpy as np
import matplotlib.pyplot as plt
from sklearn.manifold import TSNE
import parse_records as pr
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import scipy as sc
import pandas as pd

def make_transform(source_matrix, target_matrix):
    product = np.matmul(source_matrix.transpose(), target_matrix)
    U, s, V = np.linalg.svd(product)
    trans = np.matmul(U, V)
    return trans

def make_apply_transform(source_matrix, target_matrix):
    product = np.matmul(source_matrix.transpose(), target_matrix)
    U, s, V = np.linalg.svd(product)
    trans = np.matmul(U, V)
    #target_matrix_new = np.matmul(target_matrix, trans)
    source_new = np.matmul(source_matrix, trans)
    return source_new

def apply_transform(source_matrix, trans): 
    target_matrix_new = np.matmul(source_matrix, trans)
    return target_matrix_new

def find_centroid(df): 
    x = np.mean(df.iloc[:, 0])
    y = np.mean(df.iloc[:, 1])
    return np.array([x,y])

"""
   Given a list of points for a certain epoch, returns
   the list of centroids for each label in labels. 
   @param all_weights: all the 2d points for a certain
    epoch.
"""
def find_all_centroids(all_weights, labels):
    #etot_centroids = []
    dfi = pd.DataFrame(all_weights)
    dfi['labels'] = labels
    ei_centroids = []
    for name, group in dfi.groupby(dfi['labels']):
        cent = find_centroid(group)
        ei_centroids.append(cent)
    ei_centroids = np.array(ei_centroids)
   # etot_centroids.append(ei_centroids)
    #print(e1_centroids)
    return np.array(ei_centroids)

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

def avg_cos_sim(source, target):
    sims = np.array([sc.spatial.distance.cosine(source[i], target[i]) for i in range(len(source))])
   #print(sims)
    return np.average(sims)