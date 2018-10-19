import tensorflow as tf
import scipy.io.wavfile
import numpy as np
import matplotlib.pyplot as plt
from sklearn.manifold import TSNE
import csv


# In[2]:


import warnings
warnings.filterwarnings('ignore')
mnist = tf.contrib.learn.datasets.load_dataset("mnist")


# In[3]:


sess = tf.Session()


# In[4]:


# initialize weights to random variables
def weight_variable(shape):
    initial = tf.truncated_normal(shape, stddev=0.1)
    return tf.Variable(initial)


def bias_variable(shape):
    initial = tf.constant(0.1, shape=shape)
    return tf.Variable(initial)


"""
x = input tensor [batch, in_height, in_width, in_channels]
W = filter [filter_height, filter_width, in_channels, out_channels]
    out_channels = number of filters
lower level than tf.layers.conv2d, which encompasses all filters in one"""


def conv2d(x, W):
    return tf.nn.conv2d(x, W, strides=[1, 1, 1, 1], padding='SAME')


def max_pool_2x2(x):
    return tf.nn.max_pool(x, ksize=[1, 2, 2, 1], strides=[1, 2, 2, 1], padding='SAME')


# In[ ]:


# 784 = size of one input image
# None = varying batch size
x = tf.placeholder(tf.float32, [None, 784], name='x')
# Something wrong with this placeholder, not feeding in correct sizes.
y_ = tf.placeholder(tf.float32, [None, 10])


x_image = tf.reshape(x, [-1, 28, 28, 1])

# layer 1 setup: conv + relu + max pool
W_conv1 = weight_variable([5, 5, 1, 32])
b_conv1 = bias_variable([32])

h_conv1 = tf.nn.relu(conv2d(x_image, W_conv1) + b_conv1)
h_pool1 = max_pool_2x2(h_conv1)

# layer 2 setup: conv + relu + max pool
W_conv2 = weight_variable([5, 5, 32, 64])
b_conv2 = bias_variable([64])

h_conv2 = tf.nn.relu(conv2d(h_pool1, W_conv2) + b_conv2)
h_pool2 = max_pool_2x2(h_conv2)

# layer 3 setup: fully connected
# TO DO: Try decreasing FC layer
W_fc1 = weight_variable([7 * 7 * 64, 1024])
b_fc1 = bias_variable([1024])

h_pool2_flat = tf.reshape(h_pool2, [-1, 7*7*64])
h_fc1 = tf.nn.relu(tf.matmul(h_pool2_flat, W_fc1) + b_fc1)

keep_prob = tf.placeholder("float")
h_fc1_drop = tf.nn.dropout(h_fc1, keep_prob)

W_fc2 = weight_variable([1024, 10])
b_fc2 = bias_variable([10])
h_fc2 = tf.matmul(h_fc1_drop, W_fc2) + b_fc2

y_conv = tf.nn.softmax(h_fc2)
cross_entropy = -tf.reduce_sum(y_*tf.log(y_conv))
correct_prediction = tf.equal(tf.argmax(y_conv, 1), tf.argmax(y_, 1))
accuracy = tf.reduce_mean(tf.cast(correct_prediction, "float"))


# In[ ]:


train_step = tf.train.AdamOptimizer(1e-4).minimize(cross_entropy)
sess.run(tf.initialize_all_variables())
finalRepresentations = []
train_step = tf.train.AdamOptimizer(1e-4).minimize(cross_entropy)
sess.run(tf.initialize_all_variables())
finalRepresentations = []
with open("weights.csv", 'w') as file:
    writer = csv.writer(file)
    depth = 10
    for i in range(500):
        batch = mnist.train.next_batch(1)
        if(i % 100 == 0):
            # print(batch[1].reshape(-1,1).tolist())
            indices = batch[1]
            y_matrix = tf.one_hot(indices, depth).eval(session=sess)
            train_accuracy = accuracy.eval(session=sess, feed_dict={
                x: batch[0], y_: y_matrix, keep_prob: 1.0})
            print("step %d, training accuracy %g" % (i, train_accuracy))
            weight = h_fc2.eval(session=sess, feed_dict={
                                x: mnist.test.images, keep_prob: 1.0})
            finalRepresentations.append(weight)
            writer.writerow(weight)
        train_step.run(session=sess, feed_dict={
            x: batch[0], y_: y_matrix, keep_prob: 0.5})

# print("test accuracy %g" % accuracy.eval(session=sess, feed_dict={
   #   x: mnist.test.images, y_: mnist.test.labels, keep_prob: 1.0}))
