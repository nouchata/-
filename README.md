# 𝕗𝕥_𝕥𝕣𝕒𝕟𝕤𝕔𝕖𝕟𝕕𝕖𝕟𝕔𝕖 ✨ ✨
[![Transcendence tests](https://github.com/nouchata/ft_transcendence/actions/workflows/test.yml/badge.svg)](https://github.com/nouchata/ft_transcendence/actions/workflows/test.yml)
![https://fr.reactjs.org/](https://img.shields.io/badge/front--end-React-critical) ![https://nestjs.com/](https://img.shields.io/badge/back--end-NestJS-informational) ![https://www.typescriptlang.org/](https://img.shields.io/badge/powered%20with-TypeScript-blueviolet)

**Last common core project 🙌**

`i.e. make a singlepage app feat. a multiplayer pong game`

## How to run the project

you need _docker_ and _docker-compose_.

You have to setup a file named `.env` at the root of the project with those fields filled:

```env
APP_PORT=8080
DB_PASS=password
COOKIE_SECRET=cookie_secret
UID_42=yours
SECRET_42=yours
CALLBACK_URL_42=http://localhost:8080/login/
```

then you can run

```sh
docker-compose up
```

## How to setup dev environement

### backend

You need a working SQL database and yarn

You need to create a dev.env in _./requirements/backend_ containing those fields:
```env
RUN_ENV=DEV

# DB CONFIG

DB_HOSTNAME=database
DB_PORT=5432
DB_ROOT_PASS=
DB_NAME=transdb
DB_USER=nestjs
DB_PASS=

# BACKEND CONFIG

FRONTEND_ADDRESS=http://localhost:3001
BACKEND_PORT=3000
COOKIE_SECRET=

# 42 AUTH CONFIG

UID_42=
SECRET_42=
CALLBACK_URL_42=http://localhost:3001/login/

```

run 

```sh
yarn install
```

now you are ready to launch backend

```sh
yarn start:dev
```


### frontend

you need to setup the dev *backend* and yarn

you need to setup a file named dev.env in _./requirements/backend_ with those fields:

```
REACT_APP_BACKEND_ADDRESS=http://localhost:3000
```

run 

```sh
yarn install
```

now you are ready to launch frontend

```sh
yarn start
```
