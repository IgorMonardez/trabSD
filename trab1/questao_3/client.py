import rpyc

conn = rpyc.connect('localhost', 18861)
print(conn.root.get_question())
