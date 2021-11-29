# 𝕗𝕥_𝕥𝕣𝕒𝕟𝕤𝕔𝕖𝕟𝕕𝕖𝕟𝕔𝕖 ✨ ✨
![https://fr.reactjs.org/](https://img.shields.io/badge/front--end-React-critical) ![https://nestjs.com/](https://img.shields.io/badge/back--end-NestJS-informational) ![https://www.typescriptlang.org/](https://img.shields.io/badge/powered%20with-TypeScript-blueviolet)

**Last common core project 🙌**

`i.e. make a singlepage app feat. a multiplayer pong game`

## Trivia resources :
- ![How to get NodeJS 16 on Ubuntu](https://joshtronic.com/2021/05/09/how-to-install-nodejs-16-on-ubuntu-2004-lts/)
- ![React + Nest + Typescript intro in 2 parts (meant to be read after learning React and Nest I guess)](https://auth0.com/blog/modern-full-stack-development-with-nestjs-react-typescript-and-mongodb-part-1/)

## How to run the project

you need _docker_ and _docker-compose_.

You have to setup a file named `.env` at the root of the project with those fields filled:

```env
RUN_ENV=PROD

# DB CONFIG

DB_HOSTNAME=database
DB_PORT=5432
DB_ROOT_PASS=
DB_NAME=transdb
DB_USER=nestjs
DB_PASS=

# BACKEND CONFIG

FRONTEND_ADDRESS=http://localhost
BACKEND_PORT=3000
COOKIE_SECRET=

# FRONTEND CONFIG

REACT_APP_BACKEND_ADDRESS=http://localhost:3000

# 42 AUTH CONFIG

UID_42=
SECRET_42=
CALLBACK_URL_42=http://localhost/login/

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
