import sys

def zlog(m):
	savedstdo = sys.stdout
	with open("/Users/zach/Dev/ZACHSITE/ZachWebsite/z.log", "w") as f:
		sys.stdout = f
		print(m)
		sys.stdout = savedstdo