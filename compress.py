import tinify
import os

def transform_size(size):
    return round(size / 1024. / 1024., 2)

tinify.key = 'jZ0CFL9WmLgQ6wmP6h7ngx1knqstfvFR' 
#"Hong-Kong", "Japan", "Maldives", "Sanya", "Shanghai", "Wuhan", 

path = "E:\\OneDrive\\blog\\source\\_posts\\Travel-Notes-of-Chengdu"
for dirpath, dirs, files in os.walk(path):
    files = list(files)
    for file in files:
        imgpath = os.path.join(dirpath, file)
        original_size = os.path.getsize(imgpath)
        if original_size < 5 * 1024 * 1024:
            print("skip ", imgpath, "with size", transform_size(original_size))
        else:
            print("compressing ...", imgpath, "with size", transform_size(original_size))
            tinify.from_file(imgpath).to_file(imgpath)
            new_size = os.path.getsize(imgpath)
            print ("new size", transform_size(new_size))