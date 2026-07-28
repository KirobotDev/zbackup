import os
import platform
import time

def setup():
    print("Salut L'installation pour", platform.system(), "Est entrain d'ètre effectué")

    if platform.system() == "Windows":
        os.mkdir("C:\\zbackup")
        time.sleep(2)
        print("Installation Windows Terminé")
        time.sleep(2)
    elif platform.system() == "Linux":
        os.mkdir("/home/zbc/.zbackup")
        time.sleep(2)
        print("Installation Linux Terminé")
        time.sleep(2)
    else:
        print("Votre os n'est pas pris en charge")
        time.sleep(2)

if __name__ == "__main__":
    setup()