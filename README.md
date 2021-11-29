# 𝕗𝕥_𝕥𝕣𝕒𝕟𝕤𝕔𝕖𝕟𝕕𝕖𝕟𝕔𝕖 ✨ ✨
![https://fr.reactjs.org/](https://img.shields.io/badge/front--end-React-critical) ![https://nestjs.com/](https://img.shields.io/badge/back--end-NestJS-informational) ![https://www.typescriptlang.org/](https://img.shields.io/badge/powered%20with-TypeScript-blueviolet)

**Last common core project 🙌**

`i.e. make a singlepage app feat. a multiplayer pong game`

## Trivia resources :
- ![How to get NodeJS 16 on Ubuntu](https://joshtronic.com/2021/05/09/how-to-install-nodejs-16-on-ubuntu-2004-lts/)
- ![React + Nest + Typescript intro in 2 parts (meant to be read after learning React and Nest I guess)](https://auth0.com/blog/modern-full-stack-development-with-nestjs-react-typescript-and-mongodb-part-1/)

## How to run the project 101

You need docker and docker compose `AND` you need to setup two .env at the root of the project (one in _requirements/backend_ and _requirements/frontend_) :

__The backend one :__
```
RUN_ENV=TEST

# DB CONFIG

DB_HOSTNAME=database
DB_PORT=5432
DB_ROOT_PASS=
DB_NAME=transdb
DB_USER=nestjs
DB_PASS=

# BACKEND CONFIG

BACKEND_PORT=3000
COOKIE_SECRET=
FRONTEND_ADDRESS=http://localhost:3001

# FRONTEND CONFIG

BACKEND_ADDRESS=http://localhost:3000

# 42 AUTH CONFIG

UID_42=
SECRET_42=
CALLBACK_URL_42=http://localhost:3000/auth/redirect/


```
__The frontend one :__
```
REACT_APP_BACKEND_ADDRESS=http://localhost:4000
```


then run
```sh
docker-compose up
```
