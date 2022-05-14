# Raumplan 2.0 Server

![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)

Dies ist das Backend für den [Raumplan 2.0](https://github.com/NilsGke/raumplan2). Es gibt zwei Versionen:

## Lokale Datenspeicherung

Das [LocalBackend](https://github.com/NilsGke/raumplan2Server/blob/master/localBackend.js) benutzt lokale json Dateien um die Daten zu speichern.
Standartmaßgig ist im `package.json`, das lokale backend als Standard festgelegt. Für den Release wird allerdings auf jeden fall die SQL Datenbank verwendet, da diese um einiges sicherer ist und nicht einfach durch falsche Benutzereingaben zerschossen werden kann.

## SQL Datenspeicherung

Das [dbBackend](https://github.com/NilsGke/raumplan2Server/blob/master/dbBackend.js) benutzt als Speicherort eine lokal angelegte Datenbank.
