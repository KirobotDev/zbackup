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

def linux():
    dossier = "/dev/zbackup"
    if os.path.isdir(dossier):
        print("Linux is off in time sorry i waiting contributor")
    else:
        setup()

if __name__ == "__main__":
    linux()