import sys

def zlog(m):
    savedstdo = sys.stdout
    with open("/home/zachsnyderdev/zachsite/geopost/z.log", "w") as f:
        sys.stdout = f
        print(m)
        sys.stdout = savedstdo
