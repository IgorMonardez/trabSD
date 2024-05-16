import rpyc
import sys

if len(sys.argv) < 2:
    exit("Usage {} SERVER".format(sys.argv[0]))

server = sys.argv[1]
conn = rpyc.connect('172.17.0.1', 18861)
print(conn.root)
print(conn.root.get_answer())
print(conn.root.the_real_answer_though)
