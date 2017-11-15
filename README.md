# RxJs Subject Restrictions rule

> Custom rule for tslint

## NPM
[www.npmjs.com/package/tslint-rxjs-subject-restrictions-rule](https://www.npmjs.com/package/tslint-rxjs-subject-restrictions-rule)

## Description

Public access modifier for RxJS Subject is not allowed'.
The name of RxJS Subject variable must ends with "$".

## Example

*Right:*
```ts
import { BehaviorSubject } from "rxjs/BehaviorSubject";

class Car {
    private isActive$ = new BehaviorSubject({})
}
```

*Wrong:*
```ts
import { BehaviorSubject } from "rxjs/BehaviorSubject";

class Car {
    public isActive = new BehaviorSubject({})
}
```

## Installing / Getting started

Install:
```shell
npm i -D tslint-rxjs-subject-restrictions-rule
```

Edit your `tslint.json` file:
```json
"rulesDirectory": [
  "node_modules/tslint-rxjs-subject-restrictions-rule/dist"
],
"rules": {
    "rx-subject-restrictions": true
}
```

## Licensing

"The code in this project is licensed under MIT license."
