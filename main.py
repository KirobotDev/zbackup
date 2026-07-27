from os import getcwd
import os
import time
import sqlite3
import random
import questionary
import pathlib
from colorama import Fore
import platform
from setup import setup
from systeme.win import main_win
from systeme.linux import linux

os_oss = platform.system()

print(os_oss)

if os_oss == "Windows":
    if __name__ == "__main__":
        main_win()
elif os_oss == "Linux":
    if __name__ == "__main__":
        linux()
else:
    print("Vous n'ette pas encore pris en charge !")