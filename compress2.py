import tinify
import os

tinify.key = 'NK64KxDHC7xpbQ3vtlb4l3SsWl0tyVnB' 
#"Hong-Kong", "Japan", "Maldives", "Sanya", "Shanghai", "Wuhan", 

path = "E:\\OneDrive\\blog\\source\\_posts\\Travel-Notes-of-Yantai"
for dirpath, dirs, files in os.walk(path):
    files = list(reversed(files))
    print (files)
    for file in files:
        imgpath = os.path.join(dirpath, file)
        if os.path.getsize(imgpath) < 2 * 1024 * 1024:
            print("skip ", imgpath)
        else:
            print("compressing ...", imgpath)
            tinify.from_file(imgpath).to_file(imgpath)