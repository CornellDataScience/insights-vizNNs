import tensorflow as tf
from tensorflow import keras
import csv
import numpy as np
import sys


# Python optimisation variables
learning_rate = 0.00146
# epochs = 10
batch_size = 50

# declare the training data placeholders
# input x - for 28 x 28 pixels = 784 - this is the flattened image data that is drawn from
# mnist.train.nextbatch()
x = tf.placeholder(tf.float32, [None, 784])
# dynamically reshape the input
x_shaped = tf.reshape(x, [-1, 28, 28, 1])
# now declare the output data placeholder - 10 digits
y = tf.placeholder(tf.float32, [None, 10])


def create_new_conv_layer(input_data, num_input_channels, num_filters, filter_shape, pool_shape, name):
  # setup the filter input shape for tf.nn.conv_2d
    conv_filt_shape = [filter_shape[0], filter_shape[1], num_input_channels,
                       num_filters]

    # initialise weights and bias for the filter
    weights = tf.Variable(tf.truncated_normal(conv_filt_shape, stddev=0.03),
                          name=name+'_W')
    bias = tf.Variable(tf.truncated_normal([num_filters]), name=name+'_b')

    # setup the convolutional layer operation
    out_layer = tf.nn.conv2d(input_data, weights, [1, 1, 1, 1], padding='SAME')

    # add the bias
    out_layer += bias

    # apply a ReLU non-linear activation
    out_layer = tf.nn.relu(out_layer)

    # now perform max pooling
    ksize = [1, pool_shape[0], pool_shape[1], 1]
    strides = [1, 2, 2, 1]
    out_layer = tf.nn.max_pool(out_layer, ksize=ksize, strides=strides,
                               padding='SAME')

    return out_layer


fashion_mnist = keras.datasets.fashion_mnist
(train_images, train_labels), (test_images,
                               test_labels) = fashion_mnist.load_data()

train_images = train_images.reshape(-1, 784)
test_images = test_images.reshape(-1, 784)

# create some convolutional layers
layer1 = create_new_conv_layer(
    x_shaped, 1, 32, [5, 5], [2, 2], name='layer1')
layer2 = create_new_conv_layer(
    layer1, 32, 64, [5, 5], [2, 2], name='layer2')

flattened = tf.reshape(layer2, [-1, 7 * 7 * 64])

# setup some weights and bias values for this layer, then activate with ReLU
wd1 = tf.Variable(tf.truncated_normal(
    [7 * 7 * 64, 1000], stddev=0.03), name='wd1')
bd1 = tf.Variable(tf.truncated_normal([1000], stddev=0.01), name='bd1')
dense_layer1 = tf.matmul(flattened, wd1) + bd1
dense_layer1 = tf.nn.relu(dense_layer1)

# another layer with softmax activations
wd2 = tf.Variable(tf.truncated_normal([1000, 10], stddev=0.03), name='wd2')
bd2 = tf.Variable(tf.truncated_normal([10], stddev=0.01), name='bd2')
dense_layer2 = tf.matmul(dense_layer1, wd2) + bd2
y_ = tf.nn.softmax(dense_layer2)

cross_entropy = tf.reduce_mean(
    tf.nn.softmax_cross_entropy_with_logits(logits=dense_layer2, labels=y))

# add an optimiser
optimiser = tf.train.AdamOptimizer(
    learning_rate=learning_rate).minimize(cross_entropy)

# define an accuracy assessment operation
correct_prediction = tf.equal(tf.argmax(y, 1), tf.argmax(y_, 1))
accuracy = tf.reduce_mean(tf.cast(correct_prediction, tf.float32))

# setup the initialisation operator
init_op = tf.global_variables_initializer()

depth = 10
finalReps = []

saver = tf.train.Saver()


def train_network(fname, epochs=10):
    # build_model()
    # file.write("test")
    with tf.Session() as sess:
        # initialise the variables
        print("starting session")
        sess.run(init_op)
        total_batch = int(len(train_labels) / batch_size)
        for epoch in range(5):
            print("starting epcoh:", (epoch+1))
            avg_cost = 0
            for i in range(total_batch):
                # print("batch ", (i+1))
                if (i % 100 == 0):
                    print("batch ", i)
                batch_x = train_images[25*i:25*(i+1)]
                batch_y = train_labels[25*i:25*(i+1)]
                indices = batch_y
                y_matrix = tf.one_hot(indices, depth).eval(session=sess)
                # print("encoding scores")
                _, c = sess.run([optimiser, cross_entropy],
                                feed_dict={x: batch_x, y: y_matrix})
                avg_cost += c / total_batch
            y_test_matrix = tf.one_hot(
                test_labels[:100], depth).eval(session=sess)
            test_acc = sess.run(accuracy,
                                feed_dict={x: test_images[:100], y: y_test_matrix})
            print("Epoch:", (epoch + 1), "cost =", "{:.3f}".format(avg_cost),
                  "test accuracy: {: .3f}".format(test_acc))

            weight_c1 = layer1.eval(session=sess, feed_dict={
                x: test_images[:500]})
            np.save("convLayer1_epoch_"+str(epoch), weight_c1)

            weight_c2 = layer2.eval(session=sess, feed_dict={
                x: test_images[:500]})
            np.save("convLayer2_epoch_"+str(epoch), weight_c2)

            weight_l1 = dense_layer1.eval(session=sess, feed_dict={
                x: test_images[:500]})
            # finalReps.append(weight)
            print("weights 1 at epoch: ", weight_l1)
            weights_str = list(
                map(lambda x: np.array2string(np.array(x), separator=","), weight_l1))
            np.save("denseLayer1_epoch_"+str(epoch), weight_l1)

            weight_l2 = dense_layer2.eval(session=sess, feed_dict={
                x: test_images[:500]})
            print("weights at epoch: ", weight_l2)
            weights_str = list(
                map(lambda x: np.array2string(np.array(x), separator=","), weight_l2))
            #file.write(np.array2string(np.array(weights_str), separator=","))
            save_path = saver.save(sess, "/tmp/model_clothes.ckpt")
            # file.write('\n')
            np.save("denseLayer2_epoch_"+str(epoch), weight_l2)

        print("\nTraining complete!")
        """ print(sess.run(accuracy, feed_dict={
                x: test_images, y: test_labels})) """


def load_data(f_name):
    # build_model()
    with open(f_name, 'w') as file:
        with tf.Session() as sess:
            print("restoring previous session\n\n")
            saver.restore(sess, "/tmp/model_clothes.ckpt")

            file.write("layer1\n")
            weight_1 = dense_layer1.eval(session=sess, feed_dict={
                x: mnist.test.images[:500]})
            weights_str = list(
                map(lambda x: np.array2string(np.array(x), separator=","), weight))
            file.write(np.array2string(np.array(weights_str), separator=","))
            file.write('\n')

            file.write("layer2\n")
            weight_2 = dense_layer2.eval(session=sess, feed_dict={
                x: mnist.test.images[:500]})
            weights_str = list(
                map(lambda x: np.array2string(np.array(x), separator=","), weight_2))
            file.write(np.array2string(np.array(weights_str), separator=","))
            file.write('\n')


if __name__ == "__main__":
    act = str(sys.argv[1])
    print(act)
    #fname = str(sys.argv[2])
    if act == "train":
        train_network("")
    elif act == "load":
        load_data(fname)
