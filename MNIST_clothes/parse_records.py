import numpy as np
import ast


def parse(epoch):
    f0format = epoch.replace("    ", ",").replace("   ", ",").replace(
        "  ", ",").replace(" ", ",").replace(",]", "]").replace(",,", ",").replace("[,", "[")
    # print(f0format)

    weight_len = f0format.index("]") + 1
    f00 = f0format[1:weight_len]
    f00_arr = np.array(ast.literal_eval(f00))
    epoch0_weights = [f00_arr]

    i = weight_len
    # print(len(f0format))
    while i + 1 < len(f0format):
        l_index = f0format.index("[", i)
        r_index = f0format.index("]", i) + 1
        el = f0format[l_index:r_index].replace("[[", "[")
        try:
            el_arr = np.array(ast.literal_eval(el))
            epoch0_weights.append(el_arr)
        except:
            print("error parsing ", el)
            print("\n")
        i = r_index
        # print(el_arr)
        # print(i)
    return epoch0_weights
    # print(f00_arr)


def parse_all(fname):
    f = open(fname)
    fstring = f.read().replace("\n", "")
    flist = fstring.split(",")

    finalReps = []
    for i in range(len(flist)):
        # print(flist[i])
        finalReps.append(parse(flist[i]))
    # print(finalReps)
    return finalReps


if __name__ == "__main__":
    parse_all()
