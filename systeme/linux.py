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
import shutil
import zipfile

dossier = "/home/xql/.zbackup"

def create():
    # REVIEW - Ajouté une gestion d'erreur si besoin en tant que dev principale pour le moment j'en vois pas l'utilité les module font bien leur travailles.
    chiffre = random.randint(0, 9999)
    chemin_actuel = getcwd()
    nombcp = f"backupzbc_{chiffre}"

    archive = shutil.make_archive(
        nombcp,
        "zip",
        f"{chemin_actuel}"
    )
    shutil.move(
        archive,
        f"/home/xql/.zbackup/{nombcp}.zip"
        )

def lists():
    contenue  = os.listdir(dossier)
    for element in contenue:
        print(element)

def restore():
    contenue  = os.listdir(dossier)
    for element in contenue:
        print(element)

    restore = input("Met le nom du fichier que tu veux recupèrer : ")

    if restore in element:
        fichierzip = f"/home/xql/.zbackup/{restore}"
        destination = getcwd()

        with zipfile.ZipFile(fichierzip, 'r') as zip_ref:
            zip_ref.extractall(destination)
            print("Restore Reussi")
            time.sleep(2)
    else:
        print("Désolé sais sois un mauvais nom sois une backup qui existe pas !")

def delt():
    contenue  = os.listdir(dossier)
    for element in contenue:
        print(element)

    delete = input("Met le nom du fichier que tu veux supprimé : ")

    if delete in element:
        fichierzip = f"/home/xql/.zbackup/{delete}"

        try:
            os.remove(fichierzip)
        except FileNotFoundError:
            print(f"Le dossier n'existe pas.")
        except PermissionError:
            print("Permission refusée (dossier système peut ètre verouiller)")

def linux() -> str:
    while True:
        dossier = "/home/xql/.zbackup"

        if os.path.isdir(dossier):
            choix = questionary.select(
                "Choisis ce que tu veux fair",
                [
                    "cree une backup de ton dossier actuel",
                    "voir la list des backup actuel",
                    "restore une backup",
                    "Delete une backup",
                    "Quit"
                ]
            ).ask()

            if choix == "cree une backup de ton dossier actuel":
                create()
                break

            elif choix == "voir la list des backup actuel":
                lists()
                break

            elif choix == "restore une backup":
                restore()
                break

            elif choix == "Delete une backup":
                delt()
                break

            elif choix == "Quit":
                break
        else:
            setup()


if __name__ == "__main__":
    linux()